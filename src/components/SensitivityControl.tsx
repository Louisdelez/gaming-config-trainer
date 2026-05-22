import { Move, RotateCcw } from "lucide-react";
import { useSettings, AIM_SENS_MIN, AIM_SENS_MAX, AIM_SENS_DEFAULT } from "../store/settings";

interface Props {
  /** Disable interactions (e.g., while pointer lock is active) */
  disabled?: boolean;
}

export default function SensitivityControl({ disabled }: Props) {
  const sens = useSettings((s) => s.aimSensitivity);
  const setSens = useSettings((s) => s.setAimSensitivity);

  return (
    <div className={`bg-[#181818] rounded-lg p-3 mb-3 flex items-center gap-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-2 shrink-0">
        <Move className="w-4 h-4 text-[#1ed760]" />
        <span className="text-[11px] uppercase font-bold text-[#b3b3b3]" style={{ letterSpacing: "1.4px" }}>
          Sensibilité
        </span>
      </div>
      <input
        type="range"
        min={AIM_SENS_MIN}
        max={AIM_SENS_MAX}
        step={0.05}
        value={sens}
        onChange={(e) => setSens(parseFloat(e.target.value))}
        className="flex-1 accent-[#1ed760] h-1.5"
      />
      <input
        type="number"
        min={AIM_SENS_MIN}
        max={AIM_SENS_MAX}
        step={0.05}
        value={sens.toFixed(2)}
        onChange={(e) => setSens(parseFloat(e.target.value))}
        className="w-20 px-2 py-1 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-mono font-bold text-center outline-none"
      />
      <button
        type="button"
        onClick={() => setSens(AIM_SENS_DEFAULT)}
        title="Réinitialiser (1.00)"
        className="p-1.5 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
