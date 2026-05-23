import { useEffect, useState } from "react";
import { Download, X, Loader2, ArrowUpCircle } from "lucide-react";
import { checkForUpdate, downloadAndInstallUpdate, type UpdateInfo } from "../lib/updater";

const DISMISS_KEY = "gct-update-dismissed-version";

export default function UpdateBanner() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Silent check on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await checkForUpdate();
        if (!result.available) return;
        // Skip if user dismissed this exact version
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed === result.newVersion) return;
        setInfo(result);
      } catch (e) {
        // Silent — could be offline, server unreachable, etc.
        console.debug("[updater] silent check failed:", e);
      }
    })();
  }, []);

  if (!info || !info.available) return null;

  const dismiss = () => {
    if (info.newVersion) localStorage.setItem(DISMISS_KEY, info.newVersion);
    setInfo(null);
  };

  const install = async () => {
    setInstalling(true);
    setError(null);
    setProgress({ done: 0, total: 0 });
    try {
      await downloadAndInstallUpdate((evt) => {
        if (evt.kind === "started" && evt.total) {
          setProgress({ done: 0, total: evt.total });
        } else if (evt.kind === "progress") {
          setProgress((p) => ({ ...p, done: p.done + evt.chunkLength }));
        }
      });
      // relaunch() is called inside downloadAndInstallUpdate — we never reach here
    } catch (e: any) {
      console.error("[updater] install failed:", e);
      setError(e?.message ?? String(e));
      setInstalling(false);
    }
  };

  const pctDone = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <>
      {/* Top banner */}
      <div className="bg-[#0e2a18] border-b border-[#1ed760] px-6 py-2.5 flex items-center gap-3">
        <ArrowUpCircle className="w-4 h-4 text-[#1ed760] shrink-0" />
        <span className="text-xs text-white font-bold">
          Nouvelle version disponible : <span className="text-[#1ed760]">v{info.newVersion}</span>
          <span className="text-[#b3b3b3] ml-2">(actuel : v{info.currentVersion})</span>
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1ed760] hover:scale-105 text-black text-[10px] font-bold uppercase transition-transform"
          style={{ letterSpacing: "1.4px" }}
        >
          <Download className="w-3 h-3" />
          Voir
        </button>
        <button
          onClick={dismiss}
          className="p-1 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white"
          title="Ignorer cette version"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => !installing && setShowModal(false)}
        >
          <div
            className="bg-[#181818] rounded-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: "rgba(0, 0, 0, 0.8) 0px 16px 48px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Mise à jour disponible</div>
                <div className="text-lg font-extrabold text-white">v{info.currentVersion} → v{info.newVersion}</div>
              </div>
              {!installing && (
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-white/[0.06] text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[40vh] overflow-y-auto">
              {info.body ? (
                <pre className="text-xs text-[#b3b3b3] whitespace-pre-wrap font-sans">{info.body}</pre>
              ) : (
                <p className="text-xs text-[#b3b3b3]">Pas de notes de version disponibles.</p>
              )}
              {info.date && <div className="text-[10px] text-[#7c7c7c] mt-3">Publiée le {new Date(info.date).toLocaleString()}</div>}
            </div>

            {/* Install progress */}
            {installing && (
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 text-xs text-[#b3b3b3] mb-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Téléchargement en cours… {formatBytes(progress.done)}{progress.total > 0 && ` / ${formatBytes(progress.total)}`}</span>
                </div>
                <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1ed760] transition-all duration-200" style={{ width: `${pctDone}%` }} />
                </div>
                <div className="text-[10px] text-[#b3b3b3] mt-2 text-center">
                  L'application va redémarrer automatiquement après l'installation
                </div>
              </div>
            )}

            {error && (
              <div className="mx-6 mb-4 p-3 rounded bg-[#2a0e10] border border-[#f3727f] text-[#f3727f] text-xs font-mono break-all">
                {error}
              </div>
            )}

            {/* Footer */}
            {!installing && (
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full bg-transparent hover:bg-white/[0.06] text-white text-[11px] font-bold uppercase transition-colors"
                  style={{ letterSpacing: "1.4px" }}
                >
                  Plus tard
                </button>
                <button
                  onClick={install}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1ed760] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform"
                  style={{ letterSpacing: "1.4px" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Installer maintenant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
