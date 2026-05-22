import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Pencil, Trash2, Lock } from "lucide-react";
import { useProfiles, useProfileList, useActiveProfile, type GameId, type AnyProfile } from "../../store/profiles";
import CreateProfileModal from "./CreateProfileModal";
import RenameProfileModal from "./RenameProfileModal";
import DeleteProfileModal from "./DeleteProfileModal";
import ExportImportMenu from "./ExportImportMenu";

interface Props {
  game: GameId;
  /** Opens the edit modal for the current custom profile */
  onEdit: () => void;
}

export default function ProfileBar({ game, onEdit }: Props) {
  const profiles = useProfileList(game);
  const active = useActiveProfile(game);
  const setActive = useProfiles((s) => s.setActiveProfile);

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        {/* Profile selector dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-sm font-bold transition-colors"
          >
            {active.isDefault && <Lock className="w-3.5 h-3.5 text-[#b3b3b3]" />}
            <span>{active.name}</span>
            <ChevronDown className={`w-4 h-4 text-[#b3b3b3] transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div
              className="absolute top-full left-0 mt-2 w-72 bg-[#282828] rounded-lg overflow-hidden z-50"
              style={{ boxShadow: "rgba(0, 0, 0, 0.5) 0px 8px 24px" }}
            >
              <div
                className="px-3 py-2 text-[10px] uppercase font-bold text-[#b3b3b3] border-b border-white/[0.06]"
                style={{ letterSpacing: "1.4px" }}
              >
                Profils
              </div>
              {profiles.map((p) => (
                <ProfileItem
                  key={p.id}
                  profile={p}
                  active={p.id === active.id}
                  onSelect={() => { setActive(game, p.id); setOpen(false); }}
                />
              ))}
              <button
                onClick={() => { setOpen(false); setCreating(true); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#1ed760] hover:bg-white/[0.04] transition-colors border-t border-white/[0.06]"
              >
                <Plus className="w-4 h-4" />
                <span className="font-bold">Nouveau profil</span>
                <span className="text-[10px] text-[#b3b3b3] ml-auto">basé sur l'actif</span>
              </button>
            </div>
          )}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {!active.isDefault && (
            <>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1ed760] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform"
                style={{ letterSpacing: "1.4px" }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>
              <button
                onClick={() => setRenaming(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-[11px] font-bold uppercase transition-colors"
                style={{ letterSpacing: "1.4px" }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Renommer
              </button>
              <button
                onClick={() => setDeleting(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#3a1f1f] text-[#f3727f] text-[11px] font-bold uppercase transition-colors"
                style={{ letterSpacing: "1.4px" }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            </>
          )}
          <ExportImportMenu game={game} />
        </div>
      </div>

      {creating && <CreateProfileModal game={game} onClose={() => setCreating(false)} />}
      {renaming && <RenameProfileModal profile={active} onClose={() => setRenaming(false)} />}
      {deleting && <DeleteProfileModal profile={active} onClose={() => setDeleting(false)} />}
    </>
  );
}

function ProfileItem({ profile, active, onSelect }: { profile: AnyProfile; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
        active ? "bg-white/[0.06] text-white" : "text-[#b3b3b3] hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {profile.isDefault ? (
        <Lock className="w-3.5 h-3.5 shrink-0 text-[#b3b3b3]" />
      ) : (
        <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
          <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#1ed760]" : "bg-transparent"}`} />
        </span>
      )}
      <span className="font-bold flex-1 truncate">{profile.name}</span>
      {profile.isDefault && (
        <span className="text-[9px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Lecture seule</span>
      )}
    </button>
  );
}
