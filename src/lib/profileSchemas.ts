import type {
  AnyProfile, GameId, ValorantProfile, FortniteProfile, LolProfile,
} from "../store/profiles";

export interface FieldDef {
  /** Profile object key (e.g., "dpi") */
  key: string;
  /** Human label shown in exports / used for import matching */
  label: string;
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
}

/* ---------- VALORANT ---------- */
export const VALORANT_SCHEMA: SectionDef[] = [
  { title: "Mouse", fields: [
    { key: "dpi", label: "DPI" },
    { key: "pollingRate", label: "Polling Rate" },
    { key: "mouseAcceleration", label: "Mouse Acceleration" },
    { key: "rawInputBuffer", label: "Raw Input Buffer" },
  ]},
  { title: "Sensitivity", fields: [
    { key: "sensitivity", label: "Sensitivity" },
    { key: "adsMultiplier", label: "ADS Multiplier" },
    { key: "scopedMultiplier", label: "Scoped Multiplier" },
    { key: "adsMode", label: "ADS Mode" },
    { key: "sniperMode", label: "Sniper Mode" },
    { key: "separateZoomSens", label: "Separate Zoom Sens" },
  ]},
  { title: "Keybinds", fields: [
    { key: "ability1", label: "Ability 1" },
    { key: "ability2", label: "Ability 2" },
    { key: "ability3", label: "Ability 3" },
    { key: "ultimate", label: "Ultimate" },
    { key: "reload", label: "Reload" },
    { key: "useObject", label: "Use Object" },
    { key: "drop", label: "Drop" },
    { key: "inspect", label: "Inspect" },
    { key: "ping", label: "Ping" },
    { key: "voiceTeam", label: "Voice Team" },
    { key: "voiceParty", label: "Voice Party" },
    { key: "buyMenu", label: "Buy Menu" },
    { key: "megamap", label: "Megamap" },
  ]},
  { title: "Crosshair", fields: [
    { key: "crosshairCode", label: "Crosshair Code" },
    { key: "crosshairColor", label: "Crosshair Color" },
  ]},
  { title: "Graphics", fields: [
    { key: "displayMode", label: "Display Mode" },
    { key: "resolution", label: "Resolution" },
    { key: "frameRateLimit", label: "Frame Rate Limit" },
    { key: "vsync", label: "VSync" },
    { key: "nvidiaReflex", label: "NVIDIA Reflex" },
    { key: "materialQuality", label: "Material Quality" },
    { key: "textureQuality", label: "Texture Quality" },
    { key: "detailQuality", label: "Detail Quality" },
    { key: "antiAliasing", label: "Anti-Aliasing" },
    { key: "bloom", label: "Bloom" },
    { key: "distortion", label: "Distortion" },
    { key: "castShadows", label: "Cast Shadows" },
  ]},
  { title: "Audio", fields: [
    { key: "masterVolume", label: "Master Volume" },
    { key: "musicVolume", label: "Music Volume" },
    { key: "sfxVolume", label: "SFX Volume" },
    { key: "voiceChatVolume", label: "Voice Chat Volume" },
    { key: "hrtf", label: "HRTF" },
  ]},
  { title: "Minimap", fields: [
    { key: "minimapRotate", label: "Minimap Rotate" },
    { key: "minimapCentered", label: "Minimap Centered" },
    { key: "minimapSize", label: "Minimap Size" },
    { key: "minimapZoom", label: "Minimap Zoom" },
    { key: "visionCones", label: "Vision Cones" },
  ]},
];

/* ---------- FORTNITE ---------- */
export const FORTNITE_SCHEMA: SectionDef[] = [
  { title: "Mouse", fields: [
    { key: "dpi", label: "DPI" },
    { key: "pollingRate", label: "Polling Rate" },
    { key: "mouseAcceleration", label: "Mouse Acceleration" },
    { key: "rawInput", label: "Raw Input" },
  ]},
  { title: "Sensitivity", fields: [
    { key: "xSens", label: "X-Axis Sensitivity" },
    { key: "ySens", label: "Y-Axis Sensitivity" },
    { key: "targetingSens", label: "Targeting Sensitivity" },
    { key: "scopeSens", label: "Scope Sensitivity" },
    { key: "buildingSens", label: "Building Sensitivity" },
    { key: "editSens", label: "Edit Sensitivity" },
  ]},
  { title: "Keybinds", fields: [
    { key: "wall", label: "Wall" },
    { key: "floor", label: "Floor" },
    { key: "ramp", label: "Ramp" },
    { key: "roof", label: "Roof" },
    { key: "trap", label: "Trap" },
    { key: "edit", label: "Edit" },
    { key: "resetEdit", label: "Reset Edit" },
    { key: "use", label: "Use" },
    { key: "reload", label: "Reload" },
    { key: "inventory", label: "Inventory" },
  ]},
  { title: "Building & Editing", fields: [
    { key: "turboBuilding", label: "Turbo Building" },
    { key: "resetBuildingChoice", label: "Reset Building Choice" },
    { key: "confirmEditOnRelease", label: "Confirm Edit on Release" },
    { key: "disablePreEdit", label: "Disable Pre-Edit" },
    { key: "autoMaterialChange", label: "Auto Material Change" },
  ]},
  { title: "Graphics", fields: [
    { key: "renderingMode", label: "Rendering Mode" },
    { key: "resolution", label: "Resolution" },
    { key: "fpsLimit", label: "FPS Limit" },
    { key: "vsync", label: "VSync" },
    { key: "threeDResolution", label: "3D Resolution" },
    { key: "viewDistance", label: "View Distance" },
    { key: "shadows", label: "Shadows" },
    { key: "antiAliasing", label: "Anti-Aliasing" },
    { key: "textures", label: "Textures" },
    { key: "effects", label: "Effects" },
    { key: "postProcessing", label: "Post Processing" },
    { key: "motionBlur", label: "Motion Blur" },
    { key: "nvidiaReflex", label: "NVIDIA Reflex" },
  ]},
  { title: "Audio", fields: [
    { key: "musicVolume", label: "Music Volume" },
    { key: "sfxVolume", label: "SFX Volume" },
    { key: "voiceChatVolume", label: "Voice Chat Volume" },
    { key: "threeDHeadphones", label: "3D Headphones" },
    { key: "visualizeSounds", label: "Visualize Sounds" },
  ]},
];

