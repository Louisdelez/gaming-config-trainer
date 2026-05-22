import { useState, useEffect, useRef } from "react";
import { Palette, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const COLORS = [
  { name: "RED", value: "#ef4444" },
  { name: "BLUE", value: "#3b82f6" },
  { name: "GREEN", value: "#10b981" },
  { name: "YELLOW", value: "#facc15" },
  { name: "PURPLE", value: "#a855f7" },
];

const DURATION = 30;

export default function Stroop() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [current, setCurrent] = useState<{ word: number; color: number }>({ word: 0, color: 1 });
  const [choices, setChoices] = useState<number[]>([0, 1, 2, 3]);
  const timer = useRef<number | null>(null);
  const addScore = useScores((s) => s.addScore);

  const next = () => {
    let word: number; let color: number;
    do {
      word = Math.floor(Math.random() * COLORS.length);
      color = Math.floor(Math.random() * COLORS.length);
    } while (word === color);
    setCurrent({ word, color });
    // Build 4 random choices including the correct color
    const set = new Set<number>([color]);
    while (set.size < 4) set.add(Math.floor(Math.random() * COLORS.length));
    setChoices([...set].sort(() => Math.random() - 0.5));
  };

  const start = () => {
    setRunning(true); setScore(0); setErrors(0); setTimeLeft(DURATION); setFinalScore(null);
    next();
    timer.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { if (timer.current) clearInterval(timer.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (running && timeLeft === 0) { setRunning(false); setFinalScore(score); }
  }, [timeLeft, running, score]);

  const pick = (i: number) => {
    if (!running) return;
    if (i === current.color) { setScore((s) => s + 1); next(); }
    else { setErrors((e) => e + 1); }
  };

  const save = () => { if (finalScore != null) { addScore({ game: "stroop", score: finalScore, unit: "ok" }); setFinalScore(null); } };

  return (
    <GameShell icon={Palette} title={t("nav.stroop")} description={t("games.stroopDesc")} gameKey="stroop" unit="ok" currentScore={finalScore ?? score} accent="text-orange-400">
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Time:</span> <span className="font-mono font-bold text-[#ffa42b]">{timeLeft}s</span></span>
          <span><span className="text-slate-400">Score:</span> <span className="font-mono font-bold text-[#1ed760]">{score}</span></span>
          <span><span className="text-slate-400">Errors:</span> <span className="font-mono font-bold text-[#f3727f]">{errors}</span></span>
        </div>
        {!running && finalScore == null && <button onClick={start} className="btn-spotify btn-spotify-sm"><Play className="w-3.5 h-3.5" /> {t("games.start")}</button>}
        {finalScore != null && <div className="flex gap-2"><button onClick={save} className="btn-spotify btn-spotify-sm"><Save className="w-3.5 h-3.5" /> {t("games.saveScore")}</button><button onClick={start} className="btn-pill">{t("games.restart")}</button></div>}
      </div>
      <div className="game-canvas h-[480px] bg-[#121212] flex flex-col items-center justify-center gap-12">
        {running ? (
          <>
            <div className="text-7xl font-extrabold tracking-wider" style={{ color: COLORS[current.color].value }}>
              {COLORS[current.word].name}
            </div>
            <div className="text-sm text-slate-400 mb-2">Click the COLOR of the word</div>
            <div className="flex gap-3 flex-wrap justify-center">
              {choices.map((i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className="px-6 py-3 rounded-lg font-bold text-white text-sm transition-transform hover:scale-105"
                  style={{ background: COLORS[i].value }}
                >
                  {COLORS[i].name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            {finalScore != null ? (
              <>
                <div className="text-6xl font-bold text-[#1ed760]">{finalScore}</div>
                <div className="text-sm text-slate-400 mt-2">correct in {DURATION}s</div>
              </>
            ) : (
              <div className="text-slate-500">{t("games.clickToStart")}</div>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
