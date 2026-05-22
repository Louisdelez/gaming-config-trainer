import { register, unregister, isRegistered } from "@tauri-apps/plugin-global-shortcut";

/* ============================================================
   Global hotkeys — fire even when game has focus
   ============================================================ */

export const HOTKEY_SCREENSHOT = "F10";
export const HOTKEY_RECORD     = "F9";
export const HOTKEY_REPLAY     = "F11";

interface Handlers {
  onScreenshot?: () => void;
  onRecordToggle?: () => void;
  onReplay?: () => void;
}

const REGISTERED: string[] = [];

/** Register all gaming-capture hotkeys. Safe to call multiple times. */
export async function registerCaptureHotkeys(handlers: Handlers) {
  await unregisterCaptureHotkeys();

  if (handlers.onScreenshot) {
    try {
      await register(HOTKEY_SCREENSHOT, (event) => {
        if (event.state === "Pressed") handlers.onScreenshot!();
      });
      REGISTERED.push(HOTKEY_SCREENSHOT);
    } catch (e) {
      console.error("[hotkeys] register", HOTKEY_SCREENSHOT, "failed:", e);
    }
  }

  if (handlers.onRecordToggle) {
    try {
      await register(HOTKEY_RECORD, (event) => {
        if (event.state === "Pressed") handlers.onRecordToggle!();
      });
      REGISTERED.push(HOTKEY_RECORD);
    } catch (e) {
      console.error("[hotkeys] register", HOTKEY_RECORD, "failed:", e);
    }
  }

  if (handlers.onReplay) {
    try {
      await register(HOTKEY_REPLAY, (event) => {
        if (event.state === "Pressed") handlers.onReplay!();
      });
      REGISTERED.push(HOTKEY_REPLAY);
    } catch (e) {
      console.error("[hotkeys] register", HOTKEY_REPLAY, "failed:", e);
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
