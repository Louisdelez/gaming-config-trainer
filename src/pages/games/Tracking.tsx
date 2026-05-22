import { useState, useRef, useEffect } from "react";
import { Move, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const DURATION = 30;
const TARGET_RADIUS = 35;

export default function Tracking() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [accuracyPct, setAccuracyPct] = useState<number | null>(null);
  const targetPos = useRef({ x: 200, y: 200 });
  const targetVel = useRef({ vx: 2.5, vy: 1.7 });
  const mousePos = useRef({ x: 0, y: 0 });
  const onTargetFrames = useRef(0);
  const totalFrames = useRef(0);
  const holding = useRef(false);
  const animFrame = useRef<number>(0);
  const addScore = useScores((s) => s.addScore);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const loop = () => {
      const w = rect.width; const h = rect.height;
      // Update target position with bouncing + random drift
      if (Math.random() < 0.02) {
        targetVel.current.vx += (Math.random() - 0.5) * 0.8;
        targetVel.current.vy += (Math.random() - 0.5) * 0.8;
        const max = 4;
        targetVel.current.vx = Math.max(-max, Math.min(max, targetVel.current.vx));
        targetVel.current.vy = Math.max(-max, Math.min(max, targetVel.current.vy));
      }
      targetPos.current.x += targetVel.current.vx;
      targetPos.current.y += targetVel.current.vy;
      if (targetPos.current.x < TARGET_RADIUS || targetPos.current.x > w - TARGET_RADIUS) targetVel.current.vx *= -1;
      if (targetPos.current.y < TARGET_RADIUS || targetPos.current.y > h - TARGET_RADIUS) targetVel.current.vy *= -1;

      // Check if mouse is on target while holding click
      if (holding.current) {
        const dx = mousePos.current.x - targetPos.current.x;
        const dy = mousePos.current.y - targetPos.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= TARGET_RADIUS) onTargetFrames.current++;
        totalFrames.current++;
      }
      // Update DOM
      const dot = document.getElementById("track-target");
      if (dot) {
        dot.style.transform = `translate(${targetPos.current.x - TARGET_RADIUS}px, ${targetPos.current.y - TARGET_RADIUS}px)`;
      }
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);

    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => { cancelAnimationFrame(animFrame.current); clearInterval(timer); };
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      const acc = totalFrames.current > 0 ? (onTargetFrames.current / totalFrames.current) * 100 : 0;
      setAccuracyPct(acc);
    }
  }, [timeLeft, running]);

  const start = () => {
    targetPos.current = { x: 300, y: 200 };
    targetVel.current = { vx: 2.5, vy: 1.7 };
    onTargetFrames.current = 0;
    totalFrames.current = 0;
    setTimeLeft(DURATION);
    setAccuracyPct(null);
    setRunning(true);
  };

  const save = () => {
    if (accuracyPct != null) {
      addScore({ game: "tracking", score: accuracyPct, unit: "%" });
      setAccuracyPct(null);
    }
  };

  return (
    <GameShell
      icon={Move}
      title={t("nav.tracking")}
      description={t("games.trackingDesc")}
      gameKey="tracking"
      unit="%"
      currentScore={accuracyPct}
      accent="text-cyan-400"
    >
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Time:</span> <span className="font-mono font-bold text-[#ffa42b]">{timeLeft}s</span></span>
          <span><span className="text-slate-400">On Target:</span> <span className="font-mono font-bold text-white">{totalFrames.current > 0 ? ((onTargetFrames.current / totalFrames.current) * 100).toFixed(1) : 0}%</span></span>
        </div>
        {!running && (
          <button onClick={start} className="btn-spotify btn-spotify-sm">
            <Play className="w-3.5 h-3.5" /> {t("games.start")}
          </button>
        )}
        {accuracyPct != null && (
          <button onClick={save} className="btn-spotify btn-spotify-sm">
            <Save className="w-3.5 h-3.5" /> {t("games.saveScore")}
          </button>
        )}
      </div>
      <div
        ref={canvasRef}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseDown={() => { holding.current = true; }}
        onMouseUp={() => { holding.current = false; }}
        onMouseLeave={() => { holding.current = false; }}
        className="game-canvas relative h-[480px] bg-[#121212]"
      >
        {running && (
          <div
            id="track-target"
            className="absolute pointer-events-none rounded-full bg-[#1ed760] shadow-[0_0_20px_rgba(30,215,96,0.5)] will-change-transform"
            style={{ width: TARGET_RADIUS * 2, height: TARGET_RADIUS * 2, left: 0, top: 0 }}
          />
        )}
        {!running && accuracyPct == null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-center px-6">
            <Move className="w-8 h-8 mb-3" />
            <p>Hold left-click and follow the sphere</p>
          </div>
        )}
        {accuracyPct != null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-6xl font-bold text-[#1ed760]">{accuracyPct.toFixed(1)}%</div>
            <div className="text-sm text-slate-400 mt-2">time on target</div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
