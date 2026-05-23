import { X, Music as MusicIcon, Play, Pause } from "lucide-react";
import { usePlayer } from "../store/player";

export default function NowPlayingSidebar() {
  const open = usePlayer((s) => s.panelOpen);
  const togglePanel = usePlayer((s) => s.togglePanel);
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const togglePlay = usePlayer((s) => s.togglePlay);

  if (!open) return null;
  const current = currentIndex >= 0 ? queue[currentIndex] : null;
  const upcoming = currentIndex >= 0 ? queue.slice(currentIndex + 1) : [];

  return (
    <aside className="w-[320px] shrink-0 bg-black m-2 ml-0 rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">En cours de lecture</span>
        <button onClick={togglePanel} className="p-1 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current track — big card */}
      <div className="p-4">
        {current ? (
          <>
            <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-[#1ed760] to-[#0d6938] flex items-center justify-center mb-4">
              <MusicIcon className="w-24 h-24 text-black/40" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-lg font-extrabold text-white truncate">{current.title}</div>
                <div className="text-sm text-[#b3b3b3] truncate">{current.artist || "Artiste inconnu"}</div>
              </div>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>
          </>
        ) : (
          <div className="aspect-square w-full rounded-lg bg-[#1f1f1f] flex flex-col items-center justify-center text-[#b3b3b3]">
            <MusicIcon className="w-16 h-16 mb-3 opacity-50" />
            <span className="text-xs">Aucune lecture</span>
          </div>
        )}
      </div>

      {/* Upcoming queue */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-2">
          File d'attente ({upcoming.length})
        </div>
        {upcoming.length === 0 ? (
          <div className="text-xs text-[#7c7c7c] italic">Rien d'autre en file…</div>
        ) : (
          <div className="space-y-1">
            {upcoming.slice(0, 20).map((t, i) => (
              <div key={`${t.id}-${i}`} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04]">
                <span className="text-[10px] text-[#7c7c7c] w-5 text-right">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white truncate font-bold">{t.title}</div>
                  <div className="text-[10px] text-[#b3b3b3] truncate">{t.artist || "—"}</div>
                </div>
              </div>
            ))}
            {upcoming.length > 20 && (
              <div className="text-[10px] text-[#7c7c7c] italic px-2">+ {upcoming.length - 20} de plus…</div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
