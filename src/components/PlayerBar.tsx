import { useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, ListMusic, Music as MusicIcon,
} from "lucide-react";
import { usePlayer } from "../store/player";

export default function PlayerBar() {
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const volume = usePlayer((s) => s.volume);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const seek = usePlayer((s) => s.seek);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const togglePanel = usePlayer((s) => s.togglePanel);

  const current = currentIndex >= 0 ? queue[currentIndex] : null;
  const [seekHover, setSeekHover] = useState<number | null>(null);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="h-[88px] shrink-0 bg-black border-t border-white/[0.06] pl-4 pr-6 flex items-center gap-4 select-none">
      {/* LEFT — Current track info */}
      <div className="flex items-center gap-3 w-[28%] min-w-[180px]">
        <div className="w-14 h-14 rounded bg-[#282828] flex items-center justify-center shrink-0">
          <MusicIcon className="w-6 h-6 text-[#b3b3b3]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">
            {current ? current.title : "Aucune lecture"}
          </div>
          <div className="text-xs text-[#b3b3b3] truncate">
            {current ? (current.artist || "Artiste inconnu") : "Sélectionne une piste"}
          </div>
        </div>
      </div>

      {/* CENTER — Controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[722px]">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            title="Aléatoire"
            className={`p-1.5 rounded transition-colors ${shuffle ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={prev}
            disabled={!current}
            className="p-1.5 rounded text-[#b3b3b3] hover:text-white disabled:opacity-30 disabled:hover:text-[#b3b3b3] transition-colors"
            title="Précédent"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!current}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-transform"
            title={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={next}
            disabled={!current}
            className="p-1.5 rounded text-[#b3b3b3] hover:text-white disabled:opacity-30 disabled:hover:text-[#b3b3b3] transition-colors"
            title="Suivant"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={cycleRepeat}
            title={`Répéter : ${repeat}`}
            className={`p-1.5 rounded transition-colors ${repeat !== "off" ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
          >
            {repeat === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-2 text-[10px] font-mono text-[#b3b3b3]">
          <span className="w-9 text-right">{formatTime(progress)}</span>
          <div
            className="flex-1 group h-3 flex items-center cursor-pointer"
            onMouseLeave={() => setSeekHover(null)}
            onClick={(e) => {
              if (!current || duration === 0) return;
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(Math.max(0, Math.min(duration, ratio * duration)));
            }}
            onMouseMove={(e) => {
              if (!current || duration === 0) return;
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setSeekHover(ratio * duration);
            }}
          >
            <div className="w-full h-1 rounded-full bg-[#4d4d4d] relative overflow-hidden group-hover:bg-[#5a5a5a]">
              <div
                className="absolute top-0 left-0 h-full bg-white group-hover:bg-[#1ed760] transition-colors"
                style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : "0%" }}
              />
            </div>
          </div>
          <span className="w-9">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT — Volume + queue toggle */}
      <div className="flex items-center gap-3 w-[28%] min-w-[180px] justify-end pr-2">
        <button
          onClick={togglePanel}
          title="Affichage en cours de lecture"
          className="p-1.5 rounded text-[#b3b3b3] hover:text-white transition-colors"
        >
          <ListMusic className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 w-[140px]">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
            className="p-1.5 rounded text-[#b3b3b3] hover:text-white transition-colors"
          >
            <VolumeIcon className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 accent-[#1ed760] h-1 cursor-pointer"
          />
        </div>
        {seekHover != null && current && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#b3b3b3] bg-black/80 px-2 py-1 rounded pointer-events-none">
            {formatTime(seekHover)}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}
