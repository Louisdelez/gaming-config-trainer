import { useState, useRef, useEffect } from "react";
import { Gauge, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const DURATION = 5; // seconds

export default function PollingRate() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [estimatedHz, setEstimatedHz] = useState<number | null>(null);
  const events = useRef<number[]>([]);
  const timer = useRef<number | null>(null);
  const addScore = useScores((s) => s.addScore);

  const start = () => {
    events.current = [];
    setEstimatedHz(null);
    setRunning(true);
    timer.current = window.setTimeout(() => {
      // Compute average frequency from inter-event delays
      const evts = events.current;
      if (evts.length < 5) { setEstimatedHz(0); setRunning(false); return; }
      const deltas: number[] = [];
      for (let i = 1; i < evts.length; i++) deltas.push(evts[i] - evts[i - 1]);
      // Use median delta to avoid outliers
      deltas.sort((a, b) => a - b);
      const medDelta = deltas[Math.floor(deltas.length / 2)];
      const hz = 1000 / medDelta;
      setEstimatedHz(hz);
      setRunning(false);
    }, DURATION * 1000);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onMove = () => {
    if (running) events.current.push(performance.now());
  };

  const save = () => {
    if (estimatedHz != null) {
      addScore({ game: "polling", score: estimatedHz, unit: "Hz" });
      setEstimatedHz(null);
    }
  };

  const closest = (hz: number) => {
    const std = [125, 250, 500, 1000, 2000, 4000, 8000];
    return std.reduce((best, x) => Math.abs(x - hz) < Math.abs(best - hz) ? x : best);
  };

  return (
    <GameShell icon={Gauge} title={t("nav.polling")} description={t("games.pollingDesc")} gameKey="polling" unit="Hz" currentScore={estimatedHz} accent="text-emerald-400">
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Events:</span> <span className="font-mono font-bold text-[#1ed760]">{events.current.length}</span></span>
        </div>
        {!running && estimatedHz == null && <button onClick={start} className="btn-spotify btn-spotify-sm"><Play className="w-3.5 h-3.5" /> {t("games.start")} ({DURATION}s)</button>}
        {estimatedHz != null && <div className="flex gap-2"><button onClick={save} className="btn-spotify btn-spotify-sm"><Save className="w-3.5 h-3.5" /> {t("games.saveScore")}</button><button onClick={start} className="btn-pill">{t("games.restart")}</button></div>}
      </div>
      <div
        ref={canvasRef}
        onMouseMove={onMove}
        className="game-canvas h-[480px] bg-[#121212] flex items-center justify-center"
      >
        {running ? (
          <div className="text-center">
            <div className="text-2xl text-emerald-400 mb-4 animate-pulse">Move your mouse FAST in this area!</div>
            <div className="text-7xl font-mono font-bold text-white">{events.current.length}</div>
            <div className="text-sm text-slate-500 mt-2">events captured</div>
          </div>
        ) : estimatedHz != null ? (
          <div className="text-center">
            <div className="text-7xl font-bold text-[#1ed760]">{estimatedHz.toFixed(0)} Hz</div>
            <div className="text-sm text-slate-400 mt-2">â‰ˆ {closest(estimatedHz)} Hz (standard)</div>
            <div className="text-xs text-slate-500 mt-3 max-w-md mx-auto">
              Note: Browser may cap mouse events. Real polling rate could be higher.
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-center px-6">
            <Gauge className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Click Start, then move your mouse rapidly inside this area for {DURATION}s.</p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
