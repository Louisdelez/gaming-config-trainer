import { Command, type Child } from "@tauri-apps/plugin-shell";
import { save } from "@tauri-apps/plugin-dialog";

/* ============================================================
   Screen capture via bundled FFmpeg sidecar (Windows gdigrab)

   Architecture:
   - Tauri sidecar binary at `binaries/ffmpeg` (lowercased name +
     platform triple appended at bundle time).
   - Screenshots: spawn one-shot ffmpeg, write a single PNG frame.
   - Recordings: spawn long-running ffmpeg; SIGINT/q stop sequence
     to finalize the MP4 cleanly (otherwise the moov atom is bad).
   ============================================================ */

export type EncoderId = "h264_nvenc" | "h264_amf" | "h264_qsv" | "h264_mf" | "libx264";

export interface RecordingOpts {
  /** Encoder to use; pick from detected ones. Default: h264_mf (Media Foundation works on most Windows). */
  encoder?: EncoderId;
  /** Target FPS (default 60) */
  fps?: number;
  /** Target bitrate in kbps (default 12000 = 12 Mbps, good for 1080p60) */
  bitrateKbps?: number;
  /** Capture audio system loopback? (default false — needs DirectShow dshow setup; we keep MVP video-only) */
  audio?: boolean;
}

export interface RecordingHandle {
  /** The child process; do not interact directly, use stop() */
  child: Child;
  /** Final output path */
  path: string;
  /** Stop the recording cleanly and resolve when the file is finalized */
  stop: () => Promise<void>;
}

/* ------------------------------------------------------------
   Encoder presets — args appended to the ffmpeg command line.
   These are simple defaults that work without tweaking.
   ------------------------------------------------------------ */
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

/* ============================================================
   SCREENSHOT — one-shot PNG using gdigrab
   ============================================================ */

export async function captureScreenshot(): Promise<string | null> {
  const path = await save({
    defaultPath: `screenshot_${ts()}.png`,
    filters: [
      { name: "PNG", extensions: ["png"] },
    ],
  });
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
    throw new Error(`FFmpeg exited with code ${out.code}`);
  }
  return path;
}

/* ============================================================
   RECORDING — long-running MP4 capture
   ============================================================ */

export async function startRecording(opts: RecordingOpts = {}): Promise<RecordingHandle | null> {
  const encoder = opts.encoder ?? "h264_mf";
  const fps = opts.fps ?? 60;
  const bitrateKbps = opts.bitrateKbps ?? 12000;

  const path = await save({
    defaultPath: `recording_${ts()}.mp4`,
    filters: [
      { name: "MP4", extensions: ["mp4"] },
    ],
  });
  if (!path) return null;

  const args = [
    "-y",
    "-f", "gdigrab",
    "-framerate", String(fps),
    "-i", "desktop",
    ...encoderArgs(encoder, bitrateKbps),
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    path,
  ];

  const cmd = Command.sidecar("binaries/ffmpeg", args);
  cmd.stderr.on("data", (line) => {
    // FFmpeg writes progress to stderr — quiet logging
    if (line && line.includes("frame=") === false && line.length < 400) {
      // log once-in-a-while messages (errors, warnings)
      // console.debug("[ffmpeg]", line);
    }
  });

  const child = await cmd.spawn();

  const stop = async () => {
    try {
      // Send 'q' to stdin tells ffmpeg to stop cleanly and finalize moov atom
      await child.write("q");
      // Give it ~2s to flush
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.warn("[capture] graceful stop failed, killing:", e);
    }
    try {
      await child.kill();
    } catch {/* already exited */}
  };

  return { child, path, stop };
}

/* ============================================================
   ENCODER DETECTION — for Phase C.2; here as a stub
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

/* ============================================================
   Helpers
   ============================================================ */

function ts(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
