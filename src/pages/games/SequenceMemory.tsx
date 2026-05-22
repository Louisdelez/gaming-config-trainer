import { useState, useEffect, useRef } from "react";
import { Brain, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const PADS = 9; // 3x3 grid

export default function SequenceMemory() {
  const { t } = useTranslation();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [highlighting, setHighlighting] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "gameover">("idle");
  const [finalLevel, setFinalLevel] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const addScore = useScores((s) => s.addScore);

  const clearTimers = () => { timers.current.forEach((t) => clearTimeout(t)); timers.current = []; };

  useEffect(() => () => clearTimers(), []);

  const showSequence = (seq: number[]) => {
    setPhase("showing");
    clearTimers();
    seq.forEach((pad, i) => {
      const t1 = window.setTimeout(() => setHighlighting(pad), i * 600 + 300);
      const t2 = window.setTimeout(() => setHighlighting(null), i * 600 + 600);
      timers.current.push(t1, t2);
    });
    const t3 = window.setTimeout(() => { setHighlighting(null); setPhase("input"); setUserIndex(0); }, seq.length * 600 + 400);
    timers.current.push(t3);
  };

  const start = () => {
    const first = Math.floor(Math.random() * PADS);
    setSequence([first]);
    setFinalLevel(null);
    showSequence([first]);
  };

  const padClick = (i: number) => {
    if (phase !== "input") return;
    if (i !== sequence[userIndex]) {
      // wrong
      setPhase("gameover");
      setFinalLevel(sequence.length - 1);
      return;
    }
    // flash on press
    setHighlighting(i);
    setTimeout(() => setHighlighting(null), 200);

    const next = userIndex + 1;
    if (next === sequence.length) {
      // level passed â†’ add new
      const newSeq = [...sequence, Math.floor(Math.random() * PADS)];
      setSequence(newSeq);
      setTimeout(() => showSequence(newSeq), 600);
    } else {
      setUserIndex(next);
    }
  };

  const save = () => { if (finalLevel != null) { addScore({ game: "sequence", score: finalLevel, unit: "lvl" }); setFinalLevel(null); setPhase("idle"); setSequence([]); } };

  return (
    <GameShell icon={Brain} title={t("nav.sequence")} description={t("games.sequenceDesc")} gameKey="sequence" unit="lvl" currentScore={finalLevel ?? Math.max(0, sequence.length - 1)} accent="text-fuchsia-400">
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Level:</span> <span className="font-mono font-bold text-[#1ed760]">{sequence.length}</span></span>
          <span><span className="text-slate-400">Phase:</span> <span className="font-mono font-bold text-[#ffa42b]">{phase}</span></span>
        </div>
        {phase === "idle" && <button onClick={start} className="btn-spotify btn-spotify-sm"><Play className="w-3.5 h-3.5" /> {t("games.start")}</button>}
        {phase === "gameover" && <div className="flex gap-2"><button onClick={save} className="btn-spotify btn-spotify-sm"><Save className="w-3.5 h-3.5" /> {t("games.saveScore")}</button><button onClick={() => { setPhase("idle"); setSequence([]); start(); }} className="btn-pill">{t("games.restart")}</button></div>}
      </div>
      <div className="h-[480px] bg-[#121212] flex items-center justify-center">
        {phase === "gameover" ? (
          <div className="text-center">
            <div className="text-6xl font-bold text-[#1ed760]">Lvl {finalLevel}</div>
            <div className="text-sm text-slate-400 mt-2">your max sequence length</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 p-6">
            {Array.from({ length: PADS }, (_, i) => (
              <button
                key={i}
                onClick={() => padClick(i)}
                className={`w-24 h-24 rounded-xl border-2 transition-all ${
                  highlighting === i
                    ? "bg-fuchsia-400 border-fuchsia-300 scale-110 shadow-[0_0_30px_rgba(232,121,249,0.8)]"
                    : "bg-white/5 border-white/10 hover:border-fuchsia-500/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </GameShell>
  );
}
