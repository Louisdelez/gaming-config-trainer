import { useState, useRef, useEffect } from "react";
import { Monitor, Play, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import GameShell from "../../components/GameShell";
import { useScores } from "../../store/scores";

const DURATION = 3; // seconds

export default function MonitorHz() {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [hz, setHz] = useState<number | null>(null);
  const frames = useRef(0);
  const startTime = useRef(0);
  const rafId = useRef(0);
  const addScore = useScores((s) => s.addScore);

  useEffect(() => () => { if (rafId.current) cancelAnimationFrame(rafId.current); }, []);

  const start = () => {
    frames.current = 0;
    setHz(null);
    setRunning(true);
    startTime.current = performance.now();
    const loop = () => {
      frames.current++;
      const elapsed = performance.now() - startTime.current;
      if (elapsed >= DURATION * 1000) {
        const measured = (frames.current / elapsed) * 1000;
        setHz(measured);
        setRunning(false);
        return;
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
  };

  const save = () => {
    if (hz != null) {
      addScore({ game: "monitorhz", score: hz, unit: "Hz" });
      setHz(null);
    }
  };

  const closest = (h: number) => {
    const std = [60, 75, 90, 100, 120, 144, 165, 180, 200, 240, 280, 360, 480, 540];
    return std.reduce((best, x) => Math.abs(x - h) < Math.abs(best - h) ? x : best);
  };

  return (
    <GameShell icon={Monitor} title={t("nav.monitorhz")} description={t("games.monitorHzDesc")} gameKey="monitorhz" unit="Hz" currentScore={hz} accent="text-blue-400">
      <div className="bg-[#1f1f1f] px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex gap-6 text-sm">
          <span><span className="text-slate-400">Duration:</span> <span className="font-mono font-bold text-[#ffa42b]">{DURATION}s</span></span>
        </div>
        {!running && hz == null && <button onClick={start} className="btn-spotify btn-spotify-sm"><Play className="w-3.5 h-3.5" /> {t("games.start")}</button>}
        {hz != null && <div className="flex gap-2"><button onClick={save} className="btn-spotify btn-spotify-sm"><Save className="w-3.5 h-3.5" /> {t("games.saveScore")}</button><button onClick={start} className="btn-pill">{t("games.restart")}</button></div>}
      </div>
      <div className="h-[480px] bg-[#121212] flex items-center justify-center">
        {running ? (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-blue-500/20 border-4 border-blue-400 animate-spin" style={{ animationDuration: "0.5s" }} />
            <div className="text-slate-400 mt-6 text-sm">Measuring... {DURATION}s</div>
          </div>
        ) : hz != null ? (
          <div className="text-center">
            <div className="text-7xl font-bold text-[#1ed760]">{hz.toFixed(1)} Hz</div>
            <div className="text-sm text-slate-400 mt-2">â‰ˆ {closest(hz)} Hz (standard)</div>
            <div className="text-xs text-slate-500 mt-3 max-w-md mx-auto">
              Note: Browser refresh may be capped at 60 Hz on some setups (VSync, power mode).
              Real monitor Hz can be set in Windows Display Settings.
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500">
            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Measures display refresh rate via requestAnimationFrame ({DURATION}s)</p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
