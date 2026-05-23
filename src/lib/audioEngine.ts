import { usePlayer, trackToUrl, type Track } from "../store/player";

/* ============================================================
   Singleton HTMLAudioElement that mirrors the player store
   - One <audio> created lazily (after first interaction so
     browsers allow play())
   - Subscribes to store changes for src / play / pause / volume
   - Pushes timeupdate / loadedmetadata / ended back to the store
   ============================================================ */

let audioEl: HTMLAudioElement | null = null;
let unsubscribe: (() => void) | null = null;
let lastTrackId: number | null = null;
let seekPending: number | null = null;

function getAudio(): HTMLAudioElement {
  if (audioEl) return audioEl;
  audioEl = new Audio();
  audioEl.preload = "metadata";

  audioEl.addEventListener("timeupdate", () => {
    if (!audioEl) return;
    usePlayer.getState()._setProgress(audioEl.currentTime);
  });
  audioEl.addEventListener("loadedmetadata", () => {
    if (!audioEl) return;
    usePlayer.getState()._setDuration(audioEl.duration || 0);
    // Apply pending seek if any
    if (seekPending != null) {
      audioEl.currentTime = Math.min(seekPending, audioEl.duration || seekPending);
      seekPending = null;
    }
  });
  audioEl.addEventListener("ended", () => {
    usePlayer.getState()._onTrackEnded();
  });
  audioEl.addEventListener("error", (e) => {
    console.error("[audio] error", e, audioEl?.error);
    usePlayer.getState()._setIsPlaying(false);
  });
  audioEl.addEventListener("play", () => {
    usePlayer.getState()._setIsPlaying(true);
  });
  audioEl.addEventListener("pause", () => {
    usePlayer.getState()._setIsPlaying(false);
  });

  return audioEl;
}

function loadAndOptionallyPlay(track: Track, shouldPlay: boolean) {
  const audio = getAudio();
  audio.src = trackToUrl(track);
  audio.load();
  if (shouldPlay) {
    audio.play().catch((e) => {
      console.error("[audio] play() rejected:", e);
      usePlayer.getState()._setIsPlaying(false);
    });
  }
}

/** Subscribe the audio element to the player store. Call once at app boot. */
export function startAudioEngine() {
  if (unsubscribe) return;
  const audio = getAudio();

  let lastShouldSeek = -1;
  let lastVolume = audio.volume;

  unsubscribe = usePlayer.subscribe((state) => {
    const cur = state.queue[state.currentIndex];

    // Volume sync
    if (state.volume !== lastVolume) {
      audio.volume = state.volume;
      lastVolume = state.volume;
    }

    // Track change (load new src)
    if (cur && cur.id !== lastTrackId) {
      lastTrackId = cur.id;
      loadAndOptionallyPlay(cur, state.isPlaying);
      return;
    }
    if (!cur && lastTrackId !== null) {
      lastTrackId = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    // Play/pause sync (only if same track)
    if (cur) {
      if (state.isPlaying && audio.paused) {
        audio.play().catch((e) => {
          console.error("[audio] play() rejected:", e);
          usePlayer.getState()._setIsPlaying(false);
        });
      } else if (!state.isPlaying && !audio.paused) {
        audio.pause();
      }
    }

    // Manual seek (when state.progress was set externally far from currentTime)
    if (cur && Math.abs(state.progress - audio.currentTime) > 1.5 && state.progress !== lastShouldSeek) {
      lastShouldSeek = state.progress;
      if (Number.isFinite(state.progress)) {
        if (audio.readyState >= 1) {
          audio.currentTime = state.progress;
        } else {
          seekPending = state.progress;
        }
      }
    }
  });

  // Set initial volume
  audio.volume = usePlayer.getState().volume;
}

export function stopAudioEngine() {
  unsubscribe?.();
  unsubscribe = null;
  audioEl?.pause();
}
