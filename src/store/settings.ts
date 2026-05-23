import { create } from "zustand";
import { documentDir } from "@tauri-apps/api/path";
import { mkdir, exists } from "@tauri-apps/plugin-fs";
import { dbGetAllSettings, dbSetSetting } from "../lib/db";

/** Returns the default captures folder under the user's Documents, creating it if missing. */
async function ensureDefaultCaptureFolder(): Promise<string> {
  try {
    const docs = await documentDir();
    const folder = `${docs.replace(/[\\/]+$/, "")}\\Gaming Config Trainer`;
    const has = await exists(folder).catch(() => false);
    if (!has) await mkdir(folder, { recursive: true }).catch(() => {});
    return folder;
  } catch (e) {
    console.error("[settings] ensureDefaultCaptureFolder failed:", e);
    return "";
  }
}

export type Language = "en" | "fr";
export type KeyboardLayout = "qwerty" | "qwertz" | "azerty";
export type CrosshairShape = "cross" | "plus" | "dot" | "circle" | "dot-circle" | "x" | "gap-dot";

/** Aim training sensitivity bounds */
export const AIM_SENS_MIN = 0.1;
export const AIM_SENS_MAX = 5.0;
export const AIM_SENS_DEFAULT = 1.0;

export const CROSSHAIR_SHAPES: CrosshairShape[] = ["cross", "plus", "dot", "circle", "dot-circle", "x", "gap-dot"];

export interface CrosshairColorPreset {
  id: string;
  hex: string;
  label: string;
}

export const CROSSHAIR_COLOR_PRESETS: CrosshairColorPreset[] = [
  { id: "green",   hex: "#1ed760", label: "Spotify Green" },
  { id: "white",   hex: "#ffffff", label: "Blanc" },
  { id: "cyan",    hex: "#00ffff", label: "Cyan" },
  { id: "yellow",  hex: "#ffd700", label: "Jaune" },
  { id: "red",     hex: "#ff3030", label: "Rouge" },
  { id: "magenta", hex: "#ff00ff", label: "Magenta" },
  { id: "lime",    hex: "#00ff00", label: "Vert vif" },
  { id: "orange",  hex: "#ff8800", label: "Orange" },
];

export const CROSSHAIR_DEFAULT_SHAPE: CrosshairShape = "cross";
export const CROSSHAIR_DEFAULT_COLOR = "#1ed760";

interface SettingsState {
  language: Language;
  keyboard: KeyboardLayout;
  /** Sensitivity multiplier applied to mousemove deltas inside aim training canvases */
  aimSensitivity: number;
  crosshairShape: CrosshairShape;
  crosshairColor: string;
  /** Default folder for screenshots / recordings */
  captureFolder: string;
  /** Encoder used for video recordings */
  captureEncoder: string;
  /** FPS for video recordings */
  captureFps: number;
  /** Bitrate in kbps for video recordings */
  captureBitrate: number;
  /** Capture system audio with recordings? */
  captureAudio: boolean;
  /** Replay buffer enabled? (background record for last-N-sec save) */
  replayEnabled: boolean;
  /** Replay buffer length in seconds (10–120) */
  replaySeconds: number;
  /** Global hotkey accelerators (Tauri format, e.g. "F9", "Ctrl+Shift+S") */
  hotkeyScreenshot: string;
  hotkeyRecord: string;
  hotkeyReplay: string;
  loaded: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setKeyboard: (kb: KeyboardLayout) => Promise<void>;
  setAimSensitivity: (v: number) => Promise<void>;
  setCrosshairShape: (s: CrosshairShape) => Promise<void>;
  setCrosshairColor: (hex: string) => Promise<void>;
  setCaptureFolder: (path: string) => Promise<void>;
  setCaptureEncoder: (id: string) => Promise<void>;
  setCaptureFps: (n: number) => Promise<void>;
  setCaptureBitrate: (kbps: number) => Promise<void>;
  setCaptureAudio: (on: boolean) => Promise<void>;
  setReplayEnabled: (on: boolean) => Promise<void>;
  setReplaySeconds: (n: number) => Promise<void>;
  setHotkeyScreenshot: (s: string) => Promise<void>;
  setHotkeyRecord: (s: string) => Promise<void>;
  setHotkeyReplay: (s: string) => Promise<void>;
}

