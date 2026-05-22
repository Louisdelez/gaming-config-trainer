import { useState, useEffect, useRef } from "react";
import { ScanSearch, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const SHAPES = ["circle", "square", "triangle", "hexagon", "diamond"] as const;
const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#facc15", "#a855f7", "#f97316"];
const DURATION = 30;

interface Target { shape: typeof SHAPES[number]; color: string; id: number; }

function randomTarget(id: number): Target {
  return {
    id,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function Shape({ shape, color, size = 60 }: { shape: typeof SHAPES[number]; color: string; size?: number }) {
  const style: React.CSSProperties = { width: size, height: size, background: color };
  switch (shape) {
    case "circle": return <div style={{ ...style, borderRadius: "50%" }} />;
    case "square": return <div style={{ ...style, borderRadius: 6 }} />;
    case "triangle": return <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />;
    case "hexagon": return <div style={{ ...style, clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" }} />;
    case "diamond": return <div style={{ ...style, transform: "rotate(45deg)", borderRadius: 6 }} />;
  }
}

export default function VisualMatch() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [pattern, setPattern] = useState<Target>(randomTarget(0));
  const [choices, setChoices] = useState<Target[]>([]);
  const nextId = useRef(1);
  const timer = useRef<number | null>(null);
  const addScore = useScores((s) => s.addScore);

  const newRound = () => {
    const p = randomTarget(nextId.current++);
    setPattern(p);
    // 4 choices, one matches both shape AND color
    const arr: Target[] = [{ ...p, id: nextId.current++ }];
    while (arr.length < 4) arr.push(randomTarget(nextId.current++));
    setChoices(arr.sort(() => Math.random() - 0.5));
  };

  const start = () => {
    setRunning(true); setScore(0); setErrors(0); setTimeLeft(DURATION); setFinalScore(null);
    newRound();
    timer.current = window.setInterval(() => setTimeLeft((t) => {
      if (t <= 1) { if (timer.current) clearInterval(timer.current); return 0; }
      return t - 1;
    }), 1000);
  };

  useEffect(() => {
    if (running && timeLeft === 0) { setRunning(false); setFinalScore(score); }
  }, [timeLeft, running, score]);

  const pick = (c: Target) => {
    if (!running) return;
    if (c.shape === pattern.shape && c.color === pattern.color) { setScore((s) => s + 1); newRound(); }
    else { setErrors((e) => e + 1); }
  };

  const save = () => { if (finalScore != null) { addScore({ game: "visualmatch", score: finalScore, unit: "ok" }); setFinalScore(null); } };

  return (
    <GameShell icon={ScanSearch} title={t("nav.visualmatch")} description={t("games.visualMatchDesc")} gameKey="visualmatch" unit="ok" currentScore={finalScore ?? score} accent="text-teal-400">
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Time:</span> <span className="font-mono font-bold text-[#ffa42b]">{timeLeft}s</span></span>
          <span><span className="text-slate-400">Match:</span> <span className="font-mono font-bold text-[#1ed760]">{score}</span></span>
          <span><span className="text-slate-400">Errors:</span> <span className="font-mono font-bold text-[#f3727f]">{errors}</span></span>
        </div>
        {!running && finalScore == null && <button onClick={start} className="btn-spotify btn-spotify-sm"><Play className="w-3.5 h-3.5" /> {t("games.start")}</button>}
        {finalScore != null && <div className="flex gap-2"><button onClick={save} className="btn-spotify btn-spotify-sm"><Save className="w-3.5 h-3.5" /> {t("games.saveScore")}</button><button onClick={start} className="btn-pill">{t("games.restart")}</button></div>}
      </div>
      <div className="h-[480px] bg-[#121212] flex flex-col items-center justify-center gap-10">
        {running ? (
          <>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Match this:</div>
              <div className="flex justify-center"><Shape shape={pattern.shape} color={pattern.color} size={80} /></div>
            </div>
            <div className="flex gap-6">
              {choices.map((c) => (
                <button key={c.id} onClick={() => pick(c)} className="p-4 rounded-xl border border-white/10 hover:border-teal-500/60 hover:bg-white/5 transition-all">
                  <Shape shape={c.shape} color={c.color} size={60} />
                </button>
              ))}
            </div>
          </>
        ) : finalScore != null ? (
          <div className="text-center">
            <div className="text-6xl font-bold text-[#1ed760]">{finalScore}</div>
            <div className="text-sm text-slate-400 mt-2">correct matches in {DURATION}s</div>
          </div>
        ) : (
          <div className="text-slate-500">{t("games.clickToStart")}</div>
        )}
      </div>
    </GameShell>
  );
}
