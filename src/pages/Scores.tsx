import { BarChart3, Trash2, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useScores } from "../store/scores";
import PageHeader from "../components/PageHeader";

const gameOrder = [
  "reaction", "gridshot", "tracking", "flickshot", "cps",
  "microshots", "strafe", "stroop", "sequence", "visualmatch",
  "polling", "clicklatency", "monitorhz", "network",
];

export default function Scores() {
  const { t } = useTranslation();
  const scores = useScores((s) => s.scores);
  const getBest = useScores((s) => s.getBest);
  const getAverage = useScores((s) => s.getAverage);
  const clearGame = useScores((s) => s.clearGame);
  const clearAll = useScores((s) => s.clearAll);

  const gamesWithData = gameOrder.filter((g) => scores.some((s) => s.game === g));

  return (
    <>
      <PageHeader icon={BarChart3} title={t("nav.scores")} />

      {gamesWithData.length === 0 && (
        <div className="text-center py-20 text-[#b3b3b3]">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-bold text-white mb-1">No scores yet</p>
          <p className="text-sm">Play some games and your results will appear here.</p>
        </div>
      )}

      <div className="space-y-4">
        {gamesWithData.map((game) => {
          const best = getBest(game);
          const avg = getAverage(game);
          const all = scores.filter((s) => s.game === game).sort((a, b) => b.timestamp - a.timestamp);
          return (
            <div key={game} className="spotify-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white">{t(`nav.${game}`)}</h3>
                <button
                  onClick={() => clearGame(game)}
                  className="text-[11px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] hover:text-[#f3727f] flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Stat label={t("games.best")} value={best?.score.toFixed(0) ?? "-"} unit={best?.unit} accent="green" />
                <Stat label={t("games.average")} value={avg?.toFixed(1) ?? "-"} unit={best?.unit} accent="white" />
                <Stat label={t("games.attempts")} value={String(all.length)} accent="dim" />
              </div>
              <div className="space-y-0.5 max-h-32 overflow-y-auto -mx-2">
                {all.slice(0, 10).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-[#b3b3b3] px-3 py-1.5 rounded hover:bg-white/[0.04]">
                    <span>{new Date(s.timestamp).toLocaleString()}</span>
                    <span className="font-mono text-white font-bold">{s.score.toFixed(0)} {s.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {gamesWithData.length > 0 && (
        <button onClick={clearAll} className="mt-6 text-[11px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] hover:text-[#f3727f] flex items-center gap-1.5 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Clear all scores
        </button>
      )}
    </>
  );
}

function Stat({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent: "green" | "white" | "dim" }) {
  const colors = { green: "text-[#1ed760]", white: "text-white", dim: "text-[#b3b3b3]" };
  return (
    <div className="bg-[#1f1f1f] rounded p-3">
      <div className="text-[10px] uppercase tracking-[1.4px] text-[#b3b3b3] font-bold">{label}</div>
      <div className={`font-mono font-bold ${colors[accent]}`}>
        {value} <span className="text-xs text-[#b3b3b3] font-normal">{unit}</span>
      </div>
    </div>
  );
}
