import { useSettings } from "../store/settings";
import { mapKey, layoutLabel } from "../lib/keyboard";
import { Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface BindRow {
  action: string;
  keys: string[];
  note?: string;
  literal?: boolean;
}

interface Props {
  rows: BindRow[];
  title?: string;
}

export default function KeybindTable({ rows, title }: Props) {
  const { t } = useTranslation();
  const layout = useSettings((s) => s.keyboard);

  return (
    <div>
      {title && (
        <div className="flex items-center gap-2 mb-3 text-[#b3b3b3] text-[11px] uppercase tracking-[1.4px] font-bold">
          <Keyboard className="w-3.5 h-3.5" />
          <span>{title}</span>
          <span className="text-[#7c7c7c]">— {t("configs.valuesShown")} {layoutLabel(layout)}</span>
        </div>
      )}
      <div className="bg-[#181818] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-[1.4px] text-[#b3b3b3] font-bold">
              <th className="text-left px-4 py-3 border-b border-white/[0.06]">Action</th>
              <th className="text-left px-4 py-3 border-b border-white/[0.06]">Touche(s)</th>
              <th className="text-left px-4 py-3 border-b border-white/[0.06]">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-4 py-2.5 text-white font-normal">{r.action}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {r.keys.map((k, j) => (
                      <Kbd key={j}>{r.literal ? k : mapKey(k, layout)}</Kbd>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-[#b3b3b3] text-xs">{r.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block min-w-[32px] text-center px-2.5 py-1 bg-[#1f1f1f] border border-[#4d4d4d] rounded text-xs font-mono font-bold text-white">
      {children}
    </kbd>
  );
}
