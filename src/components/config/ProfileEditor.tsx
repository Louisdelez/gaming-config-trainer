import { useState, type ReactNode } from "react";
import { X, Save, Keyboard } from "lucide-react";
import { useProfiles, type AnyProfile, type ValorantProfile, type FortniteProfile, type LolProfile } from "../../store/profiles";
import type { KeyboardLayout } from "../../store/settings";

interface Props {
  profile: AnyProfile;
  onClose: () => void;
}

/* ============================================================
   ProfileEditor — full-screen modal with all editable fields.
   Routes to the right per-game editor.
   ============================================================ */

export default function ProfileEditor({ profile, onClose }: Props) {
  const updateProfile = useProfiles((s) => s.updateProfile);
  const [draft, setDraft] = useState<AnyProfile>({ ...profile });

  const save = () => {
    updateProfile(draft);
    onClose();
  };

  const update = (patch: Partial<AnyProfile>) =>
    setDraft((d) => ({ ...d, ...patch } as AnyProfile));

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#181818] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "rgba(0, 0, 0, 0.8) 0px 16px 48px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3]">Modifier le profil</div>
            <div className="text-lg font-extrabold text-white">{draft.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1ed760] hover:scale-105 text-black text-[11px] font-bold uppercase transition-transform"
              style={{ letterSpacing: "1.4px" }}
            >
              <Save className="w-3.5 h-3.5" /> Sauvegarder
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/[0.06] text-white" aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form body — game-specific */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Common: keyboard layout */}
          <FormSection title="Disposition du clavier">
            <KeyboardLayoutPicker
              value={draft.keyboardLayout}
              onChange={(layout) => update({ keyboardLayout: layout } as Partial<AnyProfile>)}
            />
          </FormSection>

          {draft.game === "valorant" && (
            <ValorantForm draft={draft as ValorantProfile} update={update as (p: Partial<ValorantProfile>) => void} />
          )}
          {draft.game === "fortnite" && (
            <FortniteForm draft={draft as FortniteProfile} update={update as (p: Partial<FortniteProfile>) => void} />
          )}
          {draft.game === "lol" && (
            <LolForm draft={draft as LolProfile} update={update as (p: Partial<LolProfile>) => void} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared form bits ---------- */
function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3
        className="text-[11px] uppercase font-bold text-[#1ed760] mb-3 pb-2 border-b border-white/[0.06]"
        style={{ letterSpacing: "1.4px" }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase font-bold text-[#b3b3b3] mb-1.5" style={{ letterSpacing: "1.4px" }}>
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-mono outline-none transition-colors"
      />
    </label>
  );
}

function KeyboardLayoutPicker({ value, onChange }: { value: KeyboardLayout; onChange: (v: KeyboardLayout) => void }) {
  const opts: { id: KeyboardLayout; label: string; sample: string }[] = [
    { id: "qwerty", label: "QWERTY (US)",    sample: "Q W E R T" },
    { id: "qwertz", label: "QWERTZ (CH/DE)", sample: "Q W E R T Z" },
    { id: "azerty", label: "AZERTY (FR/BE)", sample: "A Z E R T Y" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 col-span-1 sm:col-span-2">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-4 py-3 rounded-md text-left transition-all border ${
            value === o.id
              ? "bg-[#1ed760] border-[#1ed760] text-black"
              : "bg-[#1f1f1f] border-[#3a3a3a] text-white hover:bg-[#252525]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <Keyboard className="w-3.5 h-3.5" />
            {o.label}
          </div>
          <div className={`text-xs font-mono mt-0.5 ${value === o.id ? "text-black/70" : "text-[#b3b3b3]"}`}>
            {o.sample}
          </div>
        </button>
      ))}
    </div>
  );
}

function FieldFull({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block col-span-1 sm:col-span-2">
      <span className="block text-[10px] uppercase font-bold text-[#b3b3b3] mb-1.5" style={{ letterSpacing: "1.4px" }}>
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] focus:border-[#1ed760] text-white text-sm font-mono outline-none transition-colors"
      />
    </label>
  );
}

/* ============================================================
   VALORANT FORM
   ============================================================ */
function ValorantForm({ draft, update }: { draft: ValorantProfile; update: (p: Partial<ValorantProfile>) => void }) {
  return (
    <>
      <FormSection title="Souris">
        <Field label="DPI" value={draft.dpi} onChange={(v) => update({ dpi: v })} />
        <Field label="Polling Rate" value={draft.pollingRate} onChange={(v) => update({ pollingRate: v })} />
        <Field label="Mouse Acceleration" value={draft.mouseAcceleration} onChange={(v) => update({ mouseAcceleration: v })} />
        <Field label="Raw Input Buffer" value={draft.rawInputBuffer} onChange={(v) => update({ rawInputBuffer: v })} />
      </FormSection>

      <FormSection title="Sensibilité">
        <Field label="In-Game Sensitivity" value={draft.sensitivity} onChange={(v) => update({ sensitivity: v })} />
        <Field label="ADS Multiplier" value={draft.adsMultiplier} onChange={(v) => update({ adsMultiplier: v })} />
        <Field label="Scoped Multiplier" value={draft.scopedMultiplier} onChange={(v) => update({ scopedMultiplier: v })} />
        <Field label="Separate Zoom Sens" value={draft.separateZoomSens} onChange={(v) => update({ separateZoomSens: v })} />
        <Field label="ADS Mode" value={draft.adsMode} onChange={(v) => update({ adsMode: v })} placeholder="HOLD / TOGGLE" />
        <Field label="Sniper Mode" value={draft.sniperMode} onChange={(v) => update({ sniperMode: v })} placeholder="HOLD / TOGGLE" />
      </FormSection>

      <FormSection title="Keybinds (touche US-QWERTY)">
        <Field label="Capacité 1" value={draft.ability1} onChange={(v) => update({ ability1: v })} />
        <Field label="Capacité 2" value={draft.ability2} onChange={(v) => update({ ability2: v })} />
        <Field label="Capacité 3" value={draft.ability3} onChange={(v) => update({ ability3: v })} />
        <Field label="Ultimate" value={draft.ultimate} onChange={(v) => update({ ultimate: v })} />
        <Field label="Reload" value={draft.reload} onChange={(v) => update({ reload: v })} />
        <Field label="Use Object" value={draft.useObject} onChange={(v) => update({ useObject: v })} />
        <Field label="Drop arme" value={draft.drop} onChange={(v) => update({ drop: v })} />
        <Field label="Inspect arme" value={draft.inspect} onChange={(v) => update({ inspect: v })} />
        <Field label="Ping" value={draft.ping} onChange={(v) => update({ ping: v })} />
        <Field label="Voice Team" value={draft.voiceTeam} onChange={(v) => update({ voiceTeam: v })} />
        <Field label="Voice Party" value={draft.voiceParty} onChange={(v) => update({ voiceParty: v })} />
        <Field label="Buy Menu" value={draft.buyMenu} onChange={(v) => update({ buyMenu: v })} />
        <Field label="Megamap" value={draft.megamap} onChange={(v) => update({ megamap: v })} />
      </FormSection>

      <FormSection title="Crosshair">
        <FieldFull label="Code Crosshair" value={draft.crosshairCode} onChange={(v) => update({ crosshairCode: v })} />
        <Field label="Couleur" value={draft.crosshairColor} onChange={(v) => update({ crosshairColor: v })} />
      </FormSection>

      <FormSection title="Graphismes">
        <Field label="Display Mode" value={draft.displayMode} onChange={(v) => update({ displayMode: v })} />
        <Field label="Resolution" value={draft.resolution} onChange={(v) => update({ resolution: v })} />
        <Field label="Frame Rate Limit" value={draft.frameRateLimit} onChange={(v) => update({ frameRateLimit: v })} />
        <Field label="VSync" value={draft.vsync} onChange={(v) => update({ vsync: v })} />
        <Field label="NVIDIA Reflex" value={draft.nvidiaReflex} onChange={(v) => update({ nvidiaReflex: v })} />
        <Field label="Material Quality" value={draft.materialQuality} onChange={(v) => update({ materialQuality: v })} />
        <Field label="Texture Quality" value={draft.textureQuality} onChange={(v) => update({ textureQuality: v })} />
        <Field label="Detail Quality" value={draft.detailQuality} onChange={(v) => update({ detailQuality: v })} />
        <Field label="Anti-Aliasing" value={draft.antiAliasing} onChange={(v) => update({ antiAliasing: v })} />
        <Field label="Bloom" value={draft.bloom} onChange={(v) => update({ bloom: v })} />
        <Field label="Distortion" value={draft.distortion} onChange={(v) => update({ distortion: v })} />
        <Field label="Cast Shadows" value={draft.castShadows} onChange={(v) => update({ castShadows: v })} />
      </FormSection>

      <FormSection title="Audio">
        <Field label="Master Volume" value={draft.masterVolume} onChange={(v) => update({ masterVolume: v })} />
        <Field label="Music Volume" value={draft.musicVolume} onChange={(v) => update({ musicVolume: v })} />
        <Field label="SFX Volume" value={draft.sfxVolume} onChange={(v) => update({ sfxVolume: v })} />
        <Field label="Voice Chat Volume" value={draft.voiceChatVolume} onChange={(v) => update({ voiceChatVolume: v })} />
        <Field label="HRTF (3D Audio)" value={draft.hrtf} onChange={(v) => update({ hrtf: v })} />
      </FormSection>

      <FormSection title="Minimap">
        <Field label="Rotate" value={draft.minimapRotate} onChange={(v) => update({ minimapRotate: v })} placeholder="Rotating / Fixed" />
        <Field label="Keep Centered" value={draft.minimapCentered} onChange={(v) => update({ minimapCentered: v })} />
        <Field label="Minimap Size" value={draft.minimapSize} onChange={(v) => update({ minimapSize: v })} />
        <Field label="Minimap Zoom" value={draft.minimapZoom} onChange={(v) => update({ minimapZoom: v })} />
        <Field label="Vision Cones" value={draft.visionCones} onChange={(v) => update({ visionCones: v })} />
      </FormSection>
    </>
  );
}

/* ============================================================
   FORTNITE FORM
   ============================================================ */
function FortniteForm({ draft, update }: { draft: FortniteProfile; update: (p: Partial<FortniteProfile>) => void }) {
  return (
    <>
      <FormSection title="Souris">
        <Field label="DPI" value={draft.dpi} onChange={(v) => update({ dpi: v })} />
        <Field label="Polling Rate" value={draft.pollingRate} onChange={(v) => update({ pollingRate: v })} />
        <Field label="Mouse Acceleration" value={draft.mouseAcceleration} onChange={(v) => update({ mouseAcceleration: v })} />
        <Field label="Raw Input" value={draft.rawInput} onChange={(v) => update({ rawInput: v })} />
      </FormSection>

      <FormSection title="Sensibilité">
        <Field label="X-Axis Sensitivity" value={draft.xSens} onChange={(v) => update({ xSens: v })} />
        <Field label="Y-Axis Sensitivity" value={draft.ySens} onChange={(v) => update({ ySens: v })} />
        <Field label="Targeting (ADS)" value={draft.targetingSens} onChange={(v) => update({ targetingSens: v })} />
        <Field label="Scope Sensitivity" value={draft.scopeSens} onChange={(v) => update({ scopeSens: v })} />
        <Field label="Building Sens (×)" value={draft.buildingSens} onChange={(v) => update({ buildingSens: v })} />
        <Field label="Edit Sens (×)" value={draft.editSens} onChange={(v) => update({ editSens: v })} />
      </FormSection>

      <FormSection title="Keybinds (touche US-QWERTY)">
        <Field label="Wall (Mur)" value={draft.wall} onChange={(v) => update({ wall: v })} />
        <Field label="Floor (Sol)" value={draft.floor} onChange={(v) => update({ floor: v })} />
        <Field label="Ramp / Stairs" value={draft.ramp} onChange={(v) => update({ ramp: v })} />
        <Field label="Roof / Cone" value={draft.roof} onChange={(v) => update({ roof: v })} />
        <Field label="Trap (Piège)" value={draft.trap} onChange={(v) => update({ trap: v })} />
        <Field label="Edit" value={draft.edit} onChange={(v) => update({ edit: v })} />
        <Field label="Reset Edit" value={draft.resetEdit} onChange={(v) => update({ resetEdit: v })} />
        <Field label="Use (Med/Shield)" value={draft.use} onChange={(v) => update({ use: v })} />
        <Field label="Reload" value={draft.reload} onChange={(v) => update({ reload: v })} />
        <Field label="Inventory" value={draft.inventory} onChange={(v) => update({ inventory: v })} />
      </FormSection>

      <FormSection title="Building & Editing">
        <Field label="Turbo Building" value={draft.turboBuilding} onChange={(v) => update({ turboBuilding: v })} />
        <Field label="Reset Building Choice" value={draft.resetBuildingChoice} onChange={(v) => update({ resetBuildingChoice: v })} />
        <Field label="Confirm Edit on Release" value={draft.confirmEditOnRelease} onChange={(v) => update({ confirmEditOnRelease: v })} />
        <Field label="Disable Pre-Edit Option" value={draft.disablePreEdit} onChange={(v) => update({ disablePreEdit: v })} />
        <Field label="Auto Material Change" value={draft.autoMaterialChange} onChange={(v) => update({ autoMaterialChange: v })} />
      </FormSection>

      <FormSection title="Graphismes">
        <Field label="Rendering Mode" value={draft.renderingMode} onChange={(v) => update({ renderingMode: v })} />
        <Field label="Resolution" value={draft.resolution} onChange={(v) => update({ resolution: v })} />
        <Field label="FPS Limit" value={draft.fpsLimit} onChange={(v) => update({ fpsLimit: v })} />
        <Field label="VSync" value={draft.vsync} onChange={(v) => update({ vsync: v })} />
        <Field label="3D Resolution" value={draft.threeDResolution} onChange={(v) => update({ threeDResolution: v })} />
        <Field label="View Distance" value={draft.viewDistance} onChange={(v) => update({ viewDistance: v })} />
        <Field label="Shadows" value={draft.shadows} onChange={(v) => update({ shadows: v })} />
        <Field label="Anti-Aliasing" value={draft.antiAliasing} onChange={(v) => update({ antiAliasing: v })} />
        <Field label="Textures" value={draft.textures} onChange={(v) => update({ textures: v })} />
        <Field label="Effects" value={draft.effects} onChange={(v) => update({ effects: v })} />
        <Field label="Post Processing" value={draft.postProcessing} onChange={(v) => update({ postProcessing: v })} />
        <Field label="Motion Blur" value={draft.motionBlur} onChange={(v) => update({ motionBlur: v })} />
        <Field label="NVIDIA Reflex" value={draft.nvidiaReflex} onChange={(v) => update({ nvidiaReflex: v })} />
      </FormSection>

      <FormSection title="Audio">
        <Field label="Music Volume" value={draft.musicVolume} onChange={(v) => update({ musicVolume: v })} />
        <Field label="SFX Volume" value={draft.sfxVolume} onChange={(v) => update({ sfxVolume: v })} />
        <Field label="Voice Chat Volume" value={draft.voiceChatVolume} onChange={(v) => update({ voiceChatVolume: v })} />
        <Field label="3D Headphones" value={draft.threeDHeadphones} onChange={(v) => update({ threeDHeadphones: v })} />
        <Field label="Visualize Sounds" value={draft.visualizeSounds} onChange={(v) => update({ visualizeSounds: v })} />
      </FormSection>
    </>
  );
}

/* ============================================================
   LOL FORM
   ============================================================ */
function LolForm({ draft, update }: { draft: LolProfile; update: (p: Partial<LolProfile>) => void }) {
  return (
    <>
      <FormSection title="Souris">
        <Field label="DPI" value={draft.dpi} onChange={(v) => update({ dpi: v })} />
        <Field label="Game Mouse Speed" value={draft.gameMouseSpeed} onChange={(v) => update({ gameMouseSpeed: v })} />
        <Field label="Mouse Acceleration" value={draft.mouseAcceleration} onChange={(v) => update({ mouseAcceleration: v })} />
        <Field label="VSync" value={draft.vsync} onChange={(v) => update({ vsync: v })} />
      </FormSection>

      <FormSection title="Keybinds (touche US-QWERTY)">
        <Field label="Spell 1 (Q)" value={draft.spell1} onChange={(v) => update({ spell1: v })} />
        <Field label="Spell 2 (W)" value={draft.spell2} onChange={(v) => update({ spell2: v })} />
        <Field label="Spell 3 (E)" value={draft.spell3} onChange={(v) => update({ spell3: v })} />
        <Field label="Ultimate (R)" value={draft.ultimate} onChange={(v) => update({ ultimate: v })} />
        <Field label="Summoner 1" value={draft.summoner1} onChange={(v) => update({ summoner1: v })} />
        <Field label="Summoner 2" value={draft.summoner2} onChange={(v) => update({ summoner2: v })} />
        <Field label="Attack Move (cursor)" value={draft.attackMove} onChange={(v) => update({ attackMove: v })} />
        <Field label="Attack Move Instant" value={draft.attackMoveInstant} onChange={(v) => update({ attackMoveInstant: v })} />
        <Field label="Stop Attack" value={draft.stop} onChange={(v) => update({ stop: v })} />
        <Field label="Hold Position" value={draft.holdPosition} onChange={(v) => update({ holdPosition: v })} />
        <Field label="Recall" value={draft.recall} onChange={(v) => update({ recall: v })} />
        <Field label="Shop" value={draft.shop} onChange={(v) => update({ shop: v })} />
      </FormSection>

      <FormSection title="Smart Cast">
        <Field label="Smart Cast (Q/W/E/R)" value={draft.smartCastOn} onChange={(v) => update({ smartCastOn: v })} />
        <Field label="Smart Cast on Release" value={draft.smartCastOnRelease} onChange={(v) => update({ smartCastOnRelease: v })} />
      </FormSection>

      <FormSection title="Camera & HUD">
        <Field label="Camera Lock" value={draft.cameraLock} onChange={(v) => update({ cameraLock: v })} />
        <Field label="Minimap Scale" value={draft.minimapScale} onChange={(v) => update({ minimapScale: v })} />
        <Field label="Show Turret Range" value={draft.showTurretRange} onChange={(v) => update({ showTurretRange: v })} />
        <Field label="Show Attack Radius" value={draft.showAttackRadius} onChange={(v) => update({ showAttackRadius: v })} />
        <Field label="Numeric Cooldowns" value={draft.numericCooldowns} onChange={(v) => update({ numericCooldowns: v })} />
      </FormSection>

      <FormSection title="Graphismes">
        <Field label="Resolution" value={draft.resolution} onChange={(v) => update({ resolution: v })} />
        <Field label="Window Mode" value={draft.windowMode} onChange={(v) => update({ windowMode: v })} />
        <Field label="Frame Rate Cap" value={draft.frameRateCap} onChange={(v) => update({ frameRateCap: v })} />
        <Field label="Character Quality" value={draft.characterQuality} onChange={(v) => update({ characterQuality: v })} />
        <Field label="Environment Quality" value={draft.environmentQuality} onChange={(v) => update({ environmentQuality: v })} />
        <Field label="Shadow Quality" value={draft.shadowQuality} onChange={(v) => update({ shadowQuality: v })} />
        <Field label="Effects Quality" value={draft.effectsQuality} onChange={(v) => update({ effectsQuality: v })} />
        <Field label="Anti-Aliasing (FXAA)" value={draft.antiAliasing} onChange={(v) => update({ antiAliasing: v })} />
      </FormSection>

      <FormSection title="Audio">
        <Field label="Master Volume" value={draft.masterVolume} onChange={(v) => update({ masterVolume: v })} />
        <Field label="Music Volume" value={draft.musicVolume} onChange={(v) => update({ musicVolume: v })} />
        <Field label="SFX Volume" value={draft.sfxVolume} onChange={(v) => update({ sfxVolume: v })} />
        <Field label="Voice (Chat) Volume" value={draft.voiceVolume} onChange={(v) => update({ voiceVolume: v })} />
        <Field label="Pings Volume" value={draft.pingsVolume} onChange={(v) => update({ pingsVolume: v })} />
        <Field label="Announcer" value={draft.announcer} onChange={(v) => update({ announcer: v })} />
      </FormSection>
    </>
  );
}
