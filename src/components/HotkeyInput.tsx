import { useEffect, useRef, useState } from "react";
import { X, Keyboard } from "lucide-react";
import { eventToAccelerator, prettyAccelerator } from "../lib/hotkeys";

interface Props {
  value: string;
  /** Default to restore on click of the reset icon */
  defaultValue: string;
  onChange: (v: string) => void;
  /** Forbid these accelerators (the other hotkeys, to avoid conflicts) */
  conflictsWith?: string[];
}

export default function HotkeyInput({ value, defaultValue, onChange, conflictsWith = [] }: Props) {
  const [recording, setRecording] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!recording) return;
    btnRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      // Cancel
      if (e.key === "Escape") {
        e.preventDefault();
        setRecording(false);
        setHint(null);
        return;
      }
      const accel = eventToAccelerator(e);
      if (!accel) {
        // Lone modifier — keep listening, just show in-progress hint
        const modifiers: string[] = [];
        if (e.ctrlKey)  modifiers.push("Ctrl");
        if (e.altKey)   modifiers.push("Alt");
        if (e.shiftKey) modifiers.push("Shift");
        if (e.metaKey)  modifiers.push("Win");
        setHint(modifiers.length > 0 ? modifiers.join("+") + "+…" : "…");
        e.preventDefault();
        return;
      }
      e.preventDefault();
      // Conflict check
      if (conflictsWith.includes(accel)) {
        setHint(`Déjà utilisé par un autre raccourci`);
        setTimeout(() => setHint(null), 1500);
        return;
      }
      onChange(accel);
      setRecording(false);
      setHint(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [recording, conflictsWith, onChange]);

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(defaultValue);
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => setRecording((r) => !r)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all min-w-[160px] ${
        recording
          ? "bg-[#1ed760] text-black ring-2 ring-[#1ed760]"
          : "bg-[#1f1f1f] hover:bg-[#252525] text-white border border-[#3a3a3a]"
      }`}
    >
      <Keyboard className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">
        {recording ? (hint ?? "Appuie sur une touche…") : prettyAccelerator(value)}
      </span>
      {!recording && value !== defaultValue && (
        <span
          onClick={reset}
          title="Réinitialiser au défaut"
          className="p-1 -mr-1 rounded hover:bg-white/[0.1] text-[#b3b3b3] hover:text-white"
        >
          <X className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}
