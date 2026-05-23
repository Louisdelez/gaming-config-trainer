import { useState, useRef, useCallback } from "react";
import {
  Network as NetworkIcon, Play, Loader2, Wifi, Activity, Waves, PackageX,
  Gauge, Check, AlertTriangle, Info, Save,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useScores } from "../../store/scores";
import {
  GAME_SERVERS, pingServer, testDownload, gradeLatency, gradeJitter, gradeLoss, gradeDownload,
  GRADE_COLOR, GRADE_LABEL, type PingResult, type SpeedResult, type Grade,
} from "../../lib/network";

type Phase = "idle" | "running" | "done";

export default function NetworkTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0, label: "" });
  const [results, setResults] = useState<PingResult[]>([]);
  const [speed, setSpeed] = useState<SpeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);
  const addScore = useScores((s) => s.addScore);

  const runTest = useCallback(async () => {
    setError(null);
    setResults([]);
    setSpeed(null);
    setPhase("running");
    cancelRef.current = false;

    const total = GAME_SERVERS.length + 1; // +1 for download
    let done = 0;
    const newResults: PingResult[] = [];

    try {
      // 1. Ping all gaming servers sequentially (parallel might skew with bandwidth contention)
      for (const server of GAME_SERVERS) {
        if (cancelRef.current) break;
        setProgress({ done, total, label: `${server.game} — ${server.region}` });
        try {
          const r = await pingServer(server, 5);
          newResults.push(r);
          setResults([...newResults]); // live update
        } catch (e) {
          console.error("ping failed", server.url, e);
        }
        done++;
        setProgress({ done, total, label: `${server.game} — ${server.region}` });
      }

      // 2. Download speed test
      if (!cancelRef.current) {
        setProgress({ done, total, label: "Test de bande passante…" });
        try {
          const s = await testDownload(10_000_000);
          setSpeed(s);
        } catch (e) {
          console.error("download test failed", e);
        }
        done++;
        setProgress({ done, total, label: "Test de bande passante…" });
      }

      setPhase("done");
    } catch (e: any) {
      setError(e?.message ?? "Test échoué");
      setPhase("done");
    }
  }, []);

  const stop = () => { cancelRef.current = true; };

  // Aggregate stats from successful pings
  const successful = results.filter((r) => r.avg >= 0);
  const avgLatency = successful.length > 0
    ? successful.reduce((a, b) => a + b.avg, 0) / successful.length : 0;
  const avgJitter = successful.length > 0
    ? successful.reduce((a, b) => a + b.jitter, 0) / successful.length : 0;
  const avgLoss = results.length > 0
    ? results.reduce((a, b) => a + b.loss, 0) / results.length : 0;
  const bestServer = successful.length > 0
    ? successful.reduce((best, cur) => cur.avg < best.avg ? cur : best)
    : null;

  const saveResult = () => {
    if (successful.length === 0) return;
    addScore({ game: "network", score: Math.round(avgLatency), unit: "ms" });
  };

  return (
    <>
      <PageHeader
        icon={NetworkIcon}
        title="Speed Test"
        subtitle="Latence, jitter, packet loss vers les principaux serveurs de jeu"
      infoSlug="network" />

      {/* CONTROLS */}
      <div className="bg-[#181818] rounded-xl p-5 mb-6 flex items-center gap-4 flex-wrap">
        {phase === "idle" && (
          <button
            onClick={runTest}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1ed760] hover:scale-105 text-black text-sm font-bold uppercase transition-transform"
            style={{ letterSpacing: "1.4px" }}
          >
            <Play className="w-4 h-4" />
            Démarrer le test
          </button>
        )}
        {phase === "running" && (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-sm font-bold uppercase transition-colors"
            style={{ letterSpacing: "1.4px" }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Arrêter
          </button>
        )}
        {phase === "done" && (
          <>
            <button
              onClick={runTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ed760] hover:scale-105 text-black text-sm font-bold uppercase transition-transform"
              style={{ letterSpacing: "1.4px" }}
            >
              <Play className="w-4 h-4" />
              Relancer
            </button>
            <button
              onClick={saveResult}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-sm font-bold uppercase transition-colors"
              style={{ letterSpacing: "1.4px" }}
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </>
        )}

        {phase === "running" && (
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs text-[#b3b3b3] mb-1.5">
              <span className="font-bold">{progress.label || "Initialisation…"}</span>
              <span className="font-mono">{progress.done}/{progress.total}</span>
            </div>
            <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1ed760] transition-all duration-200"
                style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-[#2a0e10] border border-[#f3727f] rounded-xl p-4 mb-6 text-[#f3727f] text-sm">
          <AlertTriangle className="inline w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {/* AGGREGATE STATS */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat
            icon={Activity}
            label="Latence moyenne"
            value={avgLatency > 0 ? avgLatency.toFixed(0) : "—"}
            unit="ms"
            grade={gradeLatency(avgLatency)}
          />
          <Stat
            icon={Waves}
            label="Jitter moyen"
            value={avgJitter > 0 ? avgJitter.toFixed(1) : "—"}
            unit="ms"
            grade={gradeJitter(avgJitter)}
          />
          <Stat
            icon={PackageX}
            label="Packet loss"
            value={avgLoss.toFixed(1)}
            unit="%"
            grade={gradeLoss(avgLoss)}
          />
          <Stat
            icon={Gauge}
            label="Download"
            value={speed ? speed.mbps.toFixed(1) : "—"}
            unit="Mbps"
            grade={speed ? gradeDownload(speed.mbps) : "bad"}
          />
        </div>
      )}

      {bestServer && (
        <div className="bg-[#0e2a18] border border-[#1ed760] rounded-xl p-4 mb-6 flex items-center gap-3">
          <Check className="w-5 h-5 text-[#1ed760] shrink-0" />
          <div className="flex-1">
            <div className="text-[#1ed760] font-bold text-sm">Meilleur serveur</div>
            <div className="text-white text-xs">
              <strong>{bestServer.server.game}</strong> — {bestServer.server.region}
              {bestServer.server.city && ` (${bestServer.server.city})`}
              {" · "}
              <span className="font-mono font-bold text-[#1ed760]">{bestServer.avg.toFixed(0)} ms</span>
            </div>
          </div>
        </div>
      )}

      {/* SERVER TABLE */}
      <h2 className="text-[11px] uppercase font-bold text-[#b3b3b3] mb-3" style={{ letterSpacing: "1.4px" }}>
        Latence par serveur ({results.length}/{GAME_SERVERS.length})
      </h2>
      <div className="bg-[#181818] rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">
              <th className="text-left px-4 py-3 border-b border-white/[0.06]">Jeu</th>
              <th className="text-left px-4 py-3 border-b border-white/[0.06]">Région</th>
              <th className="text-right px-4 py-3 border-b border-white/[0.06]">Ping</th>
              <th className="text-right px-4 py-3 border-b border-white/[0.06] hidden md:table-cell">Min/Max</th>
              <th className="text-right px-4 py-3 border-b border-white/[0.06]">Jitter</th>
              <th className="text-right px-4 py-3 border-b border-white/[0.06]">Loss</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <ServerRow key={i} result={r} />
            ))}
            {phase === "running" && results.length < GAME_SERVERS.length && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-[#b3b3b3] text-xs">
                  <Loader2 className="inline w-3 h-3 animate-spin mr-2" />
                  Test en cours… {results.length}/{GAME_SERVERS.length}
                </td>
              </tr>
            )}
            {phase === "idle" && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#b3b3b3] text-sm">
                  <Wifi className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Clique sur <strong className="text-white">Démarrer le test</strong> pour mesurer la latence vers tous les serveurs de jeu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* GUIDELINES */}
      <div className="bg-[#181818] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-[#1ed760]" />
          <h3 className="text-[11px] uppercase font-bold text-white" style={{ letterSpacing: "1.4px" }}>
            Guide gaming
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-[#b3b3b3] uppercase tracking-wider mb-2 font-bold">Latence (ping)</div>
            <Bar grade="excellent" label="< 20 ms — Pro" />
            <Bar grade="good"      label="20–50 ms — Smooth compétitif" />
            <Bar grade="ok"        label="50–100 ms — Jouable" />
            <Bar grade="poor"      label="100–150 ms — Médiocre" />
            <Bar grade="bad"       label="> 150 ms — Très laggy" />
          </div>
          <div>
            <div className="text-[#b3b3b3] uppercase tracking-wider mb-2 font-bold">Jitter (variation)</div>
            <Bar grade="excellent" label="< 5 ms — Stable" />
            <Bar grade="good"      label="5–10 ms — Bon" />
            <Bar grade="ok"        label="10–20 ms — Correct" />
            <Bar grade="poor"      label="20–30 ms — Variations notables" />
            <Bar grade="bad"       label="> 30 ms — Connexion instable" />
          </div>
          <div>
            <div className="text-[#b3b3b3] uppercase tracking-wider mb-2 font-bold">Packet loss</div>
            <Bar grade="excellent" label="0 % — Parfait" />
            <Bar grade="good"      label="< 1 % — Bon" />
            <Bar grade="ok"        label="1–2 % — Limite" />
            <Bar grade="poor"      label="2–5 % — Stuttering" />
            <Bar grade="bad"       label="> 5 % — Contacter l'ISP" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-[#b3b3b3]">
          <p>
            💡 <strong className="text-white">Note</strong> : les mesures sont basées sur des requêtes HTTPS (proxy du ping ICMP). Ajoute ~10–20 ms pour la surcharge HTTPS comparé à un ping natif. Pour Valorant/LoL en jeu, le ping in-game est généralement inférieur à ces valeurs.
          </p>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Subcomponents
   ============================================================ */

function Stat({ icon: Icon, label, value, unit, grade }: {
  icon: any; label: string; value: string; unit: string; grade: Grade;
}) {
  const color = GRADE_COLOR[grade];
  return (
    <div className="bg-[#181818] rounded-lg p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="font-mono font-bold text-2xl" style={{ color }}>
        {value}
        <span className="text-xs text-[#b3b3b3] ml-1 font-normal">{unit}</span>
      </div>
      <div className="text-[10px] uppercase tracking-[1.4px] font-bold mt-1" style={{ color }}>
        {GRADE_LABEL[grade]}
      </div>
    </div>
  );
}

function ServerRow({ result }: { result: PingResult }) {
  const { server, avg, min, max, jitter, loss } = result;
  const grade = gradeLatency(avg);
  const color = GRADE_COLOR[grade];
  const failed = avg < 0;

  return (
    <tr className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-2.5 text-white text-sm">{server.game}</td>
      <td className="px-4 py-2.5 text-[#b3b3b3] text-xs">
        {server.region}
        {server.city && <span className="text-[#7c7c7c]"> · {server.city}</span>}
      </td>
      <td className="px-4 py-2.5 text-right font-mono font-bold" style={{ color }}>
        {failed ? "—" : `${avg.toFixed(0)} ms`}
      </td>
      <td className="px-4 py-2.5 text-right font-mono text-[#b3b3b3] text-xs hidden md:table-cell">
        {failed ? "—" : `${min.toFixed(0)} / ${max.toFixed(0)}`}
      </td>
      <td className="px-4 py-2.5 text-right font-mono text-xs" style={{ color: failed ? "#7c7c7c" : GRADE_COLOR[gradeJitter(jitter)] }}>
        {failed ? "—" : `${jitter.toFixed(1)} ms`}
      </td>
      <td className="px-4 py-2.5 text-right font-mono text-xs" style={{ color: GRADE_COLOR[gradeLoss(loss)] }}>
        {loss === 0 ? "0%" : `${loss.toFixed(0)}%`}
      </td>
    </tr>
  );
}

function Bar({ grade, label }: { grade: Grade; label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: GRADE_COLOR[grade] }} />
      <span className="text-white">{label}</span>
    </div>
  );
}
