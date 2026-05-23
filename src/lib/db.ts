import Database from "@tauri-apps/plugin-sql";

/* ============================================================
   SQLite service — wraps the Tauri SQL plugin into a singleton
   ============================================================ */

let _db: Database | null = null;
let _loadPromise: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  if (_db) return _db;
  if (_loadPromise) return _loadPromise;
  _loadPromise = Database.load("sqlite:gct.db").then((db) => {
    _db = db;
    return db;
  });
  return _loadPromise;
}

/* ---------- PROFILES ---------- */
export interface DbProfileRow {
  id: string;
  game: string;
  name: string;
  keyboard_layout: string;
  data: string; // JSON
  created_at: number;
  updated_at: number;
}

export async function dbListProfiles(game?: string): Promise<DbProfileRow[]> {
  const db = await getDb();
  if (game) {
    return db.select<DbProfileRow[]>("SELECT * FROM profiles WHERE game = $1 ORDER BY created_at ASC", [game]);
  }
  return db.select<DbProfileRow[]>("SELECT * FROM profiles ORDER BY game, created_at ASC");
}

export async function dbInsertProfile(p: {
  id: string;
  game: string;
  name: string;
  keyboard_layout: string;
  data: object;
}) {
  const db = await getDb();
  const now = Date.now();
  await db.execute(
    "INSERT INTO profiles (id, game, name, keyboard_layout, data, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [p.id, p.game, p.name, p.keyboard_layout, JSON.stringify(p.data), now, now]
  );
}

export async function dbUpdateProfile(p: {
  id: string;
  name: string;
  keyboard_layout: string;
  data: object;
}) {
  const db = await getDb();
  await db.execute(
    "UPDATE profiles SET name = $1, keyboard_layout = $2, data = $3, updated_at = $4 WHERE id = $5",
    [p.name, p.keyboard_layout, JSON.stringify(p.data), Date.now(), p.id]
  );
}

export async function dbDeleteProfile(id: string) {
  const db = await getDb();
  await db.execute("DELETE FROM profiles WHERE id = $1", [id]);
}

/* ---------- ACTIVE PROFILE ---------- */
export async function dbGetActiveProfiles(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<{ game: string; profile_id: string }[]>("SELECT game, profile_id FROM active_profiles");
  const map: Record<string, string> = {};
  for (const r of rows) map[r.game] = r.profile_id;
  return map;
}

export async function dbSetActiveProfile(game: string, profileId: string) {
  const db = await getDb();
  // UPSERT
  await db.execute(
    `INSERT INTO active_profiles (game, profile_id) VALUES ($1, $2)
     ON CONFLICT(game) DO UPDATE SET profile_id = excluded.profile_id`,
    [game, profileId]
  );
}

/* ---------- SCORES ---------- */
export interface DbScoreRow {
  id: number;
  game: string;
  score: number;
  unit: string;
  timestamp: number;
}

export async function dbListScores(game?: string): Promise<DbScoreRow[]> {
  const db = await getDb();
  if (game) {
    return db.select<DbScoreRow[]>(
      "SELECT * FROM scores WHERE game = $1 ORDER BY timestamp DESC",
      [game]
    );
  }
  return db.select<DbScoreRow[]>("SELECT * FROM scores ORDER BY timestamp DESC");
}

export async function dbInsertScore(s: { game: string; score: number; unit: string; timestamp: number }) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO scores (game, score, unit, timestamp) VALUES ($1, $2, $3, $4)",
    [s.game, s.score, s.unit, s.timestamp]
  );
}

export async function dbDeleteScoresByGame(game: string) {
  const db = await getDb();
  await db.execute("DELETE FROM scores WHERE game = $1", [game]);
}

export async function dbDeleteAllScores() {
  const db = await getDb();
  await db.execute("DELETE FROM scores");
}

/* ---------- CAPTURES ---------- */
export interface DbCaptureRow {
  id: number;
  kind: string;
  path: string;
  size_bytes: number | null;
  encoder: string | null;
  duration_sec: number | null;
  created_at: number;
}

