import { useState } from "react";
import {
  Keyboard as KeyboardIcon, Monitor, Zap, Gauge, Mouse, Target,
  MoveHorizontal, MoveVertical, ZoomIn, Scan, Hammer, Edit3, Calculator,
  Lightbulb, Hand, AlertTriangle, Info, Square, RectangleHorizontal, Triangle,
  Pyramid, Volume2, Headphones, ChartBar, Eye, Activity, XCircle, CheckCircle,
} from "lucide-react";
import { mapKey, layoutLabel } from "../../lib/keyboard";
import { useActiveProfile, type FortniteProfile } from "../../store/profiles";
import {
  ConfigHeader, Section, SubTitle, CardsGrid, SpotifyCard, SpotifyTable, Th, Tr,
  Callout, BuildCard, ProCard, Keyboard, KbRow, Kb, KbTag, Legend, ConfigFooter,
} from "../../components/config/SpotifyConfig";
import fortniteIcon from "../../assets/games/fortnite.svg";
import ProfileBar from "../../components/config/ProfileBar";
import ProfileEditor from "../../components/config/ProfileEditor";
import FabAddProfile from "../../components/config/FabAddProfile";

export default function Fortnite() {
  const p = useActiveProfile("fortnite") as FortniteProfile;
  const [editing, setEditing] = useState(false);
  const layout = p.keyboardLayout;
  const k = (key: string) => mapKey(key, layout);

  return (
    <>
      <ProfileBar game="fortnite" onEdit={() => setEditing(true)} />
      {editing && <ProfileEditor profile={p} onClose={() => setEditing(false)} />}

      <div data-config-export="fortnite">
        <ConfigHeader
          image={fortniteIcon}
          title="Fortnite Config"
          subtitle={`${p.name}${p.isDefault ? " • Lecture seule" : " • Profil personnel"}`}
          badges={[
            { icon: KeyboardIcon, label: "Clavier :",    value: layoutLabel(layout) },
            { icon: Monitor,      label: "Résolution :", value: p.resolution },
            { icon: Zap,          label: "Mode :",       value: p.renderingMode },
            { icon: Gauge,        label: "FPS Cible :",  value: p.fpsLimit },
          ]}
        />

      {/* MOUSE */}
      <Section icon={Mouse} title="Souris" accent="/ Hardware">
        <CardsGrid>
          <SpotifyCard icon={Gauge}       label="DPI"                value={p.dpi}              note="Standard pro (400-800 acceptés)" />
          <SpotifyCard icon={Activity}    label="Polling Rate"       value={p.pollingRate}      note="Min latence d'input" />
          <SpotifyCard icon={XCircle}     label="Mouse Acceleration" value={p.mouseAcceleration} note="Windows ET in-game" accent="negative" />
          <SpotifyCard icon={CheckCircle} label="Raw Input"          value={p.rawInput}         note="Bypasses Windows pointer settings" accent="green" />
        </CardsGrid>
        <Callout type="warn" icon={AlertTriangle} title="Souris à boutons latéraux fortement recommandée">
          Fortnite = build + edit + tir simultanés. Sans boutons latéraux, tu perds des duels.
          <strong> Logitech G Pro X Superlight 2</strong>, <strong>Razer Viper V3 Pro</strong>, ou <strong>Endgame Gear OP1 8K</strong> sont les plus utilisées par les pros.
        </Callout>
      </Section>

      {/* SENSITIVITY */}
      <Section icon={Target} title="Sensibilité" accent="/ Multipliers">
        <CardsGrid>
          <SpotifyCard icon={MoveHorizontal} label="X-Axis Sensitivity"   value={p.xSens}         note="Plage pro : 6–12%" />
          <SpotifyCard icon={MoveVertical}   label="Y-Axis Sensitivity"   value={p.ySens}         note="1:1 avec X (jamais différent)" />
          <SpotifyCard icon={ZoomIn}         label="Targeting (ADS)"      value={p.targetingSens} note="Visée ADS / scope court" />
          <SpotifyCard icon={Scan}           label="Scope Sensitivity"    value={p.scopeSens}     note="Sniper / scope long" />
          <SpotifyCard icon={Hammer}         label="Building Sens"        value={p.buildingSens}  note="Pour build/turn rapide" accent="green" />
          <SpotifyCard icon={Edit3}          label="Edit Sens"            value={p.editSens}      note="Précision en mode edit" accent="green" />
        </CardsGrid>
        <Callout type="default" icon={Calculator} title="Formule eDPI Fortnite">
          eDPI = DPI × (Sensitivity % / 100) × 5,5 (constante Fortnite)<br />
          Exemple : 800 × 0.08 × 5.5 = <strong>352 eDPI</strong> — typique pro
        </Callout>
        <Callout type="warn" icon={Lightbulb} title="Test 360°">
          Sur Creative ou Lobby : place ta souris à gauche du tapis, fais un mouvement jusqu'à la droite.
          Tu dois faire 1 tour complet (360°) pour une sensi médium, ou 180° pour une sensi basse.
        </Callout>
      </Section>

      {/* KEYBINDS */}
      <Section icon={KeyboardIcon} title="Keybinds" accent={`/ ${layoutLabel(layout)}`}>
        <Keyboard>
          <KbRow>
            <Kb category="warning">1<KbTag>Pickaxe</KbTag></Kb>
            <Kb category="warning">2<KbTag>Arme 1</KbTag></Kb>
            <Kb category="warning">3<KbTag>Arme 2</KbTag></Kb>
            <Kb category="warning">4<KbTag>Arme 3</KbTag></Kb>
            <Kb category="warning">5<KbTag>Arme 4</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="primary">{k(p.wall)}<KbTag>Wall</KbTag></Kb>
            <Kb category="movement">{k("W")}<KbTag>↑</KbTag></Kb>
            <Kb category="primary">{k(p.trap)}<KbTag>Trap</KbTag></Kb>
            <Kb category="info">{k(p.reload)}<KbTag>Reload</KbTag></Kb>
            <Kb category="info">{k("T")}<KbTag>Inv</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="movement">{k("A")}<KbTag>←</KbTag></Kb>
            <Kb category="movement">{k("S")}<KbTag>↓</KbTag></Kb>
            <Kb category="movement">{k("D")}<KbTag>→</KbTag></Kb>
            <Kb category="negative">{k(p.edit)}<KbTag>Edit</KbTag></Kb>
            <Kb category="info">{k(p.use)}<KbTag>Use</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="primary">{k(p.ramp)}<KbTag>Ramp</KbTag></Kb>
            <Kb category="primary">{k(p.roof)}<KbTag>Roof</KbTag></Kb>
            <Kb category="primary">{k(p.floor)}<KbTag>Floor</KbTag></Kb>
            <Kb category="negative">{k(p.resetEdit)}<KbTag>Reset</KbTag></Kb>
            <Kb category="info">{k("B")}<KbTag>Map</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb wide>Shift<KbTag>Sprint</KbTag></Kb>
            <Kb wide>Ctrl<KbTag>Crouch</KbTag></Kb>
            <Kb xwide>Espace<KbTag>Jump</KbTag></Kb>
            <Kb wide>Tab<KbTag>Inv 2</KbTag></Kb>
          </KbRow>
          <Legend items={[
            { color: "#7c7c7c", label: "Mouvement" },
            { color: "#1ed760", label: "Building" },
            { color: "#f3727f", label: "Editing" },
            { color: "#ffa42b", label: "Armes" },
            { color: "#539df5", label: "Actions" },
          ]} />
        </Keyboard>

        <SubTitle>Liste complète des bindings</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Action</Th><Th>Touche</Th><Th>Note</Th></tr></thead>
          <tbody>
            <Tr action="Avancer / Reculer"    keys={[k("W"), k("S")]} note="" />
            <Tr action="Gauche / Droite"      keys={[k("A"), k("D")]} note="" />
            <Tr action="Sauter"               keys={["Space"]}        note="+ Mouse Wheel pour bhop" />
            <Tr action="Sprint"               keys={["L-Shift"]}      note="Ou Auto-Sprint ON" />
            <Tr action="Crouch"               keys={["L-Ctrl"]}       note="" />
            <Tr action="Pioche"               keys={["1"]}            note="" />
            <Tr action="Armes (slots)"        keys={["2","3","4","5"]} note="" />
            <Tr bold asText action="Mur (Wall)"      keys={[`${k(p.wall)} ou Mouse 4`]} note="Le bind le plus important" highlight="green" />
            <Tr action="Sol (Floor)"          keys={[k(p.floor)]} note="" />
            <Tr asText action="Rampe (Ramp/Stairs)"  keys={[`${k(p.ramp)} ou Mouse 5`]} note="" />
            <Tr action="Toit (Cone/Roof)"     keys={[k(p.roof)]} note="" />
            <Tr action="Edit"                 keys={[k(p.edit)]} note="Hold pour éditer" />
            <Tr asText action="Reset Edit"           keys={[`${k(p.resetEdit)} ou Mouse Wheel`]} note="" />
            <Tr action="Piège (Trap)"         keys={[k(p.trap)]} note="" />
            <Tr action="Reload"               keys={[k(p.reload)]} note="" />
            <Tr action="Use Item"             keys={[k(p.use)]} note="Med kit, shield, etc." />
            <Tr asText action="Inventory"            keys={[`${k(p.inventory)} ou Tab`]} note="" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* BUILDS */}
      <Section icon={Hammer} title="Building" accent="/ Le coeur du jeu">
        <Callout type="default" icon={Info} title="Règle d'or des builds">
          <strong>Tous les builds doivent être atteignables SANS lever les doigts de WASD.</strong> Si tu dois bouger la main pour un mur ou une rampe, tu perds le duel.
        </Callout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
          <BuildCard icon={Square}              name="Wall (Mur)"     keyText={`${k(p.wall)} / Mouse 4`} />
          <BuildCard icon={RectangleHorizontal} name="Floor (Sol)"    keyText={k(p.floor)} />
          <BuildCard icon={Triangle}            name="Ramp / Stairs"  keyText={`${k(p.ramp)} / Mouse 5`} />
          <BuildCard icon={Pyramid}             name="Roof / Cone"    keyText={k(p.roof)} />
        </div>

        <SubTitle>Settings building critiques</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Pourquoi</Th></tr></thead>
          <tbody>
            <Tr asText action="Turbo Building"         keys={[p.turboBuilding]}        note="Maintenir bind = spam de builds" highlight="green" />
            <Tr asText action="Reset Building Choice"  keys={[p.resetBuildingChoice]}  note="Garde le dernier build sélectionné" />
            <Tr asText action="Disable Pre-Edit Option"keys={[p.disablePreEdit]}       note="Évite les éditions involontaires" highlight="green" />
            <Tr asText action="Building Sensitivity"   keys={[p.buildingSens]}         note="Turn rapide en build battle" />
            <Tr asText action="Auto Material Change"   keys={[p.autoMaterialChange]}   note="Switch auto vers la mat dispo" highlight="green" />
            <Tr asText action="Toggle Targeting"       keys={["OFF (Hold)"]}           note="Tu contrôles le ADS" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* EDITS */}
      <Section icon={Edit3} title="Editing" accent="/ Speed = Win">
        <Callout type="success" icon={Zap} title="Confirm Edit on Release = OBLIGATOIRE">
          <strong>95% des pros l'utilisent.</strong> Au lieu de presser Edit → sélectionner → Confirmer,
          tu fais : presser Edit → sélectionner → relâcher. Réduction du temps d'édit de <strong>40-50%</strong>.
        </Callout>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Pourquoi</Th></tr></thead>
          <tbody>
            <Tr bold asText action="Confirm Edit on Release"  keys={[p.confirmEditOnRelease]} note="Cut 40-50% du temps d'edit" highlight="green" />
            <Tr asText action="Edit Mode Aim Assist"          keys={["OFF"]}                   note="Mouse uniquement" />
            <Tr asText action="Reset Edit Hold Time"          keys={["0.00"]}                  note="Reset instantané" />
            <Tr asText action="Edit Mode Sensitivity"         keys={[p.editSens]}              note="Précision augmentée" />
            <Tr asText action="Disable Pre-Edits"             keys={[p.disablePreEdit]}        note="Évite erreurs de pre-edit" highlight="green" />
            <Tr asText action="Hold to Swap Pickup"           keys={["ON"]}                    note="Pas de switch accidentel" highlight="green" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* GRAPHICS */}
      <Section icon={Monitor} title="Graphismes" accent="/ Performance Mode">
        <Callout type="default" icon={Zap} title="Mode rendu recommandé">
          <strong>Performance Mode (Alpha)</strong> est utilisé par 90%+ des pros. Pour les GPU récents (RTX 3060+), <strong>DirectX 12 + DLSS Quality</strong> est aussi viable.
        </Callout>
        <SubTitle>Display</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Effet</Th></tr></thead>
          <tbody>
            <Tr asText action="Window Mode"                keys={["Fullscreen"]}            note="Max FPS + min latence" />
            <Tr asText action="Resolution"                 keys={[p.resolution]}            note="Native ou 1750×1080 stretched" />
            <Tr asText action="Frame Rate Limit"           keys={[`${p.fpsLimit}+ FPS`]}    note="= refresh rate moniteur" highlight="green" />
            <Tr asText action="VSync"                      keys={[p.vsync]}                 note="Cause de l'input lag" highlight="negative" />
            <Tr asText action="Rendering Mode"             keys={[`${p.renderingMode} (Alpha)`]} note="OU DX12 si bon GPU" />
            <Tr asText action="NVIDIA Reflex Low Latency"  keys={[p.nvidiaReflex]}          note="-54% input lag" highlight="green" />
            <Tr asText action="DLSS (si DX12)"             keys={["Quality"]}               note="+30-50% FPS" />
          </tbody>
        </SpotifyTable>

        <SubTitle>Graphics Quality</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Pourquoi</Th></tr></thead>
          <tbody>
            <Tr asText action="3D Resolution"              keys={[p.threeDResolution]}  note="Ne JAMAIS baisser (flou)" highlight="green" />
            <Tr asText action="View Distance"              keys={[p.viewDistance]}      note="Voir les ennemis loin" highlight="green" />
            <Tr asText action="Shadows"                    keys={[p.shadows]}           note="+30-50 FPS, ennemis plus visibles" highlight="negative" />
            <Tr asText action="Anti-Aliasing"              keys={[p.antiAliasing]}      note="OFF en perf mode" />
            <Tr asText action="Textures"                   keys={[p.textures]}          note="FPS++" />
            <Tr asText action="Effects"                    keys={[p.effects]}           note="FPS++, moins de spam visuel" />
            <Tr asText action="Post Processing"            keys={[p.postProcessing]}    note="FPS++" />
            <Tr asText action="Motion Blur"                keys={[p.motionBlur]}        note="Hurts visibility" highlight="negative" />
            <Tr asText action="Show FPS"                   keys={["ON"]}                note="Monitor performance" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* AUDIO */}
      <Section icon={Volume2} title="Audio" accent="/ Sound Cues">
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Note</Th></tr></thead>
          <tbody>
            <Tr asText action="Music Volume"            keys={[p.musicVolume]}      note="Silence pour entendre les pas" />
            <Tr asText action="Sound Effects Volume"    keys={[p.sfxVolume]}        note="Pas, tirs, builds" highlight="green" />
            <Tr asText action="Voice Chat Volume"       keys={[p.voiceChatVolume]}  note="Comms équipe" />
            <Tr asText action="Dialogue Volume"         keys={["0 %"]}              note="Pas utile en compétitif" />
            <Tr asText action="Cinematic Volume"        keys={["0 %"]}              note="" />
            <Tr bold asText action="Quality"            keys={["High"]}             note="Précision spatiale" />
            <Tr bold asText action="3D Headphones"      keys={[p.threeDHeadphones]} note="HRTF — game changer" highlight="green" />
            <Tr asText action="Allow Background Audio"  keys={["OFF"]}              note="" />
            <Tr asText action="Visualize Sound Effects" keys={[p.visualizeSounds]}  note="Icônes des sons à l'écran" highlight="green" />
            <Tr asText action="Subtitles"               keys={["OFF"]}              note="" />
          </tbody>
        </SpotifyTable>
        <Callout type="success" icon={Headphones} title="3D Headphones = obligatoire">
          Active <strong>3D Headphones</strong> + <strong>Visualize Sound Effects</strong>. Tu sauras précisément d'où viennent les pas, même au-dessus/en-dessous (crucial pour les builds).
        </Callout>
      </Section>

      {/* PROS */}
      <Section icon={ChartBar} title="Pros" accent="/ Références">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProCard name="Bugha"    tag="Solo World Cup Champion" stats={[["DPI","800"],["X/Y","7.0 %"],["Targeting","55 %"],["Scope","55 %"]]} />
          <ProCard name="Mongraal" tag="Build King"              stats={[["DPI","400"],["X/Y","10 %"], ["Targeting","90 %"],["Scope","36 %"]]} />
          <ProCard name="Clix"     tag="NRG Esports Star"        stats={[["DPI","800"],["X/Y","8.5 %"],["Targeting","60 %"],["Scope","35 %"]]} />
          <ProCard name="Mero"     tag="High Sens God"           stats={[["DPI","800"],["X/Y","14 %"], ["Targeting","70 %"],["Scope","70 %"]]} />
        </div>
        <Callout type="default" icon={ChartBar} title="Plage pro Fortnite">
          Sens X/Y commune : <strong>6 % à 14 %</strong> • DPI : <strong>400 ou 800</strong> • Moyenne X-sens : ~9%
        </Callout>
      </Section>

      {/* TIPS */}
      <Section icon={Lightbulb} title="Tips" accent="/ Pour progresser">
        <Callout type="default" icon={Hammer} title="Routine build & edit (Creative)">
          Map code : <span className="font-mono text-[#1ed760]">8064-7152-2934</span> (Piece Control)<br />
          • 15 min : warm-up build/edit basics<br />
          • 15 min : 1v1 box fights<br />
          • 30 min : zone wars (rotations + endgame)
        </Callout>
        <Callout type="warn" icon={AlertTriangle} title="Ne change pas tout d'un coup">
          Si tu changes sensi + binds + graphismes en même temps, tu vas mal jouer pendant 2 semaines. Change UNE chose à la fois et joue 5+ heures avant de re-ajuster.
        </Callout>
        <Callout type="success" icon={Eye} title="Visualize Sound Effects ON">
          Active cette option dans Audio. Tu verras des icônes à l'écran indiquant la direction des bruits. Apprends à les lire = +30% de game sense.
        </Callout>
        <Callout type="info" icon={Zap} title="NVIDIA Reflex">
          Si tu as une carte NVIDIA : Reflex On + Boost réduit l'input lag jusqu'à <strong>54%</strong>. Plus rapide qu'un upgrade matériel pour la réactivité.
        </Callout>
        <Callout type="default" icon={Hand} title="Mouse buttons = avantage">
          Si tu peux te le permettre, une souris à boutons latéraux change la game. Wall sur Mouse 4 + Ramp sur Mouse 5 = build pendant tu shoot. Game changer.
        </Callout>
      </Section>

      <ConfigFooter
        title="Configuration générée pour Fortnite 2026 • Chapter 6"
        sources={[
          { label: "ProSettings.net", url: "https://prosettings.net/games/fortnite/" },
          { label: "Fortnite.gg",     url: "https://fortnite.gg/pro-settings" },
          { label: "ProSettings.com", url: "https://www.prosettings.com/game/fortnite/" },
        ]}
        disclaimer={`Les keybinds doivent être adaptés à ton style et à ta souris. La config "pro" n'est pas magique — utilise-la comme point de départ.`}
      />
      </div>

      <FabAddProfile game="fortnite" />
    </>
  );
}