/* ---------- LOL ---------- */
export const LOL_SCHEMA: SectionDef[] = [
  { title: "Mouse", fields: [
    { key: "dpi", label: "DPI" },
    { key: "gameMouseSpeed", label: "Game Mouse Speed" },
    { key: "mouseAcceleration", label: "Mouse Acceleration" },
    { key: "vsync", label: "VSync" },
  ]},
  { title: "Keybinds", fields: [
    { key: "spell1", label: "Spell 1" },
    { key: "spell2", label: "Spell 2" },
    { key: "spell3", label: "Spell 3" },
    { key: "ultimate", label: "Ultimate" },
    { key: "summoner1", label: "Summoner 1" },
    { key: "summoner2", label: "Summoner 2" },
    { key: "attackMove", label: "Attack Move" },
    { key: "attackMoveInstant", label: "Attack Move Instant" },
    { key: "stop", label: "Stop" },
    { key: "holdPosition", label: "Hold Position" },
    { key: "recall", label: "Recall" },
    { key: "shop", label: "Shop" },
  ]},
  { title: "Smart Cast", fields: [
    { key: "smartCastOn", label: "Smart Cast On" },
    { key: "smartCastOnRelease", label: "Smart Cast On Release" },
  ]},
  { title: "Camera & HUD", fields: [
    { key: "cameraLock", label: "Camera Lock" },
    { key: "minimapScale", label: "Minimap Scale" },
    { key: "showTurretRange", label: "Show Turret Range" },
    { key: "showAttackRadius", label: "Show Attack Radius" },
    { key: "numericCooldowns", label: "Numeric Cooldowns" },
  ]},
  { title: "Graphics", fields: [
    { key: "resolution", label: "Resolution" },
    { key: "windowMode", label: "Window Mode" },
    { key: "frameRateCap", label: "Frame Rate Cap" },
    { key: "characterQuality", label: "Character Quality" },
    { key: "environmentQuality", label: "Environment Quality" },
    { key: "shadowQuality", label: "Shadow Quality" },
    { key: "effectsQuality", label: "Effects Quality" },
    { key: "antiAliasing", label: "Anti-Aliasing" },
  ]},
  { title: "Audio", fields: [
    { key: "masterVolume", label: "Master Volume" },
    { key: "musicVolume", label: "Music Volume" },
    { key: "sfxVolume", label: "SFX Volume" },
    { key: "voiceVolume", label: "Voice Volume" },
    { key: "pingsVolume", label: "Pings Volume" },
    { key: "announcer", label: "Announcer" },
  ]},
];

export const SCHEMA_BY_GAME: Record<GameId, SectionDef[]> = {
  valorant: VALORANT_SCHEMA,
  fortnite: FORTNITE_SCHEMA,
  lol: LOL_SCHEMA,
};

export const GAME_LABEL: Record<GameId, string> = {
  valorant: "Valorant",
  fortnite: "Fortnite",
  lol: "League of Legends",
};

/** Read a value by key, fallback to empty string */
export function getField(profile: AnyProfile, key: string): string {
  const v = (profile as unknown as Record<string, unknown>)[key];
  return v == null ? "" : String(v);
}

/** Apply parsed key/value pairs to a profile (only known fields) */
export function applyImportedValues(
  base: AnyProfile,
  values: Record<string, string>
): AnyProfile {
  const schema = SCHEMA_BY_GAME[base.game];
  const next = { ...base } as Record<string, unknown>;
  const labelToKey: Record<string, string> = {};
  for (const s of schema) for (const f of s.fields) labelToKey[norm(f.label)] = f.key;

  for (const [k, v] of Object.entries(values)) {
    const n = norm(k);
    if (labelToKey[n]) {
      next[labelToKey[n]] = v;
    } else if (n === "layout" || n === "keyboard" || n === "keyboard layout") {
      const low = v.toLowerCase().trim();
      if (low === "qwerty" || low === "qwertz" || low === "azerty") {
        (next as { keyboardLayout?: string }).keyboardLayout = low;
      }
    } else if (n === "name" || n === "profile name" || n === "profile") {
      next.name = v;
    }
  }
  return next as unknown as AnyProfile;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[*_`#]+/g, "").replace(/\s+/g, " ");
}

/** Type guard helper to narrow AnyProfile */
export function isValorant(p: AnyProfile): p is ValorantProfile { return p.game === "valorant"; }
export function isFortnite(p: AnyProfile): p is FortniteProfile { return p.game === "fortnite"; }
export function isLol(p: AnyProfile): p is LolProfile { return p.game === "lol"; }
