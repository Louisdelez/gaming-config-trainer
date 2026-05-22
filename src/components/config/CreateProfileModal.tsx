import { useState, useEffect, useRef } from "react";
import { X, Check, Keyboard as KeyboardIcon } from "lucide-react";
import { useProfiles, useActiveProfile, type GameId } from "../../store/profiles";
import type { KeyboardLayout } from "../../store/settings";

interface Props {
  game: GameId;
  /** Optional explicit ID to base on; defaults to currently-active profile */
  basedOnId?: string;
  onClose: () => void;
}

const LAYOUTS: { id: KeyboardLayout; label: string; sample: string }[] = [
  { id: "qwerty", label: "QWERTY (US)",   sample: "Q W E R T" },
  { id: "qwertz", label: "QWERTZ (CH/DE)", sample: "Q W E R T Z" },
  { id: "azerty", label: "AZERTY (FR/BE)", sample: "A Z E R T Y" },
];

export default function CreateProfileModal({ game, basedOnId, onClose }: Props) {
  const active = useActiveProfile(game);
  const createProfile = useProfiles((s) => s.createProfile);

  const [name, setName] = useState(`${active.name} — copie`);
  const [layout, setLayout] = useState<KeyboardLayout>(active.keyboardLayout || "qwerty");
  const nameRef = useRef<HTMLInputElement>(null);

  // Autofocus + select all text on open for fast renaming
  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit = name.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    createProfile(game, {
      name: name.trim(),
      keyboardLayout: layout,
      basedOn: basedOnId ?? active.id,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#181818] rounded-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "rgba(0, 0, 0, 0.8) 0px 16px 48px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Nouveau profil</div>
            <div className="text-lg font-extrabold text-white">Basé sur "{active.name}"</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/[0.06] text-white" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="profile-name"
              className="block text-[10px] uppercase font-bold text-[#b3b3b3] mb-2"
              style={{ letterSpacing: "1.4px" }}
            >
              Nom du profil
            </label>
            <input
              id="profile-name"
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) submit(); }}
              placeholder="Ex: Mon Setup Principal"
              className="w-full px-4 py-3 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-bold outline-none transition-colors"
            />
          </div>

          {/* Keyboard layout */}
          <div>
            <label
              className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#b3b3b3] mb-2"
              style={{ letterSpacing: "1.4px" }}
            >
              <KeyboardIcon className="w-3.5 h-3.5" />
              Disposition du clavier
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LAYOUTS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayout(opt.id)}
                  className={`px-4 py-3 rounded-md text-left transition-all border ${
                    layout === opt.id
                      ? "bg-[#1ed760] border-[#1ed760] text-black"
                      : "bg-[#1f1f1f] border-[#3a3a3a] text-white hover:bg-[#252525]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{opt.label}</span>
                    {layout === opt.id && <Check className="w-4 h-4" />}
                  </div>
                  <div className={`text-xs font-mono mt-0.5 ${layout === opt.id ? "text-black/70" : "text-[#b3b3b3]"}`}>
                    {opt.sample}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
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
            Créer le profil
          </button>
        </div>
      </div>
    </div>
  );
}
