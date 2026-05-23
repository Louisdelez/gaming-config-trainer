import { register, unregister, isRegistered } from "@tauri-apps/plugin-global-shortcut";

/* ============================================================
   Global hotkeys — fire even when game has focus
   Accepts any Tauri accelerator format (e.g. "F9", "Ctrl+Shift+S").
   ============================================================ */

interface HotkeyConfig {
  screenshot?: string;
  record?: string;
  replay?: string;
}

interface Handlers {
  onScreenshot?: () => void;
  onRecordToggle?: () => void;
  onReplay?: () => void;
}

const REGISTERED: string[] = [];

/** Register the configured hotkeys with the given handlers. Safe to call repeatedly. */
export async function registerCaptureHotkeys(handlers: Handlers, hotkeys: HotkeyConfig) {
  await unregisterCaptureHotkeys();

  const bindings: { key: string | undefined; fn: (() => void) | undefined }[] = [
    { key: hotkeys.screenshot, fn: handlers.onScreenshot },
    { key: hotkeys.record,     fn: handlers.onRecordToggle },
    { key: hotkeys.replay,     fn: handlers.onReplay },
  ];

  for (const { key, fn } of bindings) {
    if (!key || !fn) continue;
    try {
      await register(key, (event) => { if (event.state === "Pressed") fn(); });
      REGISTERED.push(key);
    } catch (e) {
      console.error("[hotkeys] register", key, "failed:", e);
    }
  }
}

export async function unregisterCaptureHotkeys() {
  for (const k of REGISTERED.splice(0)) {
    try {
      if (await isRegistered(k)) await unregister(k);
    } catch (e) {
      console.error("[hotkeys] unregister", k, "failed:", e);
    }
  }
}

/* ============================================================
   Browser KeyboardEvent → Tauri accelerator string
   ============================================================ */

const MODIFIER_KEYS = new Set(["Control", "Alt", "Shift", "Meta", "OS"]);

/** Convert a KeyboardEvent into a Tauri accelerator string (e.g. "Ctrl+Shift+A", "F9"). */
export function eventToAccelerator(e: KeyboardEvent): string | null {
  // Ignore lone modifier presses (we need an actual key)
  if (MODIFIER_KEYS.has(e.key)) return null;

  const modifiers: string[] = [];
  if (e.ctrlKey)  modifiers.push("Ctrl");
  if (e.altKey)   modifiers.push("Alt");
  if (e.shiftKey) modifiers.push("Shift");
  if (e.metaKey)  modifiers.push("CmdOrCtrl");

  let key: string | null = null;

  // Function keys
  if (/^F([1-9]|1\d|2[0-4])$/.test(e.key)) {
    key = e.key;
  }
  // Single character (letters, digits, symbols)
  else if (e.key.length === 1) {
    key = e.key.toUpperCase();
  }
  // Arrows
  else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
    key = e.key.replace("Arrow", "");
  }
  // Space and common named keys
  else if (e.key === " " || e.code === "Space") {
    key = "Space";
  } else if (["Tab", "Enter", "Backspace", "Delete", "Home", "End", "PageUp", "PageDown", "Insert"].includes(e.key)) {
    key = e.key;
  }

  if (!key) return null;
  return modifiers.length > 0 ? `${modifiers.join("+")}+${key}` : key;
}

/** Pretty label for an accelerator (for UI display) */
export function prettyAccelerator(s: string): string {
  return s.replace(/CmdOrCtrl/g, "Win");
}
