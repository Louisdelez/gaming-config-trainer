import { create } from "zustand";
import { dbGetAllSettings, dbSetSetting } from "../lib/db";

export type Language = "en" | "fr";
export type KeyboardLayout = "qwerty" | "qwertz" | "azerty";

interface SettingsState {
  language: Language;
  keyboard: KeyboardLayout;
  loaded: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setKeyboard: (kb: KeyboardLayout) => Promise<void>;
}

export const useSettings = create<SettingsState>()((set, get) => ({
  language: "fr",
  keyboard: "qwerty",
  loaded: false,

  hydrate: async () => {
    if (get().loaded) return;
    try {
      const all = await dbGetAllSettings();
      const updates: Partial<SettingsState> = { loaded: true };
      if (all.language === "en" || all.language === "fr") updates.language = all.language;
      if (all.keyboard === "qwerty" || all.keyboard === "qwertz" || all.keyboard === "azerty") updates.keyboard = all.keyboard;
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
}));
