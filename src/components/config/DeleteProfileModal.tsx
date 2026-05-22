import { useEffect } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { useProfiles, type AnyProfile } from "../../store/profiles";

interface Props {
  profile: AnyProfile;
  onClose: () => void;
}

export default function DeleteProfileModal({ profile, onClose }: Props) {
  const deleteProfile = useProfiles((s) => s.deleteProfile);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (profile.isDefault) return;
    deleteProfile(profile.game, profile.id);
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
            <div className="w-9 h-9 rounded-full bg-[#f3727f] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-black" strokeWidth={2.6} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#f3727f]">Action irréversible</div>
              <div className="text-sm font-bold text-white">Supprimer ce profil</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/[0.06] text-white" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-white">
            Es-tu sûr de vouloir supprimer le profil
          </p>
          <div className="px-4 py-3 rounded-md bg-[#1f1f1f] text-center">
            <div className="text-lg font-extrabold text-white">"{profile.name}"</div>
            <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mt-1">
              Profil {profile.game === "valorant" ? "Valorant" : profile.game === "fortnite" ? "Fortnite" : "League of Legends"}
            </div>
          </div>
          <p className="text-xs text-[#b3b3b3]">
            Toutes les modifications effectuées dans ce profil seront perdues. Le profil par défaut redeviendra actif.
          </p>
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
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#f3727f] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform"
            style={{ letterSpacing: "1.4px" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
