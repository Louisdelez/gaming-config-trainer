import { useState, useRef, useEffect } from "react";
import { Grid3X3, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const DURATION = 30; // seconds
const TARGET_SIZE = 60;
const TARGET_COUNT = 5;

interface Target { x: number; y: number; id: number; }

export default function Gridshot() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const addScore = useScores((s) => s.addScore);

  const randomTarget = (): Target => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const w = rect ? rect.width - TARGET_SIZE : 800;
    const h = rect ? rect.height - TARGET_SIZE : 400;
    return { id: nextId.current++, x: Math.random() * w, y: Math.random() * h };
  };

  useEffect(() => {
    if (!running) return;
    const initial: Target[] = [];
    for (let i = 0; i < TARGET_COUNT; i++) initial.push(randomTarget());
    setTargets(initial);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      setFinalScore(hits);
    }
  }, [timeLeft, running, hits]);

  const start = () => {
    setRunning(true);
    setHits(0);
    setMisses(0);
    setTimeLeft(DURATION);
    setFinalScore(null);
  };

  const hitTarget = (id: number) => {
    setHits((h) => h + 1);
    setTargets((arr) => arr.map((t) => (t.id === id ? randomTarget() : t)));
  };

  const missClick = () => {
    if (running) setMisses((m) => m + 1);
  };

  const save = () => {
    if (finalScore != null) {
      addScore({ game: "gridshot", score: finalScore, unit: "hits" });
      setFinalScore(null);
    }
  };

  return (
    <GameShell
      icon={Grid3X3}
      title={t("nav.gridshot")}
      description={t("games.gridshotDesc")}
      gameKey="gridshot"
      unit="hits"
      currentScore={finalScore ?? hits}
      accent="text-emerald-400"
    >
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Time:</span> <span className="font-mono font-bold text-[#ffa42b]">{timeLeft}s</span></span>
          <span><span className="text-slate-400">Hits:</span> <span className="font-mono font-bold text-[#1ed760]">{hits}</span></span>
          <span><span className="text-slate-400">Miss:</span> <span className="font-mono font-bold text-[#f3727f]">{misses}</span></span>
          <span><span className="text-slate-400">Acc:</span> <span className="font-mono font-bold text-white">{hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(0) : 0}%</span></span>
        </div>
        {!running && finalScore == null && (
          <button onClick={start} className="btn-spotify btn-spotify-sm">
            <Play className="w-3.5 h-3.5" /> {t("games.start")}
          </button>
        )}
        {finalScore != null && (
          <div className="flex gap-2">
            <button onClick={save} className="btn-spotify btn-spotify-sm">
              <Save className="w-3.5 h-3.5" /> {t("games.saveScore")}
            </button>
            <button onClick={start} className="btn-pill">{t("games.restart")}</button>
          </div>
        )}
      </div>
      <div
        ref={canvasRef}
        onClick={missClick}
        className="game-canvas relative h-[480px] bg-[#121212]"
      >
        {running && targets.map((t) => (
          <button
            key={t.id}
            onClick={(e) => { e.stopPropagation(); hitTarget(t.id); }}
            className="absolute rounded-full bg-[#1ed760] shadow-[0_0_15px_rgba(30,215,96,0.5)] hover:scale-110 transition-transform"
            style={{ left: t.x, top: t.y, width: TARGET_SIZE, height: TARGET_SIZE }}
          />
        ))}
        {!running && finalScore != null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-6xl font-bold text-[#1ed760]">{finalScore}</div>
            <div className="text-sm text-slate-400 mt-2">hits in {DURATION}s</div>
          </div>
        )}
        {!running && finalScore == null && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            {t("games.clickToStart")}
          </div>
        )}
      </div>
    </GameShell>
  );
}
