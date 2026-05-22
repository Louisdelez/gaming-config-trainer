import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera, Video, Square, Loader2, Check, AlertCircle, Folder, Cpu, Gauge, Film,
  Keyboard, Trash2, Rewind, Mic, MicOff,
} from "lucide-react";
import { openPath } from "@tauri-apps/plugin-opener";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
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
import { dbListCaptures, dbDeleteCapture, type DbCaptureRow } from "../lib/db";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "ok"; msg: string; path?: string }
  | { kind: "err"; msg: string };

const ENCODER_LABEL: Record<EncoderId, string> = {
  h264_nvenc: "NVIDIA NVENC (GPU)",
  h264_amf:   "AMD AMF (GPU)",
  h264_qsv:   "Intel QuickSync (GPU)",
  h264_mf:    "Windows Media Foundation",
  libx264:    "libx264 (CPU, max compat)",
};

const FPS_OPTIONS = [30, 60, 120, 144];
const BITRATE_OPTIONS = [4000, 8000, 12000, 20000, 30000];

export default function Capture() {
  const captureFolder = useSettings((s) => s.captureFolder);
  const captureAudio  = useSettings((s) => s.captureAudio);
  const replayEnabled = useSettings((s) => s.replayEnabled);
  const replaySeconds = useSettings((s) => s.replaySeconds);
  const setCaptureFolder = useSettings((s) => s.setCaptureFolder);
  const setCaptureAudio  = useSettings((s) => s.setCaptureAudio);
  const setReplayEnabled = useSettings((s) => s.setReplayEnabled);
  const setReplaySeconds = useSettings((s) => s.setReplaySeconds);

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [available, setAvailable] = useState<EncoderId[]>([]);
  const [encoder, setEncoder] = useState<EncoderId>("h264_mf");
  const [fps, setFps] = useState(60);
  const [bitrate, setBitrate] = useState(12000);
  const [history, setHistory] = useState<DbCaptureRow[]>([]);
  const recordRef = useRef<RecordingHandle | null>(null);
  const replayRef = useRef<ReplayBufferHandle | null>(null);
  const [recording, setRecording] = useState(false);
  const [replayActive, setReplayActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedTimer = useRef<number | null>(null);
  const refreshHistory = useCallback(async () => {
    try { setHistory(await dbListCaptures(50)); }
    catch (e) { console.error(e); }
  }, []);

  // Detect encoders on mount
  useEffect(() => {
    detectEncoders().then((list) => {
      setAvailable(list);
      const pref: EncoderId[] = ["h264_nvenc", "h264_qsv", "h264_amf", "h264_mf", "libx264"];
      const best = pref.find((p) => list.includes(p));
      if (best) setEncoder(best);
    });
    refreshHistory();
  }, [refreshHistory]);

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
      refreshHistory();
      setStatus({ kind: "ok", msg: "Screenshot enregistré", path });
    } catch (e: any) {
      console.error("[capture] screenshot failed:", e);
      setStatus({ kind: "err", msg: `Erreur capture: ${detail(e)}` });
    }
  }, [captureFolder, refreshHistory]);

  const handleStartRecording = useCallback(async () => {
    setStatus({ kind: "busy", msg: "Démarrage enregistrement…" });
    try {
      const handle = await startRecording({
        encoder, fps, bitrateKbps: bitrate,
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
  }, [encoder, fps, bitrate, captureAudio, captureFolder]);

  const handleStopRecording = useCallback(async () => {
    const handle = recordRef.current;
    if (!handle) return;
    setStatus({ kind: "busy", msg: "Finalisation du MP4…" });
    setRecording(false);
    try {
      const result = await handle.stop();
      recordRef.current = null;
      refreshHistory();
      setStatus({ kind: "ok", msg: `Vidéo enregistrée (${result.durationSec}s)`, path: result.path });
    } catch (e: any) {
      console.error("[capture] stop failed:", e);
      setStatus({ kind: "err", msg: `Erreur stop: ${detail(e)}` });
    }
  }, [refreshHistory]);

  const toggleRecord = useCallback(() => {
    if (recordRef.current) handleStopRecording();
    else handleStartRecording();
  }, [handleStartRecording, handleStopRecording]);

  /* ---------- Replay buffer ---------- */
  const startReplay = useCallback(async () => {
    setStatus({ kind: "busy", msg: "Démarrage buffer replay…" });
    try {
      const h = await startReplayBuffer({
        encoder, fps, bitrateKbps: bitrate,
        audio: captureAudio, seconds: replaySeconds,
        defaultFolder: captureFolder || undefined,
      });
      replayRef.current = h;
      setReplayActive(true);
      setStatus({ kind: "ok", msg: `Replay buffer actif (${replaySeconds}s)` });
    } catch (e: any) {
      console.error("[replay] start failed:", e);
      setStatus({ kind: "err", msg: `Erreur replay: ${detail(e)}` });
    }
  }, [encoder, fps, bitrate, captureAudio, replaySeconds, captureFolder]);

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
      refreshHistory();
      setStatus({ kind: "ok", msg: `Clip de ${h.seconds}s sauvegardé`, path: outPath });
    } catch (e: any) {
      console.error("[replay] save failed:", e);
      setStatus({ kind: "err", msg: `Erreur save replay: ${detail(e)}` });
    }
  }, [refreshHistory]);

  /* ---------- Hotkeys ---------- */
  useEffect(() => {
    registerCaptureHotkeys({
      onScreenshot: handleScreenshot,
      onRecordToggle: toggleRecord,
      onReplay: saveReplay,
    });
    return () => { unregisterCaptureHotkeys(); };
  }, [handleScreenshot, toggleRecord, saveReplay]);

  /* ---------- Persist replayEnabled change ---------- */
  useEffect(() => {
    if (replayEnabled && !replayActive && !replayRef.current) {
      startReplay();
    } else if (!replayEnabled && replayActive) {
      stopReplay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayEnabled]);

  /* ---------- Folder picker ---------- */
  const pickFolder = async () => {
    const dir = await openDialog({ directory: true, multiple: false });
    if (typeof dir === "string") setCaptureFolder(dir);
  };

  return (
    <>
      <PageHeader
        icon={Video}
        title="Capture"
        subtitle="Screenshots, recording et replay buffer via FFmpeg (gdigrab + hardware encoder)"
      />

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Screenshot */}
        <ActionCard
          icon={Camera}
          title="Screenshot"
          subtitle={`Hotkey ${HOTKEY_SCREENSHOT}`}
          desc="PNG plein écran, qualité max."
          buttonLabel="Capturer"
          onClick={handleScreenshot}
          disabled={status.kind === "busy"}
        />

        {/* Recording */}
        <ActionCard
          icon={Video}
          title="Enregistrement"
          subtitle={`Hotkey ${HOTKEY_RECORD}`}
          desc={recording
            ? `🔴 REC • ${formatElapsed(elapsed)} • ${ENCODER_LABEL[encoder]}`
            : `${ENCODER_LABEL[encoder]} • ${fps} FPS • ${bitrate / 1000} Mbps`}
          buttonLabel={recording ? "Arrêter" : "Démarrer"}
          onClick={recording ? handleStopRecording : handleStartRecording}
          danger={recording}
          disabled={status.kind === "busy"}
        />

        {/* Replay buffer */}
        <ActionCard
          icon={Rewind}
          title="Replay buffer"
          subtitle={`Hotkey ${HOTKEY_REPLAY}`}
          desc={replayActive
            ? `🟢 Actif (last ${replaySeconds}s) • Appuie ${HOTKEY_REPLAY} pour sauver`
            : `Style ShadowPlay • garde les ${replaySeconds}s dernières`}
          buttonLabel={replayActive ? "Sauver clip" : "Activer"}
          onClick={replayActive ? saveReplay : () => setReplayEnabled(true)}
          active={replayActive}
          disabled={status.kind === "busy"}
        />
      </div>

      {/* HOTKEYS INFO BANNER */}
      <div className="bg-[#0e2a18] border border-[#1ed760] rounded-xl p-4 mb-6 flex items-start gap-3">
        <Keyboard className="w-5 h-5 text-[#1ed760] shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="text-[#1ed760] font-bold mb-1">Hotkeys globaux actifs même quand le jeu a le focus</div>
          <div className="text-white space-x-3">
            <Kbd>{HOTKEY_SCREENSHOT}</Kbd> Screenshot
            <Kbd>{HOTKEY_RECORD}</Kbd> Start/Stop record
            <Kbd>{HOTKEY_REPLAY}</Kbd> Save replay
          </div>
        </div>
      </div>

      {/* VIDEO SETTINGS */}
      <h2 className="text-[11px] uppercase font-bold text-[#b3b3b3] mb-3" style={{ letterSpacing: "1.4px" }}>
        Paramètres vidéo
      </h2>
      <div className="bg-[#181818] rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field icon={Cpu} label="Encoder">
          <select
            value={encoder}
            onChange={(e) => setEncoder(e.target.value as EncoderId)}
            disabled={recording || replayActive}
            className="w-full px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-bold outline-none disabled:opacity-50"
          >
            {(["h264_nvenc","h264_amf","h264_qsv","h264_mf","libx264"] as EncoderId[]).map((id) => (
              <option key={id} value={id} disabled={!available.includes(id)}>
                {ENCODER_LABEL[id]}{!available.includes(id) ? " (non détecté)" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={Film} label="FPS">
          <select
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value, 10))}
            disabled={recording || replayActive}
            className="w-full px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-bold outline-none disabled:opacity-50"
          >
            {FPS_OPTIONS.map((v) => <option key={v} value={v}>{v} fps</option>)}
          </select>
        </Field>

        <Field icon={Gauge} label="Bitrate">
          <select
            value={bitrate}
            onChange={(e) => setBitrate(parseInt(e.target.value, 10))}
            disabled={recording || replayActive}
            className="w-full px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-bold outline-none disabled:opacity-50"
          >
            {BITRATE_OPTIONS.map((v) => <option key={v} value={v}>{(v / 1000).toFixed(0)} Mbps</option>)}
          </select>
        </Field>
      </div>

      {/* OUTPUT FOLDER + AUDIO + REPLAY DURATION */}
      <h2 className="text-[11px] uppercase font-bold text-[#b3b3b3] mb-3" style={{ letterSpacing: "1.4px" }}>
        Préférences
      </h2>
      <div className="bg-[#181818] rounded-xl p-5 mb-6 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-1.5">
            <Folder className="w-3 h-3" /> Dossier de sortie
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={captureFolder}
              onChange={(e) => setCaptureFolder(e.target.value)}
              placeholder="(vide = demander à chaque fois)"
              className="flex-1 px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-mono outline-none"
            />
            <button onClick={pickFolder} className="px-4 py-2 rounded bg-[#1ed760] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform" style={{ letterSpacing: "1.4px" }}>
              Parcourir
            </button>
            {captureFolder && (
              <button onClick={() => setCaptureFolder("")} className="px-4 py-2 rounded bg-[#1f1f1f] hover:bg-[#252525] text-white text-[11px] font-bold uppercase transition-colors" style={{ letterSpacing: "1.4px" }}>
                Effacer
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={captureAudio}
              onChange={(e) => setCaptureAudio(e.target.checked)}
              className="accent-[#1ed760] w-4 h-4"
            />
            {captureAudio ? <Mic className="w-4 h-4 text-[#1ed760]" /> : <MicOff className="w-4 h-4 text-[#b3b3b3]" />}
            <span className="text-sm font-bold text-white">Capturer audio système</span>
          </label>
          <span className="text-[10px] text-[#b3b3b3]">(nécessite "virtual-audio-capturer" installé — sinon vidéo silencieuse)</span>
        </div>

        <div className="pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-1.5">
            <Rewind className="w-3 h-3" /> Durée du replay buffer ({replaySeconds}s)
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={replaySeconds}
              onChange={(e) => setReplaySeconds(parseInt(e.target.value, 10))}
              disabled={replayActive}
              className="flex-1 accent-[#1ed760] h-1.5 disabled:opacity-50"
            />
            <span className="font-mono font-bold text-white w-12 text-right">{replaySeconds}s</span>
            <button
              onClick={() => setReplayEnabled(!replayEnabled)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-colors ${
                replayEnabled ? "bg-[#1ed760] text-black" : "bg-[#1f1f1f] text-white hover:bg-[#252525]"
              }`}
              style={{ letterSpacing: "1.4px" }}
            >
              {replayEnabled ? "Buffer ON" : "Buffer OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* HISTORY */}
      <h2 className="text-[11px] uppercase font-bold text-[#b3b3b3] mb-3 flex items-center justify-between" style={{ letterSpacing: "1.4px" }}>
        <span>Historique ({history.length})</span>
        <button onClick={refreshHistory} className="text-[#b3b3b3] hover:text-white text-[10px] font-normal">⟳ Refresh</button>
      </h2>
      <div className="bg-[#181818] rounded-xl overflow-hidden mb-6">
        {history.length === 0 ? (
          <div className="p-6 text-center text-[#b3b3b3] text-sm">Aucune capture en historique.</div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto">
            {history.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                {c.kind === "screenshot" && <Camera className="w-4 h-4 text-[#1ed760] shrink-0" />}
                {c.kind === "recording"  && <Video  className="w-4 h-4 text-[#1ed760] shrink-0" />}
                {c.kind === "replay"     && <Rewind className="w-4 h-4 text-[#ffa42b] shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-bold truncate">{filename(c.path)}</div>
                  <div className="text-[11px] text-[#b3b3b3] font-mono truncate">
                    {c.path}
                    {c.size_bytes != null && <span className="ml-2">{formatBytes(c.size_bytes)}</span>}
                    {c.duration_sec != null && <span className="ml-2">{c.duration_sec}s</span>}
                  </div>
                </div>
                <span className="text-[10px] text-[#b3b3b3] shrink-0">{timeAgo(c.created_at)}</span>
                <button
                  onClick={() => openPath(c.path.replace(/[\\/][^\\/]+$/, "")).catch(console.error)}
                  className="p-2 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white transition-colors"
                  title="Ouvrir le dossier"
                >
                  <Folder className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { await dbDeleteCapture(c.id); refreshHistory(); }}
                  className="p-2 rounded hover:bg-[#3a1f1f] text-[#b3b3b3] hover:text-[#f3727f] transition-colors"
                  title="Supprimer de l'historique (le fichier reste sur le disque)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATUS TOAST */}
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
  const iconBg = danger ? "bg-[#f3727f] animate-pulse" : active ? "bg-[#1ed760]" : "bg-[#1ed760]";
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

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-1.5">
        <Icon className="w-3 h-3" /> {label}
      </div>
      {children}
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

function filename(p: string): string {
  return p.replace(/\\/g, "/").split("/").pop() ?? p;
}

function timeAgo(t: number): string {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return new Date(t).toLocaleDateString();
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
