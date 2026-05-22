import { useState, useRef, useEffect } from "react";
import { MousePointerClick, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const TRIALS = 10;

type Phase = "idle" | "wait" | "go" | "early" | "done";

export default function ClickLatency() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const goTime = useRef(0);
  const timeout = useRef<number | null>(null);
  const addScore = useScores((s) => s.addScore);

  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);

  const startTrial = () => {
    setPhase("wait");
    const delay = 1000 + Math.random() * 2500;
    timeout.current = window.setTimeout(() => {
      goTime.current = performance.now();
      setPhase("go");
    }, delay);
  };

  const startAll = () => { setTimes([]); startTrial(); };

  const handleClick = () => {
    if (phase === "wait") { if (timeout.current) clearTimeout(timeout.current); setPhase("early"); return; }
    if (phase === "go") {
      const t = performance.now() - goTime.current;
      const newTimes = [...times, t];
      setTimes(newTimes);
      if (newTimes.length >= TRIALS) setPhase("done");
      else setTimeout(startTrial, 500);
    } else if (phase === "idle" || phase === "early") {
      startTrial();
    }
  };

  const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const best = times.length > 0 ? Math.min(...times) : null;

  const save = () => {
    if (avg != null) {
      addScore({ game: "clicklatency", score: avg, unit: "ms" });
      setTimes([]); setPhase("idle");
    }
  };

  const bg = phase === "wait" ? "bg-red-700" : phase === "go" ? "bg-emerald-500" : phase === "early" ? "bg-amber-600" : "bg-slate-800";

  return (
    <GameShell icon={MousePointerClick} title={t("nav.clicklatency")} description={t("games.clickLatencyDesc")} gameKey="clicklatency" unit="ms" currentScore={avg} accent="text-rose-400">
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Trial:</span> <span className="font-mono font-bold text-[#ffa42b]">{times.length}/{TRIALS}</span></span>
          <span><span className="text-slate-400">Avg:</span> <span className="font-mono font-bold text-[#f3727f]">{avg != null ? avg.toFixed(0) : "-"} ms</span></span>
          <span><span className="text-slate-400">Best:</span> <span className="font-mono font-bold text-[#1ed760]">{best != null ? best.toFixed(0) : "-"} ms</span></span>
        </div>
        {phase === "idle" && <button onClick={startAll} className="btn-spotify btn-spotify-sm"><Play className="w-3.5 h-3.5" /> {t("games.start")}</button>}
        {phase === "done" && <div className="flex gap-2"><button onClick={save} className="btn-spotify btn-spotify-sm"><Save className="w-3.5 h-3.5" /> {t("games.saveScore")}</button><button onClick={() => { setTimes([]); startTrial(); }} className="btn-pill">{t("games.restart")}</button></div>}
      </div>
      <div onClick={handleClick} className={`game-canvas h-[480px] flex flex-col items-center justify-center text-white transition-colors ${bg}`}>
        <div className="text-4xl font-bold">
          {phase === "idle" && "Click Start"}
          {phase === "wait" && "Wait for green..."}
          {phase === "go" && "CLICK!"}
          {phase === "early" && t("games.tooEarly")}
          {phase === "done" && `Avg ${avg?.toFixed(0)} ms`}
        </div>
      </div>
    </GameShell>
  );
}
