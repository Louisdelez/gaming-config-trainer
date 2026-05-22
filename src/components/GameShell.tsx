import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Activity, BarChart3, Info } from "lucide-react";
import { useScores } from "../store/scores";
import PageHeader from "./PageHeader";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  gameKey: string;
  unit: string;
  currentScore?: number | null;
  children: ReactNode;
  accent?: string;
}

export default function GameShell({
  icon, title, description, gameKey, unit, currentScore, children,
}: Props) {
  const { t } = useTranslation();
  const best = useScores((s) => s.getBest(gameKey));
  const avg = useScores((s) => s.getAverage(gameKey));
  const attempts = useScores((s) => s.scores.filter((x) => x.game === gameKey).length);

  return (
    <>
      <PageHeader icon={icon} title={title} subtitle={description} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat icon={Activity} label={t("games.score")} value={currentScore != null ? currentScore.toFixed(0) : "-"} unit={unit} accent="text-white" />
        <MiniStat icon={Trophy} label={t("games.best")} value={best ? best.score.toFixed(0) : "-"} unit={unit} accent="text-[#1ed760]" />
        <MiniStat icon={BarChart3} label={t("games.average")} value={avg != null ? avg.toFixed(1) : "-"} unit={unit} accent="text-white" />
        <MiniStat icon={Info} label={t("games.attempts")} value={String(attempts)} accent="text-[#b3b3b3]" />
      </div>

      <div className="bg-[#181818] rounded-lg overflow-hidden">
        {children}
      </div>
    </>
  );
}

function MiniStat({ icon: Icon, label, value, unit, accent }: { icon: any; label: string; value: string; unit?: string; accent: string }) {
  return (
    <div className="bg-[#181818] rounded-lg p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.4px] text-[#b3b3b3] font-bold mb-1.5">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={`font-mono font-bold text-2xl ${accent}`}>
        {value}
        {unit && <span className="text-xs text-[#b3b3b3] ml-1 font-normal">{unit}</span>}
      </div>
    </div>
  );
}
