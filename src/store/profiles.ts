import { create } from "zustand";
import type { KeyboardLayout } from "./settings";
import {
  dbListProfiles, dbInsertProfile, dbUpdateProfile, dbDeleteProfile,
  dbGetActiveProfiles, dbSetActiveProfile,
} from "../lib/db";

/* ============================================================
   PROFILE TYPES — each game has its own editable shape
   The DEFAULT profile is hard-coded (read-only).
   Custom profiles are user-created clones stored in localStorage.
   ============================================================ */

export type GameId = "valorant" | "fortnite" | "lol";

/** Common base — all profiles include name + game + isDefault + layout */
interface ProfileBase {
  id: string;
  name: string;
  isDefault: boolean;
  /** Keyboard layout this profile is tuned for. Drives keybind display. */
  keyboardLayout: KeyboardLayout;
}

/* ---------- VALORANT ---------- */
export interface ValorantProfile extends ProfileBase {
  game: "valorant";
  // Mouse
  dpi: string;
  pollingRate: string;
  mouseAcceleration: string;
  rawInputBuffer: string;
  // Sensitivity
  sensitivity: string;
  adsMultiplier: string;
  scopedMultiplier: string;
  adsMode: string;
  sniperMode: string;
  separateZoomSens: string;
  // Keybinds (US-QWERTY position labels; layout-mapped on display)
  ability1: string;
  ability2: string;
  ability3: string;
  ultimate: string;
  reload: string;
  useObject: string;
  drop: string;
  inspect: string;
  ping: string;
  voiceTeam: string;
  voiceParty: string;
  buyMenu: string;
  megamap: string;
  // Crosshair
  crosshairCode: string;
  crosshairColor: string;
  // Graphics
  displayMode: string;
  resolution: string;
  frameRateLimit: string;
  vsync: string;
  nvidiaReflex: string;
  materialQuality: string;
  textureQuality: string;
  detailQuality: string;
  antiAliasing: string;
  bloom: string;
  distortion: string;
  castShadows: string;
  // Audio
  masterVolume: string;
  musicVolume: string;
  sfxVolume: string;
  voiceChatVolume: string;
  hrtf: string;
  // Minimap
  minimapRotate: string;
  minimapCentered: string;
  minimapSize: string;
  minimapZoom: string;
  visionCones: string;
}

/* ---------- FORTNITE ---------- */
export interface FortniteProfile extends ProfileBase {
  game: "fortnite";
  // Mouse
  dpi: string;
  pollingRate: string;
  mouseAcceleration: string;
  rawInput: string;
  // Sensitivity
  xSens: string;
  ySens: string;
  targetingSens: string;
  scopeSens: string;
  buildingSens: string;
  editSens: string;
  // Keybinds
  wall: string;
  floor: string;
  ramp: string;
  roof: string;
  trap: string;
  edit: string;
  resetEdit: string;
  use: string;
  reload: string;
  inventory: string;
  // Settings
  turboBuilding: string;
  resetBuildingChoice: string;
  confirmEditOnRelease: string;
  disablePreEdit: string;
  autoMaterialChange: string;
  // Graphics
  renderingMode: string;
  resolution: string;
  fpsLimit: string;
  vsync: string;
  threeDResolution: string;
  viewDistance: string;
  shadows: string;
  antiAliasing: string;
  textures: string;
  effects: string;
  postProcessing: string;
  motionBlur: string;
  nvidiaReflex: string;
  // Audio
  musicVolume: string;
  sfxVolume: string;
  voiceChatVolume: string;
  threeDHeadphones: string;
  visualizeSounds: string;
}

/* ---------- LOL ---------- */
export interface LolProfile extends ProfileBase {
  game: "lol";
  // Mouse
  dpi: string;
  gameMouseSpeed: string;
  mouseAcceleration: string;
  vsync: string;
  // Keybinds
  spell1: string;
  spell2: string;
  spell3: string;
  ultimate: string;
  summoner1: string;
  summoner2: string;
  attackMove: string;
  attackMoveInstant: string;
  stop: string;
  holdPosition: string;
  recall: string;
  shop: string;
  // Smart Cast
  smartCastOn: string;
  smartCastOnRelease: string;
  // Camera & HUD
  cameraLock: string;
  minimapScale: string;
  showTurretRange: string;
  showAttackRadius: string;
  numericCooldowns: string;
  // Graphics
  resolution: string;
  windowMode: string;
  frameRateCap: string;
  characterQuality: string;
  environmentQuality: string;
  shadowQuality: string;
  effectsQuality: string;
  antiAliasing: string;
  // Audio
  masterVolume: string;
  musicVolume: string;
  sfxVolume: string;
  voiceVolume: string;
  pingsVolume: string;
  announcer: string;
}

