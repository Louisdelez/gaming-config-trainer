import { Settings as SettingsIcon, Languages, Keyboard, Crosshair, RotateCcw, Palette, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useSettings, type Language, type KeyboardLayout, type CrosshairShape,
  AIM_SENS_MIN, AIM_SENS_MAX, AIM_SENS_DEFAULT,
  CROSSHAIR_SHAPES, CROSSHAIR_COLOR_PRESETS,
} from "../store/settings";
import { useActiveProfile, type ValorantProfile, type FortniteProfile, type LolProfile } from "../store/profiles";
import { aimSensFromValorant, aimSensFromFortnite, aimSensFromLol } from "../lib/aimPresets";
import PageHeader from "../components/PageHeader";
import CrosshairSvg from "../components/CrosshairSvg";
import valorantIcon from "../assets/games/valorant.png";
import fortniteIcon from "../assets/games/fortnite.svg";
import lolIcon from "../assets/games/lol.png";

export default function Settings() {
  const { t } = useTranslation();
  const language = useSettings((s) => s.language);
  const keyboard = useSettings((s) => s.keyboard);
  const aimSens = useSettings((s) => s.aimSensitivity);
  const crosshairShape = useSettings((s) => s.crosshairShape);
  const crosshairColor = useSettings((s) => s.crosshairColor);
  const setLanguage = useSettings((s) => s.setLanguage);
  const setKeyboard = useSettings((s) => s.setKeyboard);
  const setAimSensitivity = useSettings((s) => s.setAimSensitivity);
  const setCrosshairShape = useSettings((s) => s.setCrosshairShape);
  const setCrosshairColor = useSettings((s) => s.setCrosshairColor);

  // Active profiles for sensitivity presets
  const valorantProfile = useActiveProfile("valorant") as ValorantProfile;
  const fortniteProfile = useActiveProfile("fortnite") as FortniteProfile;
  const lolProfile      = useActiveProfile("lol") as LolProfile;
  const valSens  = aimSensFromValorant(valorantProfile);
  const fortSens = aimSensFromFortnite(fortniteProfile);
  const lolSens  = aimSensFromLol(lolProfile);

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
            <p className="text-xs text-[#b3b3b3] mt-4 mb-3">
              Multiplicateur appliqué aux mouvements de souris dans les <strong className="text-white">5 aim trainers</strong> (Gridshot, Microshots, Strafe, Flickshot, Tracking). La sensibilité utilise le <strong className="text-white">Pointer Lock API</strong> + un crosshair custom.
            </p>

            {/* Presets from game profiles */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="text-[10px] uppercase font-bold text-[#b3b3b3] mb-2.5" style={{ letterSpacing: "1.4px" }}>
                Reprendre depuis un profil de jeu
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <PresetButton
                  img={valorantIcon}
                  label="Valorant"
                  hint={`eDPI ${valSens.edpi.toFixed(0)} → ${valSens.value.toFixed(2)}×`}
                  active={Math.abs(aimSens - valSens.value) < 0.005}
                  onClick={() => setAimSensitivity(valSens.value)}
                />
                <PresetButton
                  img={fortniteIcon}
                  label="Fortnite"
                  hint={`eDPI ${fortSens.edpi.toFixed(0)} → ${fortSens.value.toFixed(2)}×`}
                  active={Math.abs(aimSens - fortSens.value) < 0.005}
                  onClick={() => setAimSensitivity(fortSens.value)}
                />
                <PresetButton
                  img={lolIcon}
                  label="League of Legends"
                  hint={`Speed ${lolProfile.gameMouseSpeed} → ${lolSens.value.toFixed(2)}×`}
                  active={Math.abs(aimSens - lolSens.value) < 0.005}
                  onClick={() => setAimSensitivity(lolSens.value)}
                />
              </div>
              <p className="text-[10px] text-[#7c7c7c] mt-2 italic">
                Approximation basée sur ton profil actif de chaque jeu (référence eDPI 300 ≈ 1.0×).
              </p>
            </div>
          </div>
        </Section>

        <Section icon={Crosshair} title="Crosshair (forme)">
          <div className="bg-[#181818] rounded-lg p-5">
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-4">
              {CROSSHAIR_SHAPES.map((s) => (
                <ShapeChoice
                  key={s}
                  shape={s}
                  color={crosshairColor}
                  active={crosshairShape === s}
                  onSelect={() => setCrosshairShape(s)}
                />
              ))}
            </div>
            <p className="text-xs text-[#b3b3b3]">
              Forme du viseur affichée pendant les aim trainers.
            </p>
          </div>
        </Section>

        <Section icon={Palette} title="Crosshair (couleur)">
          <div className="bg-[#181818] rounded-lg p-5">
            {/* Preset swatches */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
              {CROSSHAIR_COLOR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCrosshairColor(p.hex)}
                  title={p.label}
                  className={`relative aspect-square rounded-lg transition-all ${
                    crosshairColor.toLowerCase() === p.hex.toLowerCase()
                      ? "ring-2 ring-white scale-105"
                      : "hover:scale-105 hover:ring-2 hover:ring-white/40"
                  }`}
                  style={{ background: p.hex }}
                >
                  {crosshairColor.toLowerCase() === p.hex.toLowerCase() && (
                    <Check className="absolute inset-0 m-auto w-5 h-5 text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>

            {/* Custom hex picker */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
              <span className="text-[11px] uppercase font-bold text-[#b3b3b3]" style={{ letterSpacing: "1.4px" }}>
                Couleur personnalisée
              </span>
              <input
                type="color"
                value={crosshairColor}
                onChange={(e) => setCrosshairColor(e.target.value)}
                className="w-12 h-9 rounded cursor-pointer bg-transparent border border-[#3a3a3a]"
              />
              <input
                type="text"
                value={crosshairColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) setCrosshairColor(v);
                }}
                placeholder="#1ed760"
                className="w-28 px-3 py-2 rounded bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-mono uppercase outline-none"
              />
            </div>
          </div>
        </Section>

        {/* Live preview */}
        <Section icon={Crosshair} title="Aperçu">
          <div className="bg-[#0a0a0a] rounded-lg h-40 flex items-center justify-center relative overflow-hidden">
            {/* Grid pattern background for context */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <CrosshairSvg shape={crosshairShape} color={crosshairColor} size={56} />
          </div>
          <p className="text-xs text-[#b3b3b3] mt-2 text-center">
            Aperçu du crosshair utilisé dans les aim trainers
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

function PresetButton({ img, label, hint, active, onClick }: {
  img: string; label: string; hint: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
        active
          ? "bg-[#1ed760] text-black"
          : "bg-[#1f1f1f] text-white hover:bg-[#252525]"
      }`}
    >
      <div className={`w-8 h-8 rounded-md flex items-center justify-center p-1 shrink-0 ${active ? "bg-black/10" : "bg-[#0f0f0f]"}`}>
        <img src={img} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate">{label}</div>
        <div className={`text-[10px] font-mono ${active ? "text-black/70" : "text-[#b3b3b3]"}`}>{hint}</div>
      </div>
      {active && <Check className="w-4 h-4 shrink-0" strokeWidth={3} />}
    </button>
  );
}

function ShapeChoice({ shape, color, active, onSelect }: {
  shape: CrosshairShape; color: string; active: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-square rounded-lg flex items-center justify-center transition-all ${
        active
          ? "bg-[#0a0a0a] ring-2 ring-[#1ed760]"
          : "bg-[#0a0a0a] hover:ring-2 hover:ring-white/40"
      }`}
      title={shape}
    >
      <CrosshairSvg shape={shape} color={color} size={32} shadow={false} />
      <span className={`absolute bottom-1 text-[9px] uppercase tracking-[1.4px] font-bold ${active ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}>
        {shape}
      </span>
    </button>
  );
}