export const HOTKEY_SCREENSHOT_DEFAULT = "F10";
export const HOTKEY_RECORD_DEFAULT     = "F9";
export const HOTKEY_REPLAY_DEFAULT     = "F11";

function clampSens(v: number): number {
  if (!Number.isFinite(v)) return AIM_SENS_DEFAULT;
  return Math.min(AIM_SENS_MAX, Math.max(AIM_SENS_MIN, v));
}

function isShape(s: string): s is CrosshairShape {
  return (CROSSHAIR_SHAPES as string[]).includes(s);
}

function isHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

export const useSettings = create<SettingsState>()((set, get) => ({
  language: "fr",
  keyboard: "qwerty",
  aimSensitivity: AIM_SENS_DEFAULT,
  crosshairShape: CROSSHAIR_DEFAULT_SHAPE,
  crosshairColor: CROSSHAIR_DEFAULT_COLOR,
  captureFolder: "",
  captureEncoder: "h264_mf",
  captureFps: 60,
  captureBitrate: 12000,
  captureAudio: false,
  replayEnabled: false,
  replaySeconds: 30,
  hotkeyScreenshot: HOTKEY_SCREENSHOT_DEFAULT,
  hotkeyRecord: HOTKEY_RECORD_DEFAULT,
  hotkeyReplay: HOTKEY_REPLAY_DEFAULT,
  loaded: false,

  hydrate: async () => {
    if (get().loaded) return;
    try {
      const all = await dbGetAllSettings();
      const updates: Partial<SettingsState> = { loaded: true };
      if (all.language === "en" || all.language === "fr") updates.language = all.language;
      if (all.keyboard === "qwerty" || all.keyboard === "qwertz" || all.keyboard === "azerty") updates.keyboard = all.keyboard;
      if (all.aimSensitivity) {
        const n = Number(all.aimSensitivity);
        if (Number.isFinite(n)) updates.aimSensitivity = clampSens(n);
      }
      if (all.crosshairShape && isShape(all.crosshairShape)) {
        updates.crosshairShape = all.crosshairShape;
      }
      if (all.crosshairColor && isHex(all.crosshairColor)) {
        updates.crosshairColor = all.crosshairColor;
      }
      if (typeof all.captureFolder === "string" && all.captureFolder.length > 0) {
        updates.captureFolder = all.captureFolder;
      } else {
        // First-run: default to Documents\Gaming Config Trainer
        const folder = await ensureDefaultCaptureFolder();
        if (folder) {
          updates.captureFolder = folder;
          await dbSetSetting("captureFolder", folder).catch(() => {});
        }
      }
      if (all.captureAudio === "true") updates.captureAudio = true;
      if (all.replayEnabled === "true") updates.replayEnabled = true;
      if (all.replaySeconds) {
        const n = parseInt(all.replaySeconds, 10);
        if (Number.isFinite(n) && n >= 10 && n <= 120) updates.replaySeconds = n;
      }
      if (typeof all.captureEncoder === "string") updates.captureEncoder = all.captureEncoder;
      if (all.captureFps) {
        const n = parseInt(all.captureFps, 10);
        if (Number.isFinite(n) && [30, 60, 120, 144].includes(n)) updates.captureFps = n;
      }
      if (all.captureBitrate) {
        const n = parseInt(all.captureBitrate, 10);
        if (Number.isFinite(n) && n > 0) updates.captureBitrate = n;
      }
      if (typeof all.hotkeyScreenshot === "string" && all.hotkeyScreenshot.length > 0) updates.hotkeyScreenshot = all.hotkeyScreenshot;
      if (typeof all.hotkeyRecord === "string"     && all.hotkeyRecord.length > 0)     updates.hotkeyRecord     = all.hotkeyRecord;
      if (typeof all.hotkeyReplay === "string"     && all.hotkeyReplay.length > 0)     updates.hotkeyReplay     = all.hotkeyReplay;
      set(updates);
    } catch (e) {
      console.error("[settings] hydrate failed:", e);
      set({ loaded: true });
    }
  },

  setLanguage: async (language) => {
    set({ language });
    try { await dbSetSetting("language", language); }
    catch (e) { console.error("[settings] setLanguage failed:", e); }
  },

  setKeyboard: async (keyboard) => {
    set({ keyboard });
    try { await dbSetSetting("keyboard", keyboard); }
    catch (e) { console.error("[settings] setKeyboard failed:", e); }
  },

  setAimSensitivity: async (v) => {
    const next = clampSens(v);
    set({ aimSensitivity: next });
    try { await dbSetSetting("aimSensitivity", String(next)); }
    catch (e) { console.error("[settings] setAimSensitivity failed:", e); }
  },

  setCrosshairShape: async (shape) => {
    set({ crosshairShape: shape });
    try { await dbSetSetting("crosshairShape", shape); }
    catch (e) { console.error("[settings] setCrosshairShape failed:", e); }
  },

  setCrosshairColor: async (hex) => {
    if (!isHex(hex)) return;
    set({ crosshairColor: hex });
    try { await dbSetSetting("crosshairColor", hex); }
    catch (e) { console.error("[settings] setCrosshairColor failed:", e); }
  },

  setCaptureFolder: async (path) => {
    let finalPath = path;
    // If user clears it, fall back to Documents default (auto-create)
    if (!path || path.trim().length === 0) {
      finalPath = await ensureDefaultCaptureFolder();
    }
    set({ captureFolder: finalPath });
    try { await dbSetSetting("captureFolder", finalPath); }
    catch (e) { console.error("[settings] setCaptureFolder failed:", e); }
  },

  setCaptureEncoder: async (id) => {
    set({ captureEncoder: id });
    try { await dbSetSetting("captureEncoder", id); }
    catch (e) { console.error("[settings] setCaptureEncoder failed:", e); }
  },

  setCaptureFps: async (n) => {
    set({ captureFps: n });
    try { await dbSetSetting("captureFps", String(n)); }
    catch (e) { console.error("[settings] setCaptureFps failed:", e); }
  },

  setCaptureBitrate: async (kbps) => {
    set({ captureBitrate: kbps });
    try { await dbSetSetting("captureBitrate", String(kbps)); }
    catch (e) { console.error("[settings] setCaptureBitrate failed:", e); }
  },

  setCaptureAudio: async (on) => {
    set({ captureAudio: on });
    try { await dbSetSetting("captureAudio", on ? "true" : "false"); }
    catch (e) { console.error("[settings] setCaptureAudio failed:", e); }
  },

  setReplayEnabled: async (on) => {
    set({ replayEnabled: on });
    try { await dbSetSetting("replayEnabled", on ? "true" : "false"); }
    catch (e) { console.error("[settings] setReplayEnabled failed:", e); }
  },

  setReplaySeconds: async (n) => {
    const clamped = Math.max(10, Math.min(120, Math.floor(n)));
    set({ replaySeconds: clamped });
    try { await dbSetSetting("replaySeconds", String(clamped)); }
    catch (e) { console.error("[settings] setReplaySeconds failed:", e); }
  },

  setHotkeyScreenshot: async (s) => {
    set({ hotkeyScreenshot: s });
    try { await dbSetSetting("hotkeyScreenshot", s); }
    catch (e) { console.error("[settings] setHotkeyScreenshot failed:", e); }
  },

  setHotkeyRecord: async (s) => {
    set({ hotkeyRecord: s });
    try { await dbSetSetting("hotkeyRecord", s); }
    catch (e) { console.error("[settings] setHotkeyRecord failed:", e); }
  },

  setHotkeyReplay: async (s) => {
    set({ hotkeyReplay: s });
    try { await dbSetSetting("hotkeyReplay", s); }
    catch (e) { console.error("[settings] setHotkeyReplay failed:", e); }
  },
}));
