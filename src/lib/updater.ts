import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

/* ============================================================
   Auto-updater wrapper
   ============================================================ */

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  newVersion?: string;
  body?: string;
  date?: string;
}

let cachedUpdate: Update | null = null;

/** Check if an update is available. Cached for the rest of the session. */
export async function checkForUpdate(): Promise<UpdateInfo> {
  try {
    const update = await check();
    if (update) {
      cachedUpdate = update;
      return {
        available: true,
        currentVersion: update.currentVersion,
        newVersion: update.version,
        body: update.body,
        date: update.date,
      };
    }
    // No update available — get current version from the runtime API
    const { getVersion } = await import("@tauri-apps/api/app");
    return { available: false, currentVersion: await getVersion() };
  } catch (e) {
    console.error("[updater] check failed:", e);
    throw e;
  }
}

export interface ProgressCb {
  (event: { kind: "started"; total?: number } | { kind: "progress"; chunkLength: number } | { kind: "finished" }): void;
}

/** Download + install + relaunch. Throws on error. */
export async function downloadAndInstallUpdate(onProgress?: ProgressCb): Promise<void> {
  if (!cachedUpdate) {
    const fresh = await check();
    if (!fresh) throw new Error("No update available");
    cachedUpdate = fresh;
  }
  let total: number | undefined;
  await cachedUpdate.downloadAndInstall((evt) => {
    if (evt.event === "Started") {
      total = evt.data.contentLength ?? undefined;
      onProgress?.({ kind: "started", total });
    } else if (evt.event === "Progress") {
      onProgress?.({ kind: "progress", chunkLength: evt.data.chunkLength });
    } else if (evt.event === "Finished") {
      onProgress?.({ kind: "finished" });
    }
  });
  // After install, relaunch so the user lands on the new version immediately
  await relaunch();
}
