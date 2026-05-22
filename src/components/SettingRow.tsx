interface Props {
  label: string;
  value: string;
  note?: string;
  highlight?: "green" | "red" | "amber";
}

const colors = {
  green: "text-[#1ed760]",
  red: "text-[#f3727f]",
  amber: "text-[#ffa42b]",
};

export default function SettingRow({ label, value, note, highlight }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.06] last:border-0">
      <div className="flex-1">
        <div className="text-sm text-white">{label}</div>
        {note && <div className="text-xs text-[#b3b3b3] mt-0.5">{note}</div>}
      </div>
      <div className={`font-mono font-bold text-sm ${highlight ? colors[highlight] : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SectionProps) {
  return (
    <div className="bg-[#181818] rounded-lg p-5 mb-4">
      <h3 className="text-[11px] uppercase tracking-[1.4px] text-[#b3b3b3] font-bold mb-3">{title}</h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}
