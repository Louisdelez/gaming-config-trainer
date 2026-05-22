import { useState, useEffect, useRef } from "react";
import { X, Check, Pencil } from "lucide-react";
import { useProfiles, type AnyProfile } from "../../store/profiles";

interface Props {
  profile: AnyProfile;
  onClose: () => void;
}

export default function RenameProfileModal({ profile, onClose }: Props) {
  const renameProfile = useProfiles((s) => s.renameProfile);
  const [name, setName] = useState(profile.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== profile.name && !profile.isDefault;

  const submit = () => {
    if (!canSubmit) return;
    renameProfile(profile.game, profile.id, trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#181818] rounded-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "rgba(0, 0, 0, 0.8) 0px 16px 48px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1ed760] flex items-center justify-center">
              <Pencil className="w-4 h-4 text-black" strokeWidth={2.6} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Renommer le profil</div>
              <div className="text-sm font-bold text-white truncate max-w-[260px]">"{profile.name}"</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/[0.06] text-white" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label
            htmlFor="rename-input"
            className="block text-[10px] uppercase font-bold text-[#b3b3b3] mb-2"
            style={{ letterSpacing: "1.4px" }}
          >
            Nouveau nom
          </label>
          <input
            id="rename-input"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) submit(); }}
            placeholder="Ex: Setup AZERTY"
            className="w-full px-4 py-3 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-bold outline-none transition-colors"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-transparent hover:bg-white/[0.06] text-white text-[11px] font-bold uppercase transition-colors"
            style={{ letterSpacing: "1.4px" }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1ed760] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed text-black text-[11px] font-bold uppercase transition-transform"
            style={{ letterSpacing: "1.4px" }}
          >
            <Check className="w-3.5 h-3.5" />
            Renommer
          </button>
        </div>
      </div>
    </div>
  );
}
