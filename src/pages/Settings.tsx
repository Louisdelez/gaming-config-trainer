import { Settings as SettingsIcon, Languages, Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings, type Language, type KeyboardLayout } from "../store/settings";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const keyboard = useSettings((s) => s.keyboard);
  const setLanguage = useSettings((s) => s.setLanguage);
  const setKeyboard = useSettings((s) => s.setKeyboard);

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
