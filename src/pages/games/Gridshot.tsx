import { useState, useRef, useEffect } from "react";
import { Grid3X3, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import AimZone from "../../components/AimZone";
import SensitivityControl from "../../components/SensitivityControl";
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
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 480 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const addScore = useScores((s) => s.addScore);

  // Track canvas size for target placement
  useEffect(() => {
    const update = () => {
      if (canvasRef.current) {
        const r = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ w: r.width, h: r.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const randomTarget = (): Target => {
    const w = canvasSize.w - TARGET_SIZE;
    const h = canvasSize.h - TARGET_SIZE;
    return { id: nextId.current++, x: Math.random() * w, y: Math.random() * h };
  };

  useEffect(() => {
    if (!running) return;
    setTargets(Array.from({ length: TARGET_COUNT }, randomTarget));
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleShoot = (cx: number, cy: number) => {
    if (!running) return;
    // Hit-test against any target (circle collision)
    const r = TARGET_SIZE / 2;
    const hitIndex = targets.findIndex((t) => {
      const dx = (t.x + r) - cx;
      const dy = (t.y + r) - cy;
      return dx * dx + dy * dy <= r * r;
    });
    if (hitIndex >= 0) {
      setHits((h) => h + 1);
      setTargets((arr) => arr.map((t, i) => i === hitIndex ? randomTarget() : t));
    } else {
      setMisses((m) => m + 1);
    }
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
      <SensitivityControl disabled={running} />

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

      <div ref={canvasRef} className="game-canvas">
        <AimZone
          active={running}
          className="h-[480px] bg-[#121212]"
          onShoot={handleShoot}
        >
          {running && targets.map((t) => (
            <div
              key={t.id}
              className="absolute rounded-full bg-[#1ed760] shadow-[0_0_15px_rgba(30,215,96,0.5)] pointer-events-none"
              style={{ left: t.x, top: t.y, width: TARGET_SIZE, height: TARGET_SIZE }}
            />
          ))}
          {!running && finalScore != null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
              <div className="text-6xl font-bold text-[#1ed760]">{finalScore}</div>
              <div className="text-sm text-slate-400 mt-2">hits in {DURATION}s</div>
            </div>
          )}
          {!running && finalScore == null && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
              {t("games.clickToStart")}
            </div>
          )}
        </AimZone>
      </div>
    </GameShell>
  );
}
