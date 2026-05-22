import { useState, useRef, useEffect } from "react";
import { MousePointer2, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const DURATION = 10;

export default function CPS() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [finalCPS, setFinalCPS] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const addScore = useScores((s) => s.addScore);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const start = () => {
    setClicks(0);
    setTimeLeft(DURATION);
    setFinalCPS(null);
    setRunning(true);
    timer.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      setFinalCPS(clicks / DURATION);
    }
  }, [timeLeft, running, clicks]);

  const click = () => {
    if (running) setClicks((c) => c + 1);
  };

  const save = () => {
    if (finalCPS != null) {
      addScore({ game: "cps", score: finalCPS, unit: "cps" });
      setFinalCPS(null);
    }
  };

  return (
    <GameShell
      icon={MousePointer2}
      title={t("nav.cps")}
      description={t("games.cpsDesc")}
      gameKey="cps"
      unit="cps"
      currentScore={finalCPS ?? (clicks > 0 ? clicks / (DURATION - timeLeft || 1) : null)}
      accent="text-pink-400"
    >
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Time:</span> <span className="font-mono font-bold text-[#ffa42b]">{timeLeft}s</span></span>
          <span><span className="text-slate-400">Clicks:</span> <span className="font-mono font-bold text-[#1ed760]">{clicks}</span></span>
          <span><span className="text-slate-400">CPS:</span> <span className="font-mono font-bold text-[#1ed760]">{running ? (clicks / Math.max(1, DURATION - timeLeft)).toFixed(1) : (finalCPS?.toFixed(2) ?? "0")}</span></span>
        </div>
        {!running && finalCPS == null && (
          <button onClick={start} className="btn-spotify btn-spotify-sm">
            <Play className="w-3.5 h-3.5" /> {t("games.start")}
          </button>
        )}
        {finalCPS != null && (
          <div className="flex gap-2">
            <button onClick={save} className="btn-spotify btn-spotify-sm">
              <Save className="w-3.5 h-3.5" /> {t("games.saveScore")}
            </button>
            <button onClick={start} className="btn-pill">{t("games.restart")}</button>
          </div>
        )}
      </div>
      <button
        onClick={click}
        disabled={!running}
        className="game-canvas w-full h-[480px] bg-[#121212] flex flex-col items-center justify-center text-white disabled:cursor-default"
      >
        <div className="text-7xl font-bold">{running ? clicks : (finalCPS != null ? finalCPS.toFixed(2) : "GO")}</div>
        <div className="text-slate-400 text-sm mt-3">
          {running ? "CLICK CLICK CLICK!" : finalCPS != null ? "CPS" : "Start to begin"}
        </div>
      </button>
    </GameShell>
  );
}
