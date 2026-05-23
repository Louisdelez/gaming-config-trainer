import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Library as LibraryIcon, Camera, Video, Rewind, Trash2, Search,
  HardDrive, FileVideo, FileImage, Eye, FolderOpen, Filter,
} from "lucide-react";
import { openPath } from "@tauri-apps/plugin-opener";
import PageHeader from "../components/PageHeader";
import { dbListCaptures, dbDeleteCapture, type DbCaptureRow } from "../lib/db";

type Filter = "all" | "screenshot" | "recording" | "replay";
type Sort = "date" | "size" | "name";

export default function Library() {
  const [captures, setCaptures] = useState<DbCaptureRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("date");
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    try { setCaptures(await dbListCaptures(500)); }
    catch (e) { console.error(e); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id: number) => {
    await dbDeleteCapture(id);
    refresh();
  };

  /* ---------- Filter + sort + search ---------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = captures.filter((c) => {
      if (filter !== "all" && c.kind !== filter) return false;
      if (q && !c.path.toLowerCase().includes(q)) return false;
      return true;
    });
    arr.sort((a, b) => {
      if (sort === "date") return b.created_at - a.created_at;
      if (sort === "size") return (b.size_bytes ?? 0) - (a.size_bytes ?? 0);
      // name
      return filename(a.path).localeCompare(filename(b.path));
    });
    return arr;
  }, [captures, filter, sort, search]);

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    let totalSize = 0, screenshots = 0, recordings = 0, replays = 0;
    for (const c of captures) {
      totalSize += c.size_bytes ?? 0;
      if (c.kind === "screenshot") screenshots++;
      else if (c.kind === "recording") recordings++;
      else if (c.kind === "replay") replays++;
    }
    return { totalSize, screenshots, recordings, replays };
  }, [captures]);

  return (
    <>
      <PageHeader
        icon={LibraryIcon}
        title="Bibliothèque"
        subtitle="Toutes tes captures (screenshots, recordings, clips replay)"
      />

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={FileImage} label="Screenshots" value={String(stats.screenshots)} color="#1ed760" />
        <StatCard icon={FileVideo} label="Recordings"  value={String(stats.recordings)}  color="#1ed760" />
        <StatCard icon={Rewind}    label="Replays"     value={String(stats.replays)}     color="#ffa42b" />
        <StatCard icon={HardDrive} label="Espace total" value={formatBytes(stats.totalSize)} color="#b3b3b3" />
      </div>

      {/* TOOLBAR */}
      <div className="bg-[#181818] rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        {/* Filter */}
        <div className="flex items-center gap-1 bg-[#0f0f0f] rounded-lg p-1">
          {(["all", "screenshot", "recording", "replay"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold transition-colors ${
                filter === f ? "bg-[#1ed760] text-black" : "text-[#b3b3b3] hover:text-white"
              }`}
              style={{ letterSpacing: "1.4px" }}
            >
              {f === "all" ? "Tous" : f === "screenshot" ? "Photos" : f === "recording" ? "Vidéos" : "Replays"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b3b3b3] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom de fichier ou chemin…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm outline-none"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#b3b3b3]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm outline-none"
          >
            <option value="date">Plus récent</option>
            <option value="size">Plus volumineux</option>
            <option value="name">Nom A→Z</option>
          </select>
        </div>

        <button onClick={refresh} className="text-[#b3b3b3] hover:text-white text-xs px-3 py-2">⟳ Refresh</button>
      </div>

      {/* GRID / LIST */}
      <div className="bg-[#181818] rounded-xl overflow-hidden mb-6">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <LibraryIcon className="w-12 h-12 mx-auto mb-3 text-[#b3b3b3] opacity-30" />
            <div className="text-[#b3b3b3] text-sm">
              {captures.length === 0
                ? "Aucune capture pour le moment. Va sur Capture pour en créer une."
                : "Aucun résultat pour ces filtres."}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto">
            {filtered.map((c) => (
              <CaptureRow key={c.id} capture={c} onDelete={() => handleDelete(c.id)} />
            ))}
          </div>
        )}
      </div>

      <div className="text-[10px] text-[#7c7c7c] text-center mt-2">
        {filtered.length} affichées · {captures.length} au total
      </div>
    </>
  );
}

/* ============================================================
   Subcomponents
   ============================================================ */

function StatCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string; color: string;
}) {
  return (
    <div className="bg-[#181818] rounded-lg p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        {label}
      </div>
      <div className="font-mono font-bold text-2xl text-white">{value}</div>
    </div>
  );
}

function CaptureRow({ capture, onDelete }: { capture: DbCaptureRow; onDelete: () => void }) {
  const Icon = capture.kind === "screenshot" ? Camera
            : capture.kind === "recording" ? Video
            : Rewind;
  const iconColor = capture.kind === "replay" ? "#ffa42b" : "#1ed760";

  const openFile = () => openPath(capture.path).catch(console.error);
  const openFolder = () => {
    const dir = capture.path.replace(/[\\/][^\\/]+$/, "");
    openPath(dir).catch(console.error);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-md bg-[#0f0f0f] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{filename(capture.path)}</div>
        <div className="text-[11px] text-[#b3b3b3] font-mono truncate">
          {capture.path}
        </div>
        <div className="text-[10px] text-[#7c7c7c] flex items-center gap-2 mt-0.5">
          <span>{new Date(capture.created_at).toLocaleString()}</span>
          {capture.size_bytes != null && <span>· {formatBytes(capture.size_bytes)}</span>}
          {capture.duration_sec != null && capture.duration_sec > 0 && <span>· {capture.duration_sec}s</span>}
          {capture.encoder && <span>· {capture.encoder}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <button
          onClick={openFile}
          className="p-2 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white transition-colors"
          title="Ouvrir le fichier"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={openFolder}
          className="p-2 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white transition-colors"
          title="Ouvrir le dossier"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded hover:bg-[#3a1f1f] text-[#b3b3b3] hover:text-[#f3727f] transition-colors"
          title="Retirer de l'historique (le fichier reste sur le disque)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function filename(p: string): string {
  return p.replace(/\\/g, "/").split("/").pop() ?? p;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
