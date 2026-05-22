import { useState, useRef, useEffect } from "react";
import { Zap, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import AimZone from "../../components/AimZone";
import { useScores } from "../../store/scores";

const TOTAL_SHOTS = 15;
const TARGET_SIZE = 50;

export default function Flickshot() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [shotTimes, setShotTimes] = useState<number[]>([]);
  const [showCenter, setShowCenter] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 480 });
  const targetSpawnTime = useRef(0);
  const addScore = useScores((s) => s.addScore);

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

  const spawnTarget = () => {
    const cx = canvasSize.w / 2; const cy = canvasSize.h / 2;
    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 200;
    const x = Math.max(TARGET_SIZE, Math.min(canvasSize.w - TARGET_SIZE, cx + Math.cos(angle) * dist));
    const y = Math.max(TARGET_SIZE, Math.min(canvasSize.h - TARGET_SIZE, cy + Math.sin(angle) * dist));
    setTarget({ x, y });
    targetSpawnTime.current = performance.now();
  };

  const start = () => {
    setShotTimes([]);
    setRunning(true);
    setShowCenter(true);
    setTarget(null);
    setTimeout(spawnTarget, 800);
  };

  const handleShoot = (cx: number, cy: number) => {
    if (!running || !target) return;
    const r = TARGET_SIZE / 2;
    const dx = (target.x) - cx; // target.x is center
    const dy = (target.y) - cy;
    if (dx * dx + dy * dy <= r * r) {
      const ms = performance.now() - targetSpawnTime.current;
      const newTimes = [...shotTimes, ms];
      setShotTimes(newTimes);
      setTarget(null);
      if (newTimes.length >= TOTAL_SHOTS) {
        setRunning(false);
        setShowCenter(false);
      } else {
        setTimeout(spawnTarget, 500);
      }
    }
    // misses don't count, just keep aiming
  };

  const avgMs = shotTimes.length > 0 ? shotTimes.reduce((a, b) => a + b, 0) / shotTimes.length : null;

  const save = () => {
    if (avgMs != null) {
      addScore({ game: "flickshot", score: avgMs, unit: "ms" });
      setShotTimes([]);
    }
  };

  return (
    <GameShell icon={Zap} title={t("nav.flickshot")} description={t("games.flickshotDesc")} gameKey="flickshot" unit="ms" currentScore={avgMs} accent="text-yellow-400">
<div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Shot:</span> <span className="font-mono font-bold text-[#ffa42b]">{shotTimes.length}/{TOTAL_SHOTS}</span></span>
          <span><span className="text-slate-400">Last:</span> <span className="font-mono font-bold text-[#1ed760]">{shotTimes.length > 0 ? shotTimes[shotTimes.length - 1].toFixed(0) : "-"} ms</span></span>
          <span><span className="text-slate-400">Avg:</span> <span className="font-mono font-bold text-[#1ed760]">{avgMs ? avgMs.toFixed(0) : "-"} ms</span></span>
        </div>
        {!running && shotTimes.length === 0 && (
          <button onClick={start} className="btn-spotify btn-spotify-sm">
            <Play className="w-3.5 h-3.5" /> {t("games.start")}
          </button>
        )}
        {!running && shotTimes.length > 0 && (
          <div className="flex gap-2">
            <button onClick={save} className="btn-spotify btn-spotify-sm">
              <Save className="w-3.5 h-3.5" /> {t("games.saveScore")}
            </button>
            <button onClick={start} className="btn-pill">{t("games.restart")}</button>
          </div>
        )}
      </div>
      <div ref={canvasRef} className="game-canvas">
        <AimZone active={running} className="h-[480px] bg-[#121212]" onShoot={handleShoot}>
          {showCenter && running && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-yellow-400/40 ring-2 ring-yellow-400 pointer-events-none" />
          )}
          {target && running && (
            <div className="absolute rounded-full bg-[#1ed760] shadow-[0_0_20px_rgba(30,215,96,0.5)] pointer-events-none" style={{ left: target.x - TARGET_SIZE / 2, top: target.y - TARGET_SIZE / 2, width: TARGET_SIZE, height: TARGET_SIZE }} />
          )}
          {!running && shotTimes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">{t("games.clickToStart")}</div>
          )}
          {!running && shotTimes.length === TOTAL_SHOTS && avgMs != null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
              <div className="text-6xl font-bold text-[#1ed760]">{avgMs.toFixed(0)} ms</div>
              <div className="text-sm text-slate-400 mt-2">avg flick time over {TOTAL_SHOTS} shots</div>
            </div>
          )}
        </AimZone>
      </div>
    </GameShell>
  );
}
