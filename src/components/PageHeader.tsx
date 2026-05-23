import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: string;
  /** If provided, shows a (?) button that navigates to /info/<slug> */
  infoSlug?: string;
}

export default function PageHeader({ icon: Icon, title, subtitle, infoSlug }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-full bg-[#1ed760] flex items-center justify-center shadow-spotify shrink-0">
          <Icon className={`w-7 h-7 text-black`} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="spotify-title text-4xl tracking-tight">{title}</h1>
            {infoSlug && (
              <Link
                to={`/info/${infoSlug}`}
                title={`En savoir plus sur ${title}`}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1f1f1f] hover:bg-[#1ed760] text-[#b3b3b3] hover:text-black transition-colors"
              >
                <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            )}
          </div>
          {subtitle && <p className="text-[#b3b3b3] text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
