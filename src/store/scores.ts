import { create } from "zustand";
import { dbListScores, dbInsertScore, dbDeleteScoresByGame, dbDeleteAllScores } from "../lib/db";

export interface ScoreEntry {
  game: string;
  score: number;
  unit: string;
  timestamp: number;
}

interface ScoresState {
  scores: ScoreEntry[];
  loaded: boolean;
  /** Load from DB once on app start */
  hydrate: () => Promise<void>;
  addScore: (entry: Omit<ScoreEntry, "timestamp">) => Promise<void>;
  getBest: (game: string) => ScoreEntry | undefined;
  getAverage: (game: string) => number | null;
  getByGame: (game: string) => ScoreEntry[];
  clearGame: (game: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useScores = create<ScoresState>()((set, get) => ({
  scores: [],
  loaded: false,

  hydrate: async () => {
    if (get().loaded) return;
    try {
      const rows = await dbListScores();
      const scores: ScoreEntry[] = rows.map((r) => ({
        game: r.game,
        score: r.score,
        unit: r.unit,
        timestamp: r.timestamp,
      }));
      set({ scores, loaded: true });
    } catch (e) {
      console.error("[scores] hydrate failed:", e);
      set({ loaded: true });
    }
  },

  addScore: async (entry) => {
    const full = { ...entry, timestamp: Date.now() };
    set((s) => ({ scores: [...s.scores, full] }));
    try {
      await dbInsertScore(full);
    } catch (e) {
      console.error("[scores] addScore failed:", e);
    }
  },

  getBest: (game) => {
    const items = get().scores.filter((s) => s.game === game);
    if (items.length === 0) return undefined;
    const lowerIsBetter = items[0].unit === "ms";
    return items.reduce((best, cur) =>
      lowerIsBetter
        ? cur.score < best.score ? cur : best
        : cur.score > best.score ? cur : best
    );
  },

  getAverage: (game) => {
    const items = get().scores.filter((s) => s.game === game);
    if (items.length === 0) return null;
    return items.reduce((a, b) => a + b.score, 0) / items.length;
  },

  getByGame: (game) =>
    get().scores.filter((s) => s.game === game).sort((a, b) => b.timestamp - a.timestamp),

  clearGame: async (game) => {
    set((s) => ({ scores: s.scores.filter((sc) => sc.game !== game) }));
    try {
      await dbDeleteScoresByGame(game);
    } catch (e) {
      console.error("[scores] clearGame failed:", e);
    }
  },

  clearAll: async () => {
    set({ scores: [] });
    try {
      await dbDeleteAllScores();
    } catch (e) {
      console.error("[scores] clearAll failed:", e);
    }
  },
}));
