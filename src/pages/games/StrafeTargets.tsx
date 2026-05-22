import { useState, useRef, useEffect } from "react";
import { ChevronsLeftRight, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import AimZone from "../../components/AimZone";
import { useScores } from "../../store/scores";

const DURATION = 30;
const TARGET_SIZE = 45;
const TARGET_COUNT = 3;

interface Target { x: number; y: number; vx: number; id: number; }

export default function StrafeTargets() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 480 });
  const targets = useRef<Target[]>([]);
  const nextId = useRef(0);
  const animFrame = useRef(0);
  const [tick, setTick] = useState(0);
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

  const spawn = (): Target => ({
    id: nextId.current++,
    x: Math.random() * (canvasSize.w - TARGET_SIZE),
    y: 50 + Math.random() * (canvasSize.h - 100),
    vx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3),
  });

  useEffect(() => {
    if (!running) return;
    targets.current = Array.from({ length: TARGET_COUNT }, spawn);
    const w = canvasSize.w;
    const loop = () => {
      targets.current.forEach((t) => {
        t.x += t.vx;
        if (t.x < 0 || t.x > w - TARGET_SIZE) t.vx *= -1;
      });
      setTick((tk) => tk + 1);
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => { cancelAnimationFrame(animFrame.current); clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) { setRunning(false); setFinalScore(hits); }
  }, [timeLeft, running, hits]);

  const start = () => { setRunning(true); setHits(0); setMisses(0); setTimeLeft(DURATION); setFinalScore(null); };

  const handleShoot = (cx: number, cy: number) => {
    if (!running) return;
    const r = TARGET_SIZE / 2;
    const idx = targets.current.findIndex((t) => {
      const dx = (t.x + r) - cx;
      const dy = (t.y + r) - cy;
      return dx * dx + dy * dy <= r * r;
    });
    if (idx >= 0) {
      setHits((h) => h + 1);
      targets.current = targets.current.map((t, i) => i === idx ? spawn() : t);
    } else {
      setMisses((m) => m + 1);
    }
  };

  const save = () => { if (finalScore != null) { addScore({ game: "strafe", score: finalScore, unit: "hits" }); setFinalScore(null); } };

  return (
    <GameShell icon={ChevronsLeftRight} title={t("nav.strafe")} description={t("games.strafeDesc")} gameKey="strafe" unit="hits" currentScore={finalScore ?? hits} accent="text-sky-400">
<div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Time:</span> <span className="font-mono font-bold text-[#ffa42b]">{timeLeft}s</span></span>
          <span><span className="text-slate-400">Hits:</span> <span className="font-mono font-bold text-[#1ed760]">{hits}</span></span>
          <span><span className="text-slate-400">Miss:</span> <span className="font-mono font-bold text-[#f3727f]">{misses}</span></span>
        </div>
        {!running && finalScore == null && <button onClick={start} className="btn-spotify btn-spotify-sm"><Play className="w-3.5 h-3.5" /> {t("games.start")}</button>}
        {finalScore != null && <div className="flex gap-2"><button onClick={save} className="btn-spotify btn-spotify-sm"><Save className="w-3.5 h-3.5" /> {t("games.saveScore")}</button><button onClick={start} className="btn-pill">{t("games.restart")}</button></div>}
      </div>
      <div ref={canvasRef} className="game-canvas">
        <AimZone active={running} className="h-[480px] bg-[#121212]" onShoot={handleShoot}>
          <div style={{ display: "none" }}>{tick}</div>
          {running && targets.current.map((t) => (
            <div key={t.id} className="absolute rounded-full bg-[#1ed760] shadow-[0_0_12px_rgba(30,215,96,0.5)] will-change-transform pointer-events-none" style={{ left: 0, top: 0, transform: `translate(${t.x}px, ${t.y}px)`, width: TARGET_SIZE, height: TARGET_SIZE }} />
          ))}
          {!running && finalScore == null && <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">{t("games.clickToStart")}</div>}
          {!running && finalScore != null && <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none"><div className="text-6xl font-bold text-[#1ed760]">{finalScore}</div><div className="text-sm text-slate-400 mt-2">moving targets hit</div></div>}
        </AimZone>
      </div>
    </GameShell>
  );
}
