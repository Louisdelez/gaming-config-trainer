import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: string;
}

export default function PageHeader({ icon: Icon, title, subtitle }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-full bg-[#1ed760] flex items-center justify-center shadow-spotify">
          <Icon className={`w-7 h-7 text-black`} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="spotify-title text-4xl tracking-tight">{title}</h1>
          {subtitle && <p className="text-[#b3b3b3] text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
