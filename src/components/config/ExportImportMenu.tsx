import { useState, useRef, useEffect } from "react";
import { Download, Upload, FileText, FileImage, FileCode, FileType2, ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";
import { useProfiles, useActiveProfile, type GameId, type AnyProfile } from "../../store/profiles";
import { exportHtml, exportPdf, exportPng, exportTxt, exportMd, pickImportFile } from "../../lib/exporters";
import { buildProfileFromText } from "../../lib/importers";

interface Props {
  game: GameId;
}

type Status =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "ok"; msg: string; detail?: string }
  | { kind: "err"; msg: string };

export default function ExportImportMenu({ game }: Props) {
  const active = useActiveProfile(game);
  const createProfile = useProfiles((s) => s.createProfile);
  const updateProfile = useProfiles((s) => s.updateProfile);

  const [exportOpen, setExportOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  // Auto-clear status after 4s
  useEffect(() => {
    if (status.kind === "ok" || status.kind === "err") {
      const t = setTimeout(() => setStatus({ kind: "idle" }), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const runExport = async (
    fn: (p: AnyProfile) => Promise<string | null>,
    label: string
  ) => {
    setExportOpen(false);
    setStatus({ kind: "busy", msg: `Préparation ${label}…` });
    try {
      const path = await fn(active);
      if (!path) {
        // user cancelled
        setStatus({ kind: "idle" });
        return;
      }
      setStatus({ kind: "ok", msg: `${label} enregistré`, detail: shortenPath(path) });
    } catch (e) {
      console.error(e);
      setStatus({ kind: "err", msg: `Erreur ${label}` });
    }
  };

  const handleImport = async () => {
    setStatus({ kind: "busy", msg: "Sélection du fichier…" });
    try {
      const picked = await pickImportFile();
      if (!picked) {
        setStatus({ kind: "idle" });
        return;
      }
      const fallbackName = filenameFromPath(picked.path) || "Profil importé";

      // Create a clone with same layout as active, then apply parsed values
      const newId = createProfile(game, {
        name: fallbackName,
        keyboardLayout: active.keyboardLayout,
        basedOn: active.id,
      });
      const built = buildProfileFromText(
        picked.content,
        { ...active, id: newId, isDefault: false },
        fallbackName,
        game
      );
      const newProfile = { ...built.profile, id: newId } as AnyProfile;
      updateProfile(newProfile);

      setStatus({
        kind: "ok",
        msg: `Importé : ${built.fieldsMatched} champs`,
        detail: shortenPath(picked.path),
      });
    } catch (e) {
      console.error(e);
      setStatus({ kind: "err", msg: "Import échoué" });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Importer — single button */}
        <button
          onClick={handleImport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-[11px] font-bold uppercase transition-colors"
          style={{ letterSpacing: "1.4px" }}
        >
          <Upload className="w-3.5 h-3.5" />
          Importer
        </button>

        {/* Exporter — dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setExportOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#252525] text-white text-[11px] font-bold uppercase transition-colors"
            style={{ letterSpacing: "1.4px" }}
          >
            <Download className="w-3.5 h-3.5" />
            Exporter
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
          </button>

          {exportOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-64 bg-[#282828] rounded-lg overflow-hidden z-50"
              style={{ boxShadow: "rgba(0, 0, 0, 0.5) 0px 8px 24px" }}
            >
              <div
                className="px-3 py-2 text-[10px] uppercase font-bold text-[#b3b3b3] border-b border-white/[0.06]"
                style={{ letterSpacing: "1.4px" }}
              >
                Format d'export
              </div>
              <MenuItem icon={FileCode}  label="HTML"     ext=".html" onClick={() => runExport(exportHtml, "HTML")} />
              <MenuItem icon={FileType2} label="PDF"      ext=".pdf"  onClick={() => runExport(exportPdf,  "PDF")} />
              <MenuItem icon={FileImage} label="Image"    ext=".png"  onClick={() => runExport(exportPng,  "PNG")} />
              <MenuItem icon={FileText}  label="Texte"    ext=".txt"  onClick={() => runExport(exportTxt,  "TXT")} />
              <MenuItem icon={FileText}  label="Markdown" ext=".md"   onClick={() => runExport(exportMd,   "MD")} />
              <div className="px-3 py-2 text-[10px] text-[#b3b3b3] border-t border-white/[0.06] bg-[#1f1f1f]">
                Tu pourras choisir le dossier de destination
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status toast */}
      {status.kind !== "idle" && <StatusToast status={status} />}
    </>
  );
}

function MenuItem({
  icon: Icon, label, ext, onClick,
}: { icon: typeof Download; label: string; ext: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-white/[0.04] transition-colors"
    >
      <Icon className="w-4 h-4 text-[#b3b3b3]" />
      <span className="font-bold">{label}</span>
      <span className="text-[10px] text-[#b3b3b3] ml-auto font-mono">{ext}</span>
    </button>
  );
}

function StatusToast({ status }: { status: Exclude<Status, { kind: "idle" }> }) {
  const colors = {
    busy: { bg: "#1f1f1f", border: "#1ed760", text: "text-white",       Icon: Loader2 },
    ok:   { bg: "#0e2a18", border: "#1ed760", text: "text-[#1ed760]",   Icon: Check },
    err:  { bg: "#2a0e10", border: "#f3727f", text: "text-[#f3727f]",   Icon: AlertCircle },
  } as const;
  const c = colors[status.kind];
  const Icon = c.Icon;
  const detail = status.kind === "ok" && status.detail ? status.detail : undefined;

  return (
    <div
      className={`fixed bottom-24 right-6 z-50 px-4 py-3 rounded-lg text-sm font-bold ${c.text} max-w-sm`}
      style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px" }}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 shrink-0 ${status.kind === "busy" ? "animate-spin" : ""}`} />
        <span>{status.msg}</span>
      </div>
      {detail && <div className="mt-1 text-[10px] text-[#b3b3b3] font-mono break-all">{detail}</div>}
    </div>
  );
}

function filenameFromPath(p: string): string {
  const norm = p.replace(/\\/g, "/");
  const base = norm.split("/").pop() ?? "";
  return base.replace(/\.(txt|md)$/i, "").replace(/[_-]/g, " ").trim();
}

function shortenPath(p: string, max = 50): string {
  if (p.length <= max) return p;
  return "…" + p.slice(-(max - 1));
}
