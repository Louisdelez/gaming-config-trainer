import { create } from "zustand";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  dbListTracks, dbInsertTrack, dbDeleteTrack, dbUpdateTrackDuration, type DbTrackRow,
} from "../lib/db";

export interface Track {
  id: number;
  path: string;       // absolute file path on disk
  title: string;
  artist?: string | null;
  duration?: number | null;
}

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  tracks: Track[];        // library
  queue: Track[];         // current play queue
  currentIndex: number;   // index in queue
  isPlaying: boolean;
  volume: number;         // 0..1
  progress: number;       // seconds
  duration: number;       // seconds
  shuffle: boolean;
  repeat: RepeatMode;
  /** Right-side "now playing" panel visible? */
  panelOpen: boolean;
  loaded: boolean;

  hydrate: () => Promise<void>;
  /** Add a file path to the library (parsed title from filename) */
  addTrackFromPath: (absPath: string) => Promise<Track | null>;
  removeTrack: (id: number) => Promise<void>;

  /** Play a track from the library, replacing queue with all tracks */
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  togglePanel: () => void;

  /* Internal hooks for the audio engine to push state */
  _setProgress: (sec: number) => void;
  _setDuration: (sec: number) => void;
  _setIsPlaying: (playing: boolean) => void;
  _onTrackEnded: () => void;
}

function titleFromPath(p: string): string {
  const base = p.replace(/\\/g, "/").split("/").pop() ?? p;
  return base.replace(/\.[^.]+$/, "");
}

function rowToTrack(r: DbTrackRow): Track {
  return { id: r.id, path: r.path, title: r.title, artist: r.artist, duration: r.duration_sec };
}

export const usePlayer = create<PlayerState>()((set, get) => ({
  tracks: [],
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",
  panelOpen: false,
  loaded: false,

  hydrate: async () => {
    if (get().loaded) return;
    try {
      const rows = await dbListTracks();
      set({ tracks: rows.map(rowToTrack), loaded: true });
    } catch (e) {
      console.error("[player] hydrate failed:", e);
      set({ loaded: true });
    }
  },

  addTrackFromPath: async (absPath) => {
    const title = titleFromPath(absPath);
    try {
      const id = await dbInsertTrack({ path: absPath, title });
      if (id == null) return null;
      const newTrack: Track = { id, path: absPath, title };
      set((s) => {
        const existing = s.tracks.find((t) => t.id === id);
        if (existing) return s;
        return { tracks: [newTrack, ...s.tracks] };
      });
      return newTrack;
    } catch (e) {
      console.error("[player] addTrack failed:", e);
      return null;
    }
  },

  removeTrack: async (id) => {
    await dbDeleteTrack(id).catch(() => {});
    set((s) => {
      const newTracks = s.tracks.filter((t) => t.id !== id);
      const newQueue = s.queue.filter((t) => t.id !== id);
      let newIndex = s.currentIndex;
      if (s.queue[s.currentIndex]?.id === id) {
        // currently playing got removed — stop
        newIndex = -1;
      } else if (newIndex >= newQueue.length) {
        newIndex = -1;
      }
      return { tracks: newTracks, queue: newQueue, currentIndex: newIndex };
    });
  },

  playTrack: (track, queueOverride) => {
    const queue = queueOverride ?? get().tracks;
    const idx = queue.findIndex((t) => t.id === track.id);
    set({ queue, currentIndex: idx >= 0 ? idx : 0, isPlaying: true });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => set((s) => {
    if (s.queue.length === 0) return s;
    let next: number;
    if (s.repeat === "one") {
      next = s.currentIndex;
    } else if (s.shuffle) {
      next = Math.floor(Math.random() * s.queue.length);
    } else {
      next = s.currentIndex + 1;
      if (next >= s.queue.length) {
        if (s.repeat === "all") next = 0;
        else return { isPlaying: false, progress: 0 };
      }
    }
    return { currentIndex: next, isPlaying: true, progress: 0 };
  }),

  prev: () => set((s) => {
    if (s.queue.length === 0) return s;
    // If played > 3s, restart current track; else go to previous
    if (s.progress > 3) {
      return { progress: 0 };
    }
    const prev = s.currentIndex - 1;
    if (prev < 0) {
      if (s.repeat === "all") return { currentIndex: s.queue.length - 1, isPlaying: true, progress: 0 };
      return { progress: 0 };
    }
    return { currentIndex: prev, isPlaying: true, progress: 0 };
  }),

  seek: (sec) => set({ progress: sec }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set((s) => {
    const order: RepeatMode[] = ["off", "all", "one"];
    return { repeat: order[(order.indexOf(s.repeat) + 1) % order.length] };
  }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),

  _setProgress: (sec) => set({ progress: sec }),
  _setDuration: (sec) => {
    set({ duration: sec });
    // Update DB if we discovered a new duration
    const cur = get().queue[get().currentIndex];
    if (cur && (cur.duration == null || Math.abs((cur.duration ?? 0) - sec) > 1)) {
      dbUpdateTrackDuration(cur.id, sec).catch(() => {});
      set((s) => ({
        tracks: s.tracks.map((t) => t.id === cur.id ? { ...t, duration: sec } : t),
        queue: s.queue.map((t) => t.id === cur.id ? { ...t, duration: sec } : t),
      }));
    }
  },
  _setIsPlaying: (playing) => set({ isPlaying: playing }),
  _onTrackEnded: () => get().next(),
}));

/** Convert a Track's path into a tauri:// URL the <audio> element can load */
export function trackToUrl(track: Track): string {
  return convertFileSrc(track.path);
}