export async function dbListCaptures(limit = 50): Promise<DbCaptureRow[]> {
  const db = await getDb();
  return db.select<DbCaptureRow[]>(
    "SELECT * FROM captures ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
}

export async function dbInsertCapture(c: {
  kind: string;
  path: string;
  size_bytes?: number | null;
  encoder?: string | null;
  duration_sec?: number | null;
}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO captures (kind, path, size_bytes, encoder, duration_sec, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [c.kind, c.path, c.size_bytes ?? null, c.encoder ?? null, c.duration_sec ?? null, Date.now()]
  );
}

export async function dbDeleteCapture(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM captures WHERE id = $1", [id]);
}

/* ---------- TRACKS (music library) ---------- */
export interface DbTrackRow {
  id: number;
  path: string;
  title: string;
  artist: string | null;
  duration_sec: number | null;
  added_at: number;
}

export async function dbListTracks(): Promise<DbTrackRow[]> {
  const db = await getDb();
  return db.select<DbTrackRow[]>("SELECT * FROM tracks ORDER BY added_at DESC");
}

export async function dbInsertTrack(t: { path: string; title: string; artist?: string | null; duration_sec?: number | null }): Promise<number | null> {
  const db = await getDb();
  // Use INSERT OR IGNORE since path is UNIQUE
  await db.execute(
    "INSERT OR IGNORE INTO tracks (path, title, artist, duration_sec, added_at) VALUES ($1, $2, $3, $4, $5)",
    [t.path, t.title, t.artist ?? null, t.duration_sec ?? null, Date.now()]
  );
  const rows = await db.select<{ id: number }[]>("SELECT id FROM tracks WHERE path = $1", [t.path]);
  return rows[0]?.id ?? null;
}

export async function dbUpdateTrackDuration(id: number, duration_sec: number) {
  const db = await getDb();
  await db.execute("UPDATE tracks SET duration_sec = $1 WHERE id = $2", [duration_sec, id]);
}

export async function dbDeleteTrack(id: number) {
  const db = await getDb();
  await db.execute("DELETE FROM tracks WHERE id = $1", [id]);
}

/* ---------- SETTINGS (key/value) ---------- */
export async function dbGetSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<{ value: string }[]>("SELECT value FROM settings WHERE key = $1", [key]);
  return rows.length > 0 ? rows[0].value : null;
}

export async function dbSetSetting(key: string, value: string) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}

export async function dbGetAllSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<{ key: string; value: string }[]>("SELECT key, value FROM settings");
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

/* ---------- MIGRATION FROM LOCALSTORAGE (one-time) ---------- */
const MIGRATION_FLAG = "gct-db-migrated-v1";

export async function migrateFromLocalStorage(): Promise<void> {
  if (localStorage.getItem(MIGRATION_FLAG) === "true") return;

  try {
    /* Profiles */
    const rawProfiles = localStorage.getItem("gct-profiles");
    if (rawProfiles) {
      try {
        const parsed = JSON.parse(rawProfiles);
        const state = parsed.state ?? parsed;
        const customs = state.customProfiles || {};
        for (const game of ["valorant", "fortnite", "lol"] as const) {
          const list = (customs[game] || []) as Array<{ id: string; name: string; keyboardLayout?: string }>;
          for (const p of list) {
            await dbInsertProfile({
              id: p.id,
              game,
              name: p.name,
              keyboard_layout: p.keyboardLayout || "qwerty",
              data: p,
            }).catch(() => {/* ignore dup */});
          }
        }
        const active = state.activeProfileId || {};
        for (const g of Object.keys(active)) {
          await dbSetActiveProfile(g, active[g]).catch(() => {});
        }
      } catch {/* invalid LS data, skip */}
    }

    /* Scores */
    const rawScores = localStorage.getItem("gct-scores");
    if (rawScores) {
      try {
        const parsed = JSON.parse(rawScores);
        const state = parsed.state ?? parsed;
        const scores = state.scores || [];
        for (const s of scores) {
          await dbInsertScore({
            game: s.game,
            score: s.score,
            unit: s.unit,
            timestamp: s.timestamp,
          }).catch(() => {});
        }
      } catch {/* skip */}
    }

    /* Settings */
    const rawSettings = localStorage.getItem("gct-settings");
    if (rawSettings) {
      try {
        const parsed = JSON.parse(rawSettings);
        const state = parsed.state ?? parsed;
        if (state.language) await dbSetSetting("language", state.language);
        if (state.keyboard) await dbSetSetting("keyboard", state.keyboard);
      } catch {/* skip */}
    }

    localStorage.setItem(MIGRATION_FLAG, "true");
    // eslint-disable-next-line no-console
    console.log("[DB] Migration from localStorage complete.");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[DB] Migration failed:", e);
  }
}
