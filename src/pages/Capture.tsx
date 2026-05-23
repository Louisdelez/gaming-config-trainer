import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera, Video, Square, Loader2, Check, AlertCircle, Rewind, Keyboard, Settings as SettingsIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useSettings } from "../store/settings";
import {
  captureScreenshot, startRecording, startReplayBuffer, detectEncoders,
  type EncoderId, type RecordingHandle, type ReplayBufferHandle,
} from "../lib/capture";
import {
  registerCaptureHotkeys, unregisterCaptureHotkeys,
  HOTKEY_SCREENSHOT, HOTKEY_RECORD, HOTKEY_REPLAY,
} from "../lib/hotkeys";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "ok"; msg: string; path?: string }
  | { kind: "err"; msg: string };

const ENCODER_LABEL: Record<EncoderId, string> = {
  h264_nvenc: "NVIDIA NVENC",
  h264_amf:   "AMD AMF",
  h264_qsv:   "Intel QuickSync",
  h264_mf:    "Media Foundation",
  libx264:    "libx264 (CPU)",
};

export default function Capture() {
  const captureFolder  = useSettings((s) => s.captureFolder);
  const captureAudio   = useSettings((s) => s.captureAudio);
  const replayEnabled  = useSettings((s) => s.replayEnabled);
  const replaySeconds  = useSettings((s) => s.replaySeconds);
  const captureEncoder = useSettings((s) => s.captureEncoder);
  const captureFps     = useSettings((s) => s.captureFps);
  const captureBitrate = useSettings((s) => s.captureBitrate);
  const setReplayEnabled = useSettings((s) => s.setReplayEnabled);

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [, setAvailable] = useState<EncoderId[]>([]);
  const recordRef = useRef<RecordingHandle | null>(null);
  const replayRef = useRef<ReplayBufferHandle | null>(null);
  const [recording, setRecording] = useState(false);
  const [replayActive, setReplayActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedTimer = useRef<number | null>(null);

  // Detect encoders on mount (informational; user-selected via Settings)
  useEffect(() => { detectEncoders().then(setAvailable); }, []);

  // Elapsed timer
  useEffect(() => {
    if (!recording) {
      if (elapsedTimer.current) { clearInterval(elapsedTimer.current); elapsedTimer.current = null; }
      return;
    }
    setElapsed(0);
    const start = performance.now();
    elapsedTimer.current = window.setInterval(() => {
      setElapsed(Math.floor((performance.now() - start) / 1000));
    }, 250);
    return () => {
      if (elapsedTimer.current) { clearInterval(elapsedTimer.current); elapsedTimer.current = null; }
    };
  }, [recording]);

  // Auto-clear toast
  useEffect(() => {
    if (status.kind === "ok" || status.kind === "err") {
      const t = setTimeout(() => setStatus({ kind: "idle" }), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const detail = (e: any) => typeof e === "string" ? e : (e?.message || JSON.stringify(e).slice(0, 200));

  const handleScreenshot = useCallback(async () => {
    setStatus({ kind: "busy", msg: "Capture de l'écran…" });
    try {
      const path = await captureScreenshot(captureFolder || undefined);
      if (!path) { setStatus({ kind: "idle" }); return; }
      setStatus({ kind: "ok", msg: "Screenshot enregistré", path });
    } catch (e: any) {
      console.error("[capture] screenshot failed:", e);
      setStatus({ kind: "err", msg: `Erreur capture: ${detail(e)}` });
    }
  }, [captureFolder]);

  const handleStartRecording = useCallback(async () => {
    setStatus({ kind: "busy", msg: "Démarrage enregistrement…" });
    try {
      const handle = await startRecording({
        encoder: captureEncoder as EncoderId,
        fps: captureFps,
        bitrateKbps: captureBitrate,
        audio: captureAudio,
        defaultFolder: captureFolder || undefined,
      });
      if (!handle) { setStatus({ kind: "idle" }); return; }
      recordRef.current = handle;
      setRecording(true);
      setStatus({ kind: "ok", msg: "Enregistrement en cours…" });
    } catch (e: any) {
      console.error("[capture] startRecording failed:", e);
      setStatus({ kind: "err", msg: `Erreur démarrage: ${detail(e)}` });
    }
  }, [captureEncoder, captureFps, captureBitrate, captureAudio, captureFolder]);

  const handleStopRecording = useCallback(async () => {
    const handle = recordRef.current;
    if (!handle) return;
    setStatus({ kind: "busy", msg: "Finalisation du MP4…" });
    setRecording(false);
    try {
      const result = await handle.stop();
      recordRef.current = null;
      setStatus({ kind: "ok", msg: `Vidéo enregistrée (${result.durationSec}s)`, path: result.path });
    } catch (e: any) {
      console.error("[capture] stop failed:", e);
      setStatus({ kind: "err", msg: `Erreur stop: ${detail(e)}` });
    }
  }, []);

  const toggleRecord = useCallback(() => {
    if (recordRef.current) handleStopRecording();
    else handleStartRecording();
  }, [handleStartRecording, handleStopRecording]);

  /* ---------- Replay buffer ---------- */
  const startReplay = useCallback(async () => {
    setStatus({ kind: "busy", msg: "Démarrage buffer replay…" });
    try {
      const h = await startReplayBuffer({
        encoder: captureEncoder as EncoderId,
        fps: captureFps,
        bitrateKbps: captureBitrate,
        audio: captureAudio,
        seconds: replaySeconds,
        defaultFolder: captureFolder || undefined,
      });
      replayRef.current = h;
      setReplayActive(true);
      setStatus({ kind: "ok", msg: `Replay buffer actif (${replaySeconds}s)` });
    } catch (e: any) {
      console.error("[replay] start failed:", e);
      setStatus({ kind: "err", msg: `Erreur replay: ${detail(e)}` });
    }
  }, [captureEncoder, captureFps, captureBitrate, captureAudio, replaySeconds, captureFolder]);

  const stopReplay = useCallback(async () => {
    const h = replayRef.current;
    if (!h) return;
    try { await h.stop(); } catch (e) { console.error(e); }
    replayRef.current = null;
    setReplayActive(false);
    setStatus({ kind: "ok", msg: "Replay buffer arrêté" });
  }, []);

  const saveReplay = useCallback(async () => {
    const h = replayRef.current;
    if (!h) {
      setStatus({ kind: "err", msg: "Buffer replay non actif" });
      return;
    }
    setStatus({ kind: "busy", msg: "Sauvegarde clip replay…" });
    try {
      const outPath = await h.saveClip();
      if (!outPath) { setStatus({ kind: "idle" }); return; }
      setStatus({ kind: "ok", msg: `Clip de ${h.seconds}s sauvegardé`, path: outPath });
    } catch (e: any) {
      console.error("[replay] save failed:", e);
      setStatus({ kind: "err", msg: `Erreur save replay: ${detail(e)}` });
    }
  }, []);

  /* ---------- Hotkeys ---------- */
  useEffect(() => {
    registerCaptureHotkeys({
      onScreenshot: handleScreenshot,
      onRecordToggle: toggleRecord,
      onReplay: saveReplay,
    });
    return () => { unregisterCaptureHotkeys(); };
  }, [handleScreenshot, toggleRecord, saveReplay]);

  /* ---------- Sync replayEnabled with actual buffer state ---------- */
  useEffect(() => {
    if (replayEnabled && !replayActive && !replayRef.current) startReplay();
    else if (!replayEnabled && replayActive) stopReplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayEnabled]);

  return (
    <>
      <PageHeader
        icon={Video}
        title="Capture"
        subtitle="Screenshot, recording et replay buffer • paramètres dans la page Paramètres"
      />

      {/* INFO BAR — folder + settings link */}
      <div className="bg-[#181818] rounded-xl p-3 mb-4 flex items-center gap-3 text-xs">
        <span className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Dossier</span>
        <span className="font-mono text-white truncate flex-1">{captureFolder || "(non configuré)"}</span>
        <Link to="/settings" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-[10px] uppercase font-bold transition-colors" style={{ letterSpacing: "1.4px" }}>
          <SettingsIcon className="w-3 h-3" /> Paramètres
        </Link>
      </div>

      {/* 3 ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ActionCard
          icon={Camera}
          title="Screenshot"
          subtitle={`Hotkey ${HOTKEY_SCREENSHOT}`}
          desc="PNG plein écran, qualité max."
          buttonLabel="Capturer"
          onClick={handleScreenshot}
          disabled={status.kind === "busy"}
        />

        <ActionCard
          icon={Video}
          title="Enregistrement"
          subtitle={`Hotkey ${HOTKEY_RECORD}`}
          desc={recording
            ? `🔴 REC • ${formatElapsed(elapsed)} • ${ENCODER_LABEL[captureEncoder as EncoderId] ?? captureEncoder}`
            : `${ENCODER_LABEL[captureEncoder as EncoderId] ?? captureEncoder} • ${captureFps} FPS • ${captureBitrate / 1000} Mbps`}
          buttonLabel={recording ? "Arrêter" : "Démarrer"}
          onClick={recording ? handleStopRecording : handleStartRecording}
          danger={recording}
          disabled={status.kind === "busy"}
        />

        <ActionCard
          icon={Rewind}
          title="Replay buffer"
          subtitle={`Hotkey ${HOTKEY_REPLAY}`}
          desc={replayActive
            ? `🟢 Actif (last ${replaySeconds}s) • ${HOTKEY_REPLAY} pour sauver`
            : `Style ShadowPlay • garde les ${replaySeconds}s dernières`}
          buttonLabel={replayActive ? "Sauver clip" : "Activer"}
          onClick={replayActive ? saveReplay : () => setReplayEnabled(true)}
          active={replayActive}
          disabled={status.kind === "busy"}
        />
      </div>

      {/* HOTKEYS BANNER */}
      <div className="bg-[#0e2a18] border border-[#1ed760] rounded-xl p-4 mb-6 flex items-start gap-3">
        <Keyboard className="w-5 h-5 text-[#1ed760] shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="text-[#1ed760] font-bold mb-1">Hotkeys globaux (actifs même quand le jeu a le focus)</div>
          <div className="text-white space-x-3">
            <Kbd>{HOTKEY_SCREENSHOT}</Kbd> Screenshot
            <Kbd>{HOTKEY_RECORD}</Kbd> Start/Stop record
            <Kbd>{HOTKEY_REPLAY}</Kbd> Save replay
          </div>
        </div>
      </div>

      {/* QUICK LINK TO LIBRARY */}
      <div className="bg-[#181818] rounded-xl p-5 text-center">
        <p className="text-sm text-[#b3b3b3] mb-3">Retrouve toutes tes captures dans la</p>
        <Link to="/library" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform" style={{ letterSpacing: "1.4px" }}>
          <Video className="w-4 h-4" /> Bibliothèque
        </Link>
      </div>

      {status.kind !== "idle" && <StatusToast status={status} />}
    </>
  );
}

/* ============================================================
   Subcomponents
   ============================================================ */

function ActionCard({ icon: Icon, title, subtitle, desc, buttonLabel, onClick, disabled, danger, active }: {
  icon: any; title: string; subtitle: string; desc: string; buttonLabel: string;
  onClick: () => void; disabled?: boolean; danger?: boolean; active?: boolean;
}) {
  const ringClass = danger ? "ring-1 ring-[#f3727f]" : active ? "ring-1 ring-[#1ed760]" : "";
  const iconBg = danger ? "bg-[#f3727f] animate-pulse" : "bg-[#1ed760]";
  const btnClass = danger
    ? "bg-[#f3727f] hover:scale-105 text-black"
    : "bg-[#1ed760] hover:scale-105 text-black disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed";
  return (
    <div className={`bg-[#181818] rounded-xl p-5 flex flex-col gap-3 ${ringClass}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">{subtitle}</div>
          <div className="text-base font-extrabold text-white">{title}</div>
        </div>
      </div>
      <p className="text-xs text-[#b3b3b3] flex-1 min-h-[2.5em]">{desc}</p>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase transition-transform ${btnClass}`}
        style={{ letterSpacing: "1.4px" }}
      >
        {danger ? <Square className="w-3.5 h-3.5 fill-current" /> : <Icon className="w-3.5 h-3.5" />}
        {buttonLabel}
      </button>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2 py-0.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded font-mono text-[10px] font-bold text-[#1ed760]">{children}</span>
  );
}

function StatusToast({ status }: { status: Exclude<Status, { kind: "idle" }> }) {
  const colors = {
    busy: { bg: "#1f1f1f", border: "#1ed760", text: "text-white",     Icon: Loader2 },
    ok:   { bg: "#0e2a18", border: "#1ed760", text: "text-[#1ed760]", Icon: Check },
    err:  { bg: "#2a0e10", border: "#f3727f", text: "text-[#f3727f]", Icon: AlertCircle },
  } as const;
  const c = colors[status.kind];
  const Icon = c.Icon;
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-bold ${c.text} max-w-sm`} style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px" }}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 shrink-0 ${status.kind === "busy" ? "animate-spin" : ""}`} />
        <span>{status.msg}</span>
      </div>
      {status.kind === "ok" && status.path && (
        <div className="mt-1 text-[10px] text-[#b3b3b3] font-mono break-all">{status.path}</div>
      )}
    </div>
  );
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}
