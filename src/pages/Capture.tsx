import { useEffect, useRef, useState } from "react";
import {
  Camera, Video, Square, Loader2, Check, AlertCircle, Folder, Cpu, Gauge, Film,
} from "lucide-react";
import { openPath } from "@tauri-apps/plugin-opener";
import PageHeader from "../components/PageHeader";
import {
  captureScreenshot, startRecording, detectEncoders,
  type EncoderId, type RecordingHandle,
} from "../lib/capture";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "ok"; msg: string; path?: string }
  | { kind: "err"; msg: string };

interface SavedFile { kind: "screenshot" | "recording"; path: string; at: number; }

const ENCODER_LABEL: Record<EncoderId, string> = {
  h264_nvenc: "NVIDIA NVENC (GPU)",
  h264_amf:   "AMD AMF (GPU)",
  h264_qsv:   "Intel QuickSync (GPU)",
  h264_mf:    "Windows Media Foundation",
  libx264:    "libx264 (CPU, max compat)",
};

const FPS_OPTIONS = [30, 60, 120, 144];
const BITRATE_OPTIONS = [4000, 8000, 12000, 20000, 30000]; // kbps

export default function Capture() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [available, setAvailable] = useState<EncoderId[]>([]);
  const [encoder, setEncoder] = useState<EncoderId>("h264_mf");
  const [fps, setFps] = useState(60);
  const [bitrate, setBitrate] = useState(12000);
  const [recent, setRecent] = useState<SavedFile[]>([]);
  const handleRef = useRef<RecordingHandle | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedTimer = useRef<number | null>(null);

  // Detect encoders on mount
  useEffect(() => {
    detectEncoders().then((list) => {
      setAvailable(list);
      // Pick the best available: NVENC > QSV > AMF > MF > libx264
      const pref: EncoderId[] = ["h264_nvenc", "h264_qsv", "h264_amf", "h264_mf", "libx264"];
      const best = pref.find((p) => list.includes(p));
      if (best) setEncoder(best);
    });
  }, []);

  // Elapsed timer while recording
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

  // Auto-clear status after 4s
  useEffect(() => {
    if (status.kind === "ok" || status.kind === "err") {
      const t = setTimeout(() => setStatus({ kind: "idle" }), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleScreenshot = async () => {
    setStatus({ kind: "busy", msg: "Capture de l'écran…" });
    try {
      const path = await captureScreenshot();
      if (!path) { setStatus({ kind: "idle" }); return; }
      const entry: SavedFile = { kind: "screenshot", path, at: Date.now() };
      setRecent((r) => [entry, ...r].slice(0, 10));
      setStatus({ kind: "ok", msg: "Screenshot enregistré", path });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: "err", msg: e?.message ?? "Erreur capture" });
    }
  };

  const handleStartRecording = async () => {
    setStatus({ kind: "busy", msg: "Démarrage enregistrement…" });
    try {
      const handle = await startRecording({ encoder, fps, bitrateKbps: bitrate });
      if (!handle) { setStatus({ kind: "idle" }); return; }
      handleRef.current = handle;
      setRecording(true);
      setStatus({ kind: "ok", msg: "Enregistrement en cours…" });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: "err", msg: e?.message ?? "Erreur démarrage" });
    }
  };

  const handleStopRecording = async () => {
    const handle = handleRef.current;
    if (!handle) return;
    setStatus({ kind: "busy", msg: "Finalisation du fichier MP4…" });
    setRecording(false);
    try {
      await handle.stop();
      handleRef.current = null;
      const entry: SavedFile = { kind: "recording", path: handle.path, at: Date.now() };
      setRecent((r) => [entry, ...r].slice(0, 10));
      setStatus({ kind: "ok", msg: "Vidéo enregistrée", path: handle.path });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: "err", msg: e?.message ?? "Erreur stop" });
    }
  };

  const openFolder = async (path: string) => {
    try {
      const dir = path.replace(/[\\/][^\\/]+$/, "");
      await openPath(dir);
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <PageHeader
        icon={Video}
        title="Capture"
        subtitle="Screenshots et enregistrement vidéo via FFmpeg (gdigrab + hardware encoder)"
      />

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Screenshot */}
        <div className="bg-[#181818] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1ed760] flex items-center justify-center">
              <Camera className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Screenshot</div>
              <div className="text-lg font-extrabold text-white">Capture d'écran</div>
            </div>
          </div>
          <p className="text-xs text-[#b3b3b3] flex-1">
            Capture l'écran entier en PNG, qualité max. Le dialogue Windows te demande où enregistrer.
          </p>
          <button
            onClick={handleScreenshot}
            disabled={status.kind === "busy" || recording}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1ed760] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed text-black text-[11px] font-bold uppercase transition-transform"
            style={{ letterSpacing: "1.4px" }}
          >
            <Camera className="w-4 h-4" />
            Prendre un screenshot
          </button>
        </div>

        {/* Recording */}
        <div className={`rounded-xl p-6 flex flex-col gap-4 ${recording ? "bg-[#2a0e10] ring-1 ring-[#f3727f]" : "bg-[#181818]"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${recording ? "bg-[#f3727f] animate-pulse" : "bg-[#1ed760]"}`}>
              <Video className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Recording</div>
              <div className="text-lg font-extrabold text-white">Enregistrement vidéo</div>
            </div>
            {recording && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#f3727f]">REC</div>
                <div className="font-mono font-bold text-xl text-white">{formatElapsed(elapsed)}</div>
              </div>
            )}
          </div>
          <p className="text-xs text-[#b3b3b3] flex-1">
            Enregistre l'écran en MP4 avec hardware encoding ({ENCODER_LABEL[encoder]}) à {fps} FPS / {bitrate / 1000} Mbps.
          </p>
          {!recording ? (
            <button
              onClick={handleStartRecording}
              disabled={status.kind === "busy"}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1ed760] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed text-black text-[11px] font-bold uppercase transition-transform"
              style={{ letterSpacing: "1.4px" }}
            >
              <Video className="w-4 h-4" />
              Démarrer l'enregistrement
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#f3727f] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform"
              style={{ letterSpacing: "1.4px" }}
            >
              <Square className="w-4 h-4 fill-current" />
              Arrêter l'enregistrement
            </button>
          )}
        </div>
      </div>

      {/* ENCODER + QUALITY SETTINGS */}
      <h2 className="text-[11px] uppercase font-bold text-[#b3b3b3] mb-3" style={{ letterSpacing: "1.4px" }}>
        Paramètres vidéo
      </h2>
      <div className="bg-[#181818] rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field icon={Cpu} label="Encoder">
          <select
            value={encoder}
            onChange={(e) => setEncoder(e.target.value as EncoderId)}
            disabled={recording}
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
            disabled={recording}
            className="w-full px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-bold outline-none disabled:opacity-50"
          >
            {FPS_OPTIONS.map((v) => (
              <option key={v} value={v}>{v} fps</option>
            ))}
          </select>
        </Field>

        <Field icon={Gauge} label="Bitrate">
          <select
            value={bitrate}
            onChange={(e) => setBitrate(parseInt(e.target.value, 10))}
            disabled={recording}
            className="w-full px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-bold outline-none disabled:opacity-50"
          >
            {BITRATE_OPTIONS.map((v) => (
              <option key={v} value={v}>{(v / 1000).toFixed(0)} Mbps</option>
            ))}
          </select>
        </Field>
      </div>

      {/* RECENT FILES */}
      <h2 className="text-[11px] uppercase font-bold text-[#b3b3b3] mb-3" style={{ letterSpacing: "1.4px" }}>
        Cette session ({recent.length})
      </h2>
      <div className="bg-[#181818] rounded-xl overflow-hidden mb-6">
        {recent.length === 0 ? (
          <div className="p-6 text-center text-[#b3b3b3] text-sm">
            Aucune capture pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recent.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                {f.kind === "screenshot"
                  ? <Camera className="w-4 h-4 text-[#1ed760] shrink-0" />
                  : <Video className="w-4 h-4 text-[#1ed760] shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-bold truncate">{filename(f.path)}</div>
                  <div className="text-[11px] text-[#b3b3b3] font-mono truncate">{f.path}</div>
                </div>
                <span className="text-[10px] text-[#b3b3b3] shrink-0">{timeAgo(f.at)}</span>
                <button
                  onClick={() => openFolder(f.path)}
                  className="p-2 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white transition-colors"
                  title="Ouvrir le dossier"
                >
                  <Folder className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATUS TOAST */}
      {status.kind !== "idle" && <StatusToast status={status} />}

      {/* TIPS */}
      <div className="bg-[#181818] rounded-xl p-5 text-xs text-[#b3b3b3]">
        <p className="mb-2"><strong className="text-white">💡 Note</strong> :</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Le screenshot/recording capture <strong className="text-white">tout l'écran principal</strong> (gdigrab).</li>
          <li>Hardware encoding (NVENC/AMF/QSV) = <strong className="text-white">~1-3% CPU</strong> en jeu vs ~20% pour libx264.</li>
          <li>Le bouton "Arrêter" envoie 'q' à FFmpeg pour finaliser proprement le moov atom du MP4.</li>
          <li>Phase suivante (v0.1.8) : hotkeys globaux F9/F10/F11 pour capturer pendant que le jeu est focus.</li>
        </ul>
      </div>
    </>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

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

function StatusToast({ status }: { status: Exclude<Status, { kind: "idle" }> }) {
  const colors = {
    busy: { bg: "#1f1f1f", border: "#1ed760", text: "text-white",     Icon: Loader2 },
    ok:   { bg: "#0e2a18", border: "#1ed760", text: "text-[#1ed760]", Icon: Check },
    err:  { bg: "#2a0e10", border: "#f3727f", text: "text-[#f3727f]", Icon: AlertCircle },
  } as const;
  const c = colors[status.kind];
  const Icon = c.Icon;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-bold ${c.text} max-w-sm`}
      style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px" }}
    >
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
  const ss = s % 60;
  return `${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

function filename(p: string): string {
  return p.replace(/\\/g, "/").split("/").pop() ?? p;
}

function timeAgo(t: number): string {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  return `${Math.floor(s / 3600)} h`;
}