export type AnyProfile = ValorantProfile | FortniteProfile | LolProfile;

/* ============================================================
   DEFAULT PROFILES (read-only)
   These are the current "pro" configs.
   ============================================================ */

export const DEFAULT_VALORANT: ValorantProfile = {
  id: "valorant-default",
  name: "Pro Default (TenZ)",
  game: "valorant",
  isDefault: true,
  keyboardLayout: "qwerty",
  dpi: "800",
  pollingRate: "1000 Hz",
  mouseAcceleration: "OFF",
  rawInputBuffer: "ON",
  sensitivity: "0.35",
  adsMultiplier: "1.00",
  scopedMultiplier: "1.00",
  adsMode: "HOLD",
  sniperMode: "HOLD",
  separateZoomSens: "ON",
  ability1: "C",
  ability2: "Q",
  ability3: "E",
  ultimate: "X",
  reload: "R",
  useObject: "F",
  drop: "G",
  inspect: "Y",
  ping: "Z",
  voiceTeam: "V",
  voiceParty: "T",
  buyMenu: "B",
  megamap: "M",
  crosshairCode: "0;s;1;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0",
  crosshairColor: "Cyan",
  displayMode: "Fullscreen",
  resolution: "1920×1080",
  frameRateLimit: "Unlocked",
  vsync: "OFF",
  nvidiaReflex: "ON + Boost",
  materialQuality: "Low",
  textureQuality: "Low",
  detailQuality: "Low",
  antiAliasing: "MSAA 2x",
  bloom: "OFF",
  distortion: "OFF",
  castShadows: "OFF",
  masterVolume: "50",
  musicVolume: "0",
  sfxVolume: "80-100",
  voiceChatVolume: "100",
  hrtf: "ON",
  minimapRotate: "Rotating",
  minimapCentered: "ON",
  minimapSize: "1.10",
  minimapZoom: "0.90",
  visionCones: "ON",
};

export const DEFAULT_FORTNITE: FortniteProfile = {
  id: "fortnite-default",
  name: "Pro Default",
  game: "fortnite",
  isDefault: true,
  keyboardLayout: "qwerty",
  dpi: "800",
  pollingRate: "1000 Hz",
  mouseAcceleration: "OFF",
  rawInput: "ON",
  xSens: "8.0 %",
  ySens: "8.0 %",
  targetingSens: "60 %",
  scopeSens: "60 %",
  buildingSens: "2.0×",
  editSens: "1.5×",
  wall: "Q",
  floor: "C",
  ramp: "Z",
  roof: "X",
  trap: "E",
  edit: "F",
  resetEdit: "V",
  use: "G",
  reload: "R",
  inventory: "I",
  turboBuilding: "ON",
  resetBuildingChoice: "OFF",
  confirmEditOnRelease: "ON",
  disablePreEdit: "ON",
  autoMaterialChange: "ON",
  renderingMode: "Performance",
  resolution: "1920×1080",
  fpsLimit: "240",
  vsync: "OFF",
  threeDResolution: "100 %",
  viewDistance: "Epic",
  shadows: "OFF",
  antiAliasing: "OFF",
  textures: "Low",
  effects: "Low",
  postProcessing: "Low",
  motionBlur: "OFF",
  nvidiaReflex: "ON + Boost",
  musicVolume: "0 %",
  sfxVolume: "100 %",
  voiceChatVolume: "80 %",
  threeDHeadphones: "ON",
  visualizeSounds: "ON",
};

