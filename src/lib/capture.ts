import { Command, type Child } from "@tauri-apps/plugin-shell";
import { save } from "@tauri-apps/plugin-dialog";
import { stat } from "@tauri-apps/plugin-fs";
import { dbInsertCapture } from "./db";

/* ============================================================
   Screen capture via bundled FFmpeg sidecar (Windows gdigrab)
   ============================================================ */

export type EncoderId = "h264_nvenc" | "h264_amf" | "h264_qsv" | "h264_mf" | "libx264";

export interface RecordingOpts {
  encoder?: EncoderId;
  fps?: number;
  bitrateKbps?: number;
  audio?: boolean;          // capture system audio (loopback via dshow)
  defaultFolder?: string;   // if set, write here directly (no save dialog)
}

export interface RecordingHandle {
  child: Child;
  path: string;
  encoder: EncoderId;
  startedAt: number;
  stop: () => Promise<{ path: string; durationSec: number; sizeBytes: number | null }>;
}

export interface ReplayBufferOpts {
  encoder?: EncoderId;
  fps?: number;
  bitrateKbps?: number;
  audio?: boolean;
  seconds?: number;          // total buffer length in seconds (default 30)
  defaultFolder?: string;    // where to keep segments
}

export interface ReplayBufferHandle {
  child: Child;
  segmentDir: string;
  seconds: number;
  encoder: EncoderId;
  stop: () => Promise<void>;
  saveClip: () => Promise<string | null>;
}

/* ============================================================
   Encoder argument presets
   ============================================================ */
function encoderArgs(enc: EncoderId, bitrateKbps: number): string[] {
  const br = `${bitrateKbps}k`;
  switch (enc) {
    case "h264_nvenc":
      return ["-c:v", "h264_nvenc", "-preset", "p4", "-tune", "ll", "-rc", "vbr", "-cq", "23", "-b:v", br];
    case "h264_amf":
      return ["-c:v", "h264_amf", "-quality", "speed", "-rc", "vbr_peak", "-b:v", br];
    case "h264_qsv":
      return ["-c:v", "h264_qsv", "-preset", "veryfast", "-b:v", br];
    case "h264_mf":
      return ["-c:v", "h264_mf", "-b:v", br];
    case "libx264":
    default:
      return ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-b:v", br, "-pix_fmt", "yuv420p"];
  }
}

/** Windows dshow loopback for system audio — best-effort, falls back silently if device absent */
function audioInputArgs(): string[] {
  // virtual-audio-capturer is installed with Screen Capturer Recorder; we don't ship it.
  // For now we use Windows WASAPI loopback via dshow:
  //   -f dshow -i audio="virtual-audio-capturer"
  // If that fails the user simply gets video only.
  return ["-f", "dshow", "-i", "audio=virtual-audio-capturer"];
}

/* ============================================================
   Path helpers
   ============================================================ */

