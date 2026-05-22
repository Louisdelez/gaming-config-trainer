import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  accent?: "green" | "white" | "dim" | "red";
}

const colorMap = {
  green: "text-[#1ed760]",
  white: "text-white",
  dim: "text-[#b3b3b3]",
  red: "text-[#f3727f]",
};

export default function StatCard({ icon: Icon, label, value, unit, accent = "green" }: Props) {
  return (
    <div className="spotify-card">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[1.4px] text-[#b3b3b3] font-bold mb-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className={`text-3xl font-bold font-mono ${colorMap[accent]}`}>
        {value}
        {unit && <span className="text-sm font-normal text-[#b3b3b3] ml-1">{unit}</span>}
      </div>
    </div>
  );
}