export const DEFAULT_LOL: LolProfile = {
  id: "lol-default",
  name: "Pro Default (Faker-like)",
  game: "lol",
  isDefault: true,
  keyboardLayout: "qwerty",
  dpi: "800-1600",
  gameMouseSpeed: "6 / 10",
  mouseAcceleration: "OFF",
  vsync: "OFF",
  spell1: "Q",
  spell2: "W",
  spell3: "E",
  ultimate: "R",
  summoner1: "D",
  summoner2: "F",
  attackMove: "A",
  attackMoveInstant: "X",
  stop: "S",
  holdPosition: "J",
  recall: "B",
  shop: "P",
  smartCastOn: "ON",
  smartCastOnRelease: "ON",
  cameraLock: "OFF",
  minimapScale: "75-100 %",
  showTurretRange: "ON",
  showAttackRadius: "ON",
  numericCooldowns: "ON",
  resolution: "1920×1080",
  windowMode: "Borderless",
  frameRateCap: "240",
  characterQuality: "Medium",
  environmentQuality: "Low",
  shadowQuality: "OFF",
  effectsQuality: "Low",
  antiAliasing: "OFF",
  masterVolume: "30-50 %",
  musicVolume: "0 %",
  sfxVolume: "75-100 %",
  voiceVolume: "75 %",
  pingsVolume: "75-100 %",
  announcer: "75 %",
};

export const DEFAULTS_BY_GAME: Record<GameId, AnyProfile> = {
  valorant: DEFAULT_VALORANT,
  fortnite: DEFAULT_FORTNITE,
  lol: DEFAULT_LOL,
};

/* ============================================================
   ZUSTAND STORE — custom profiles + active selection per game
   ============================================================ */

interface ProfilesState {
  /** Custom profiles per game (default profiles are NOT stored here) */
  customProfiles: {
    valorant: ValorantProfile[];
    fortnite: FortniteProfile[];
    lol: LolProfile[];
  };
  /** Currently-selected profile ID per game (defaults to "<game>-default") */
  activeProfileId: Record<GameId, string>;
  /** True once initial hydration from SQLite is complete */
  loaded: boolean;

  /* DB hydration */
  hydrate: () => Promise<void>;

  /* Mutations */
  setActiveProfile: (game: GameId, profileId: string) => void;
  createProfile: (
    game: GameId,
    opts: { name: string; keyboardLayout: KeyboardLayout; basedOn?: string }
  ) => string;
  updateProfile: (profile: AnyProfile) => void;
  renameProfile: (game: GameId, profileId: string, newName: string) => void;
  deleteProfile: (game: GameId, profileId: string) => void;
}