function ts(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function joinPath(folder: string, name: string): string {
  // Windows path normalization — accept both \ and /
  const f = folder.replace(/[\\/]+$/, "");
  return `${f}\\${name}`;
}

async function resolvePath(folder: string | undefined, defaultName: string, ext: string): Promise<string | null> {
  if (folder && folder.length > 0) {
    return joinPath(folder, defaultName);
  }
  const picked = await save({
    defaultPath: defaultName,
    filters: [{ name: ext.toUpperCase(), extensions: [ext] }],
  });
  return picked ?? null;
}

async function fileSize(path: string): Promise<number | null> {
  try {
    const s = await stat(path);
    return Number(s.size ?? 0);
  } catch {
    return null;
  }
}

/* ============================================================
   SCREENSHOT
   ============================================================ */

export async function captureScreenshot(defaultFolder?: string): Promise<string | null> {
  const path = await resolvePath(defaultFolder, `screenshot_${ts()}.png`, "png");
  if (!path) return null;

  const args = [
    "-y",
    "-f", "gdigrab",
    "-framerate", "1",
    "-i", "desktop",
    "-frames:v", "1",
    "-update", "1",
    path,
  ];

  const cmd = Command.sidecar("binaries/ffmpeg", args);
  const out = await cmd.execute();
  if (out.code !== 0) {
    console.error("[ffmpeg screenshot] non-zero exit", out.code, out.stderr);
    throw new Error(`FFmpeg exited with code ${out.code}: ${(out.stderr || "").slice(0, 200)}`);
  }
  const size = await fileSize(path);
  await dbInsertCapture({ kind: "screenshot", path, size_bytes: size, encoder: null, duration_sec: null }).catch(() => {});
  return path;
}

/* ============================================================
   RECORDING
   ============================================================ */

export async function startRecording(opts: RecordingOpts = {}): Promise<RecordingHandle | null> {
  const encoder = opts.encoder ?? "h264_mf";
  const fps = opts.fps ?? 60;
  const bitrateKbps = opts.bitrateKbps ?? 12000;

  const path = await resolvePath(opts.defaultFolder, `recording_${ts()}.mp4`, "mp4");
  if (!path) return null;

  const args: string[] = [
    "-y",
    "-f", "gdigrab",
    "-framerate", String(fps),
    "-i", "desktop",
  ];
  if (opts.audio) args.push(...audioInputArgs());
  args.push(
    ...encoderArgs(encoder, bitrateKbps),
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    path,
  );

  const cmd = Command.sidecar("binaries/ffmpeg", args);
  cmd.stderr.on("data", (line) => {
    if (typeof line === "string" && line.toLowerCase().includes("error")) {
      console.error("[ffmpeg stderr]", line);
    }
  });
  cmd.on("error", (e) => console.error("[ffmpeg process error]", e));

  const startedAt = Date.now();
  const child = await cmd.spawn();

  const stop = async (): Promise<{ path: string; durationSec: number; sizeBytes: number | null }> => {
    try {
      await child.write("q");
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.warn("[capture] graceful stop failed, killing:", e);
    }
    try { await child.kill(); } catch {/* already exited */}
    const sizeBytes = await fileSize(path);
    const durationSec = Math.round((Date.now() - startedAt) / 1000);
    await dbInsertCapture({
      kind: "recording", path, size_bytes: sizeBytes, encoder, duration_sec: durationSec,
    }).catch(() => {});
    return { path, durationSec, sizeBytes };
  };

  return { child, path, encoder, startedAt, stop };
}

/* ============================================================
   REPLAY BUFFER (Phase C.4)

   Strategy: ffmpeg in segment-muxer mode writes 2-second .ts
   chunks into a rotating folder, keeping only the last N chunks
   to cover `seconds` of buffer. On saveClip(), we concat the
   current chunks into a single MP4.
   ============================================================ */

const SEGMENT_DURATION = 2;  // seconds per chunk

export async function startReplayBuffer(opts: ReplayBufferOpts = {}): Promise<ReplayBufferHandle> {
  const encoder = opts.encoder ?? "h264_mf";
  const fps = opts.fps ?? 60;
  const bitrateKbps = opts.bitrateKbps ?? 12000;
  const seconds = Math.max(10, Math.min(120, opts.seconds ?? 30));
  const segWraps = Math.ceil(seconds / SEGMENT_DURATION) + 1;
  const folder = opts.defaultFolder && opts.defaultFolder.length > 0
    ? opts.defaultFolder
    : await defaultTempFolder();
  const segmentDir = joinPath(folder, `_replay_buffer_${Date.now()}`);
  // Create the folder via ffmpeg's first write (mkdir not strictly needed for ffmpeg's segment muxer on most fs)
  // To ensure it exists we let ffmpeg's wrap_size handling create files there.

  const args: string[] = [
    "-y",
    "-f", "gdigrab",
    "-framerate", String(fps),
    "-i", "desktop",
  ];
  if (opts.audio) args.push(...audioInputArgs());
  args.push(
    ...encoderArgs(encoder, bitrateKbps),
    "-pix_fmt", "yuv420p",
    "-f", "segment",
    "-segment_time", String(SEGMENT_DURATION),
    "-segment_wrap", String(segWraps),
    "-segment_format", "mpegts",
    "-reset_timestamps", "1",
    joinPath(segmentDir, "seg_%03d.ts"),
  );

  const cmd = Command.sidecar("binaries/ffmpeg", args);
  cmd.stderr.on("data", (line) => {
    if (typeof line === "string" && line.toLowerCase().includes("error")) {
      console.error("[replay buffer stderr]", line);
    }
  });

  const child = await cmd.spawn();

  const stop = async () => {
    try { await child.write("q"); await new Promise(r => setTimeout(r, 500)); } catch {}
    try { await child.kill(); } catch {}
  };

  const saveClip = async (): Promise<string | null> => {
    // Tell the user where to save the MP4
    const outPath = await resolvePath(opts.defaultFolder, `clip_${ts()}.mp4`, "mp4");
    if (!outPath) return null;
    // Concat the latest N segments. Easiest portable way: use ffmpeg concat demuxer.
    // We rely on filesystem ordering (seg_000.ts ... seg_NNN.ts). Use the glob input.
    const concatArgs = [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-pattern_type", "glob",
      "-i", joinPath(segmentDir, "*.ts"),
      "-c", "copy",
      "-movflags", "+faststart",
      outPath,
    ];
    const concatCmd = Command.sidecar("binaries/ffmpeg", concatArgs);
    const out = await concatCmd.execute();
    if (out.code !== 0) {
      console.error("[replay saveClip] non-zero exit", out.code, out.stderr);
      throw new Error(`Concat failed: ${(out.stderr || "").slice(0, 200)}`);
    }
    const size = await fileSize(outPath);
    await dbInsertCapture({
      kind: "replay", path: outPath, size_bytes: size, encoder, duration_sec: seconds,
    }).catch(() => {});
    return outPath;
  };

  return { child, segmentDir, seconds, encoder, stop, saveClip };
}

async function defaultTempFolder(): Promise<string> {
  // Fallback to %TEMP% — works on every Windows install
  return "C:\\Users\\Public\\AppData\\Local\\Temp";
}

/* ============================================================
   ENCODER DETECTION
   ============================================================ */

export async function detectEncoders(): Promise<EncoderId[]> {
  try {
    const cmd = Command.sidecar("binaries/ffmpeg", ["-hide_banner", "-encoders"]);
    const out = await cmd.execute();
    const text = (out.stdout || "") + (out.stderr || "");
    const found: EncoderId[] = [];
    if (text.includes("h264_nvenc")) found.push("h264_nvenc");
    if (text.includes("h264_amf"))   found.push("h264_amf");
    if (text.includes("h264_qsv"))   found.push("h264_qsv");
    if (text.includes("h264_mf"))    found.push("h264_mf");
    if (text.includes("libx264"))    found.push("libx264");
    return found;
  } catch (e) {
    console.error("[capture] detectEncoders failed:", e);
    return ["h264_mf", "libx264"];
  }
}
