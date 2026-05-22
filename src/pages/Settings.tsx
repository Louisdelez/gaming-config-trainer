import { Settings as SettingsIcon, Languages, Keyboard, Crosshair, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings, type Language, type KeyboardLayout, AIM_SENS_MIN, AIM_SENS_MAX, AIM_SENS_DEFAULT } from "../store/settings";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const keyboard = useSettings((s) => s.keyboard);
  const aimSens = useSettings((s) => s.aimSensitivity);
  const setLanguage = useSettings((s) => s.setLanguage);
  const setKeyboard = useSettings((s) => s.setKeyboard);
  const setAimSensitivity = useSettings((s) => s.setAimSensitivity);

  const langs: Language[] = ["fr", "en"];
  const kbs: KeyboardLayout[] = ["qwerty", "qwertz", "azerty"];

  return (
    <>
      <PageHeader icon={SettingsIcon} title={t("settings.title")} />

      <div className="space-y-8 max-w-2xl">
        <Section icon={Languages} title={t("settings.language")}>
          <div className="grid grid-cols-2 gap-3">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-5 py-4 rounded-lg text-left transition-all ${
                  language === l
                    ? "bg-[#1ed760] text-black"
                    : "bg-[#181818] text-white hover:bg-[#252525]"
                }`}
              >
                <div className="font-bold">{t(`settings.languages.${l}`)}</div>
                <div className={`text-xs uppercase tracking-[1.4px] font-bold mt-0.5 ${language === l ? "text-black/70" : "text-[#b3b3b3]"}`}>{l}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Keyboard} title={t("settings.keyboard")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kbs.map((k) => (
              <button
                key={k}
                onClick={() => setKeyboard(k)}
                className={`px-5 py-4 rounded-lg text-left transition-all ${
                  keyboard === k
                    ? "bg-[#1ed760] text-black"
                    : "bg-[#181818] text-white hover:bg-[#252525]"
                }`}
              >
                <div className="font-bold">{t(`settings.keyboards.${k}`)}</div>
                <div className={`text-xs font-mono font-bold mt-1 ${keyboard === k ? "text-black/70" : "text-[#b3b3b3]"}`}>
                  {k === "qwerty" && "Q W E R T"}
                  {k === "qwertz" && "Q W E R T Z"}
                  {k === "azerty" && "A Z E R T Y"}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#b3b3b3] mt-3">
            Les bindings dans les configs (Valorant, Fortnite, LoL) sont adaptés à ta disposition.
          </p>
        </Section>

        <Section icon={Crosshair} title="Sensibilité Aim Training">
          <div className="bg-[#181818] rounded-lg p-5">
            <div className="flex items-center gap-4 mb-3">
              <input
                type="range"
                min={AIM_SENS_MIN}
                max={AIM_SENS_MAX}
                step={0.05}
                value={aimSens}
                onChange={(e) => setAimSensitivity(parseFloat(e.target.value))}
                className="flex-1 accent-[#1ed760] h-2"
              />
              <input
                type="number"
                min={AIM_SENS_MIN}
                max={AIM_SENS_MAX}
                step={0.05}
                value={aimSens.toFixed(2)}
                onChange={(e) => setAimSensitivity(parseFloat(e.target.value))}
                className="w-24 px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-base font-mono font-bold text-center outline-none"
              />
              <button
                type="button"
                onClick={() => setAimSensitivity(AIM_SENS_DEFAULT)}
                title="Réinitialiser (1.00)"
                className="p-2 rounded hover:bg-white/[0.06] text-[#b3b3b3] hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">
              <span>0.1 (très lent)</span>
              <span>1.0 (normal)</span>
              <span>5.0 (très rapide)</span>
            </div>
            <p className="text-xs text-[#b3b3b3] mt-4">
              Multiplicateur appliqué aux mouvements de souris dans les <strong className="text-white">5 aim trainers</strong> (Gridshot, Microshots, Strafe, Flickshot, Tracking). La sensibilité utilise le <strong className="text-white">Pointer Lock API</strong> + un crosshair custom.
            </p>
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[11px] uppercase tracking-[1.4px] text-[#b3b3b3] font-bold mb-3 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" /> {title}
      </h2>
      {children}
    </div>
  );
}