function genId(game: GameId) {
  return `${game}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useProfiles = create<ProfilesState>()((set, get) => ({
  customProfiles: { valorant: [], fortnite: [], lol: [] },
  activeProfileId: {
    valorant: DEFAULT_VALORANT.id,
    fortnite: DEFAULT_FORTNITE.id,
    lol: DEFAULT_LOL.id,
  },
  loaded: false,

  hydrate: async () => {
    if (get().loaded) return;
    try {
      const rows = await dbListProfiles();
      const customs: ProfilesState["customProfiles"] = { valorant: [], fortnite: [], lol: [] };
      for (const r of rows) {
        try {
          const parsed = JSON.parse(r.data) as AnyProfile;
          if (r.game === "valorant") customs.valorant.push(parsed as ValorantProfile);
          else if (r.game === "fortnite") customs.fortnite.push(parsed as FortniteProfile);
          else if (r.game === "lol") customs.lol.push(parsed as LolProfile);
        } catch (e) {
          console.error("[profiles] failed to parse row:", r.id, e);
        }
      }
      const active = await dbGetActiveProfiles();
      const activeProfileId: Record<GameId, string> = {
        valorant: active.valorant || DEFAULT_VALORANT.id,
        fortnite: active.fortnite || DEFAULT_FORTNITE.id,
        lol: active.lol || DEFAULT_LOL.id,
      };
      set({ customProfiles: customs, activeProfileId, loaded: true });
    } catch (e) {
      console.error("[profiles] hydrate failed:", e);
      set({ loaded: true });
    }
  },

  setActiveProfile: (game, profileId) => {
    set((s) => ({ activeProfileId: { ...s.activeProfileId, [game]: profileId } }));
    dbSetActiveProfile(game, profileId).catch((e) => console.error("[profiles] setActive DB failed:", e));
  },

  createProfile: (game, opts) => {
    const def = DEFAULTS_BY_GAME[game];
    const customs = get().customProfiles[game];
    let base: AnyProfile = def;
    if (opts.basedOn && opts.basedOn !== def.id) {
      const found = customs.find((p) => p.id === opts.basedOn);
      if (found) base = found;
    }
    const newId = genId(game);
    const cloned: AnyProfile = {
      ...base,
      id: newId,
      name: opts.name,
      isDefault: false,
      keyboardLayout: opts.keyboardLayout,
    };

    set((s) => {
      const list = [...s.customProfiles[game], cloned as any];
      return {
        customProfiles: { ...s.customProfiles, [game]: list },
        activeProfileId: { ...s.activeProfileId, [game]: newId },
      };
    });

    // Persist to DB (fire and forget)
    dbInsertProfile({
      id: cloned.id,
      game,
      name: cloned.name,
      keyboard_layout: cloned.keyboardLayout,
      data: cloned,
    }).catch((e) => console.error("[profiles] createProfile DB failed:", e));
    dbSetActiveProfile(game, newId).catch((e) => console.error("[profiles] setActive DB failed:", e));
    return newId;
  },

  updateProfile: (profile) => {
    if (profile.isDefault) return; // safety
    set((s) => {
      const list = s.customProfiles[profile.game].map((p: AnyProfile) =>
        p.id === profile.id ? profile : p
      );
      return { customProfiles: { ...s.customProfiles, [profile.game]: list as any } };
    });
    dbUpdateProfile({
      id: profile.id,
      name: profile.name,
      keyboard_layout: profile.keyboardLayout,
      data: profile,
    }).catch((e) => console.error("[profiles] updateProfile DB failed:", e));
  },

  renameProfile: (game, profileId, newName) => {
    const def = DEFAULTS_BY_GAME[game];
    if (profileId === def.id) return; // safety
    let updated: AnyProfile | null = null;
    set((s) => {
      const list = s.customProfiles[game].map((p: AnyProfile) => {
        if (p.id === profileId) {
          const next = { ...p, name: newName };
          updated = next;
          return next;
        }
        return p;
      });
      return { customProfiles: { ...s.customProfiles, [game]: list as any } };
    });
    if (updated) {
      const u = updated as AnyProfile;
      dbUpdateProfile({
        id: u.id,
        name: u.name,
        keyboard_layout: u.keyboardLayout,
        data: u,
      }).catch((e) => console.error("[profiles] rename DB failed:", e));
    }
  },

  deleteProfile: (game, profileId) => {
    const def = DEFAULTS_BY_GAME[game];
    if (profileId === def.id) return; // safety
    set((s) => {
      const list = s.customProfiles[game].filter((p: AnyProfile) => p.id !== profileId);
      const activeId = s.activeProfileId[game];
      const newActiveId = activeId === profileId ? def.id : activeId;
      return {
        customProfiles: { ...s.customProfiles, [game]: list as any },
        activeProfileId: { ...s.activeProfileId, [game]: newActiveId },
      };
    });
    dbDeleteProfile(profileId).catch((e) => console.error("[profiles] delete DB failed:", e));
    // Also update active in DB if changed
    const activeId = get().activeProfileId[game];
    dbSetActiveProfile(game, activeId).catch(() => {});
  },
}));

/* ============================================================
   Helper hooks — compute derived values OUTSIDE the store
   to avoid returning new array/object refs from selectors
   (which would cause infinite re-render loops in Zustand 5).
   ============================================================ */

/** Get the list of all profiles for a game (default + customs) */
export function useProfileList(game: GameId): AnyProfile[] {
  const customs = useProfiles((s) => s.customProfiles[game]);
  return [DEFAULTS_BY_GAME[game], ...customs];
}

/** Get the currently-active profile for a game */
export function useActiveProfile(game: GameId): AnyProfile {
  const activeId = useProfiles((s) => s.activeProfileId[game]);
  const customs = useProfiles((s) => s.customProfiles[game]);
  const def = DEFAULTS_BY_GAME[game];
  if (activeId === def.id) return def;
  const found = (customs as AnyProfile[]).find((p) => p.id === activeId);
  return found ?? def;
}
