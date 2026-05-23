import { useState } from "react";
import {
  Music as MusicIcon, Play, Pause, Plus, Trash2, Search, Clock,
} from "lucide-react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import PageHeader from "../components/PageHeader";
import { usePlayer, type Track } from "../store/player";

export default function Music() {
  const tracks = usePlayer((s) => s.tracks);
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const playTrack = usePlayer((s) => s.playTrack);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const addTrackFromPath = usePlayer((s) => s.addTrackFromPath);
  const removeTrack = usePlayer((s) => s.removeTrack);

  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  const currentTrackId = currentIndex >= 0 ? queue[currentIndex]?.id : null;

  const filtered = tracks.filter((t) =>
    !search.trim() ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.artist ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    setAdding(true);
    try {
      const picked = await openDialog({
        multiple: true,
        filters: [
          { name: "Audio", extensions: ["mp3", "m4a", "aac", "wav", "ogg", "flac", "opus"] },
        ],
      });
      if (!picked) return;
      const paths = Array.isArray(picked) ? picked : [picked];
      for (const p of paths) {
        await addTrackFromPath(p);
      }
    } catch (e) {
      console.error("[music] add failed:", e);
    } finally {
      setAdding(false);
    }
  };

  const handlePlay = (t: Track) => {
    if (t.id === currentTrackId) {
      togglePlay();
    } else {
      playTrack(t, tracks);
    }
  };

  return (
    <>
      <PageHeader
        icon={MusicIcon}
        title="Musique"
        subtitle="Ta bibliothèque audio • lecteur intégré en bas"
      />

      {/* Toolbar */}
      <div className="bg-[#181818] rounded-xl p-4 mb-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={handleAdd}
          disabled={adding}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:scale-105 disabled:opacity-40 text-black text-[11px] font-bold uppercase transition-transform"
          style={{ letterSpacing: "1.4px" }}
        >
          <Plus className="w-4 h-4" />
          Ajouter des pistes
        </button>

        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b3b3b3] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans la bibliothèque…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm outline-none"
          />
        </div>

        <span className="text-xs text-[#b3b3b3]">{filtered.length} / {tracks.length} pistes</span>
      </div>

      {/* Track list */}
      <div className="bg-[#181818] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <MusicIcon className="w-12 h-12 mx-auto mb-3 text-[#b3b3b3] opacity-30" />
            <div className="text-[#b3b3b3] text-sm mb-3">
              {tracks.length === 0 ? "Ta bibliothèque est vide." : "Aucun résultat."}
            </div>
            {tracks.length === 0 && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1ed760] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform"
                style={{ letterSpacing: "1.4px" }}
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter des pistes
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[40px_1fr_1fr_80px_40px] gap-3 px-4 py-2 text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] border-b border-white/[0.06]">
              <span className="text-right">#</span>
              <span>Titre</span>
              <span>Artiste</span>
              <span className="flex items-center justify-end gap-1"><Clock className="w-3 h-3" /></span>
              <span></span>
            </div>
            <div className="divide-y divide-white/[0.02] max-h-[600px] overflow-y-auto">
              {filtered.map((t, i) => {
                const isCurrent = t.id === currentTrackId;
                return (
                  <div
                    key={t.id}
                    onDoubleClick={() => handlePlay(t)}
                    className={`grid grid-cols-[40px_1fr_1fr_80px_40px] gap-3 px-4 py-2.5 items-center group hover:bg-white/[0.04] cursor-pointer ${isCurrent ? "bg-white/[0.04]" : ""}`}
                  >
                    {/* Index / play button on hover */}
                    <div className="text-right text-xs text-[#b3b3b3]">
                      <span className="group-hover:hidden">{isCurrent && isPlaying ? "♪" : i + 1}</span>
                      <button
                        onClick={() => handlePlay(t)}
                        className="hidden group-hover:inline-flex text-white hover:text-[#1ed760]"
                        title="Lire"
                      >
                        {isCurrent && isPlaying
                          ? <Pause className="w-3.5 h-3.5 fill-current" />
                          : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                    </div>
                    {/* Title */}
                    <div className="min-w-0">
                      <div className={`text-sm font-bold truncate ${isCurrent ? "text-[#1ed760]" : "text-white"}`}>{t.title}</div>
                      <div className="text-[10px] text-[#7c7c7c] truncate font-mono">{filenameFromPath(t.path)}</div>
                    </div>
                    {/* Artist */}
                    <div className="text-xs text-[#b3b3b3] truncate">{t.artist || "—"}</div>
                    {/* Duration */}
                    <div className="text-right text-xs text-[#b3b3b3] font-mono">{formatDuration(t.duration)}</div>
                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeTrack(t.id); }}
                        className="p-1.5 rounded hover:bg-[#3a1f1f] text-[#b3b3b3] hover:text-[#f3727f] transition-colors"
                        title="Retirer de la bibliothèque"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <p className="text-[10px] text-[#7c7c7c] mt-3 text-center">
        Double-clic sur une piste pour la lire • le lecteur reste visible en bas pendant toute la navigation
      </p>
    </>
  );
}

function filenameFromPath(p: string): string {
  return p.replace(/\\/g, "/").split("/").pop() ?? p;
}

function formatDuration(s: number | null | undefined): string {
  if (!s || !Number.isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}
