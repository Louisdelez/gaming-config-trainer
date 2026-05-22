import { create } from "zustand";
import { dbGetAllSettings, dbSetSetting } from "../lib/db";

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
  loaded: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setKeyboard: (kb: KeyboardLayout) => Promise<void>;
  setAimSensitivity: (v: number) => Promise<void>;
  setCrosshairShape: (s: CrosshairShape) => Promise<void>;
  setCrosshairColor: (hex: string) => Promise<void>;
}

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
}));
