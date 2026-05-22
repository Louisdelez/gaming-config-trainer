import { useState, useRef, useEffect } from "react";
import { Timer, Save, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

type Phase = "idle" | "waiting" | "go" | "result" | "early";

export default function ReactionTime() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const startTime = useRef<number>(0);
  const timeout = useRef<number | null>(null);
  const addScore = useScores((s) => s.addScore);

  useEffect(() => () => { if (timeout.current) window.clearTimeout(timeout.current); }, []);

  const startWait = () => {
    setPhase("waiting");
    setReactionMs(null);
    const delay = 1500 + Math.random() * 3000;
    timeout.current = window.setTimeout(() => {
      startTime.current = performance.now();
      setPhase("go");
    }, delay);
  };

  const handleClick = () => {
    if (phase === "idle" || phase === "result" || phase === "early") {
      startWait();
    } else if (phase === "waiting") {
      if (timeout.current) window.clearTimeout(timeout.current);
      setPhase("early");
    } else if (phase === "go") {
      const ms = performance.now() - startTime.current;
      setReactionMs(ms);
      setPhase("result");
    }
  };

  const save = () => {
    if (reactionMs != null) {
      addScore({ game: "reaction", score: reactionMs, unit: "ms" });
      setPhase("idle");
      setReactionMs(null);
    }
  };

  const bg =
    phase === "waiting" ? "bg-red-600" :
    phase === "go" ? "bg-emerald-500" :
    phase === "early" ? "bg-amber-600" :
    "bg-slate-800";

  const title =
    phase === "idle" ? t("games.clickToStart") :
    phase === "waiting" ? "..." :
    phase === "go" ? "CLICK!" :
    phase === "early" ? t("games.tooEarly") :
    `${reactionMs?.toFixed(0)} ${t("games.ms")}`;

  return (
    <GameShell
      icon={Timer}
      title={t("nav.reaction")}
      description={t("games.reactionDesc")}
      gameKey="reaction"
      unit="ms"
      currentScore={reactionMs}
      accent="text-indigo-400"
    >
      <div
        onClick={handleClick}
        className={`game-canvas h-[420px] flex flex-col items-center justify-center transition-colors duration-100 ${bg} relative overflow-hidden`}
      >
        <div className="text-5xl font-bold text-white text-center px-4">{title}</div>
        {phase === "result" && (
          <div className="mt-6 text-white/80 text-sm">
            {reactionMs && reactionMs < 200 && "ðŸ† Pro level"}
            {reactionMs && reactionMs >= 200 && reactionMs < 250 && "âš¡ Excellent"}
            {reactionMs && reactionMs >= 250 && reactionMs < 300 && "ðŸ‘ Good"}
            {reactionMs && reactionMs >= 300 && "ðŸ’ª Keep training"}
          </div>
        )}
        {phase === "result" && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); save(); }} className="btn-spotify btn-spotify-sm">
              <Save className="w-3.5 h-3.5" /> {t("games.saveScore")}
            </button>
            <button onClick={(e) => { e.stopPropagation(); startWait(); }} className="btn-outlined btn-spotify-sm">
              <RotateCcw className="w-3.5 h-3.5" /> {t("games.restart")}
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
