import { create } from "zustand";
import { dbGetAllSettings, dbSetSetting } from "../lib/db";

export type Language = "en" | "fr";
export type KeyboardLayout = "qwerty" | "qwertz" | "azerty";

/** Aim training sensitivity bounds */
export const AIM_SENS_MIN = 0.1;
export const AIM_SENS_MAX = 5.0;
export const AIM_SENS_DEFAULT = 1.0;

interface SettingsState {
  language: Language;
  keyboard: KeyboardLayout;
  /** Sensitivity multiplier applied to mousemove deltas inside aim training canvases */
  aimSensitivity: number;
  loaded: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setKeyboard: (kb: KeyboardLayout) => Promise<void>;
  setAimSensitivity: (v: number) => Promise<void>;
}

function clampSens(v: number): number {
  if (!Number.isFinite(v)) return AIM_SENS_DEFAULT;
  return Math.min(AIM_SENS_MAX, Math.max(AIM_SENS_MIN, v));
}

export const useSettings = create<SettingsState>()((set, get) => ({
  language: "fr",
  keyboard: "qwerty",
  aimSensitivity: AIM_SENS_DEFAULT,
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
}));
