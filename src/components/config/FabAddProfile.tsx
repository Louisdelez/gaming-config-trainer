import { useState } from "react";
import { Plus } from "lucide-react";
import type { GameId } from "../../store/profiles";
import CreateProfileModal from "./CreateProfileModal";

interface Props {
  game: GameId;
}

export default function FabAddProfile({ game }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Créer un nouveau profil"
        title="Créer un nouveau profil (à partir de l'actif)"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#1ed760] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        style={{ boxShadow: "rgba(0, 0, 0, 0.6) 0px 8px 24px" }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.6} />
      </button>
      {open && <CreateProfileModal game={game} onClose={() => setOpen(false)} />}
    </>
  );
}
