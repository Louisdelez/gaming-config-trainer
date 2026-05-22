import { useState } from "react";
import {
  Crosshair, Keyboard as KeyboardIcon, Monitor, MousePointer2, Target, Mouse, Gauge, Activity,
  XCircle, CheckCircle, AlertTriangle, Lightbulb, Move, ZoomIn, Scan, Hand,
  ToggleRight, Star, CircleDot, Plus, Volume2, Headphones, Map,
  RotateCw, User, Maximize, ZoomOut, Eye, MapPin, Repeat, CircleCheck,
  ChartBar, Clipboard,
} from "lucide-react";
import { mapKey, layoutLabel } from "../../lib/keyboard";
import { useActiveProfile, type ValorantProfile } from "../../store/profiles";
import {
  ConfigHeader, Section, SubTitle, CardsGrid, SpotifyCard, SpotifyTable, Th, Tr,
  Callout, CrosshairCard, ProCard, Keyboard, KbRow, Kb, KbTag, Legend, ConfigFooter,
} from "../../components/config/SpotifyConfig";
import valorantIcon from "../../assets/games/valorant.png";
import ProfileBar from "../../components/config/ProfileBar";
import ProfileEditor from "../../components/config/ProfileEditor";
import FabAddProfile from "../../components/config/FabAddProfile";

export default function Valorant() {
  const p = useActiveProfile("valorant") as ValorantProfile;
  const [editing, setEditing] = useState(false);

  // Use the profile's own keyboard layout
  const layout = p.keyboardLayout;
  const k = (key: string) => mapKey(key, layout);

  return (
    <>
      <ProfileBar game="valorant" onEdit={() => setEditing(true)} />
      {editing && <ProfileEditor profile={p} onClose={() => setEditing(false)} />}

      <div data-config-export="valorant">
        <ConfigHeader
          image={valorantIcon}
          title="Valorant Config"
          subtitle={`${p.name}${p.isDefault ? " • Lecture seule" : " • Profil personnel"}`}
          badges={[
            { icon: KeyboardIcon, label: "Clavier :",     value: layoutLabel(layout) },
            { icon: Monitor,      label: "Résolution :",  value: p.resolution },
            { icon: MousePointer2,label: "eDPI cible :",  value: edpi(p.dpi, p.sensitivity) },
            { icon: Target,       label: "Crosshair :",   value: p.crosshairColor },
          ]}
        />

      {/* SOURIS */}
      <Section icon={Mouse} title="Souris" accent="/ Hardware">
        <CardsGrid>
          <SpotifyCard icon={Gauge}        label="DPI"                 value={p.dpi}              note="Standard pro (à régler dans le logiciel souris)" />
          <SpotifyCard icon={Activity}     label="Polling Rate"        value={p.pollingRate}      note="Mises à jour fréquentes des inputs" />
          <SpotifyCard icon={XCircle}      label="Mouse Acceleration"  value={p.mouseAcceleration} note="Détruit la mémoire musculaire" accent={p.mouseAcceleration === "OFF" ? "negative" : "warning"} />
          <SpotifyCard icon={CheckCircle}  label="Raw Input Buffer"    value={p.rawInputBuffer}   note="Stabilise les entrées" accent="green" />
        </CardsGrid>
        <Callout type="warn" icon={AlertTriangle} title="À configurer hors-jeu">
          Le DPI et polling rate ne se règlent PAS dans Valorant. Utilise Logitech G HUB, Razer Synapse, SteelSeries GG, etc.
        </Callout>
      </Section>

      {/* SENSIBILITÉ */}
      <Section icon={Target} title="Sensibilité" accent="/ Aim">
        <CardsGrid>
          <SpotifyCard icon={Move}        label="In-Game Sensitivity"  value={p.sensitivity}      note={`eDPI = ${p.dpi} × ${p.sensitivity} = ${edpi(p.dpi, p.sensitivity)}`} />
          <SpotifyCard icon={ZoomIn}      label="ADS Multiplier"       value={p.adsMultiplier}    note="Cohérence avec hipfire" />
          <SpotifyCard icon={Scan}        label="Scoped Multiplier"    value={p.scopedMultiplier} note="Mémoire musculaire transférable" />
          <SpotifyCard icon={Hand}        label="Aim Down Sights"      value={p.adsMode}          note="Permet de dézoomer plus vite" accent="green" />
          <SpotifyCard icon={Crosshair}   label="Sniper Rifle Aim"     value={p.sniperMode}       note="Idem pour Operator/Marshall" accent="green" />
          <SpotifyCard icon={ToggleRight} label="Separate Zoom Sens"   value={p.separateZoomSens} note="Permet de configurer scope sens" accent="green" />
        </CardsGrid>
        <Callout type="info" icon={Lightbulb} title="Test 180°">
          Sur le practice range : place ta souris à gauche du tapis, fais un mouvement jusqu'à droite.
          Tu dois faire EXACTEMENT 180°. Ajuste la sensi par paliers de 0.02 si besoin.
        </Callout>
      </Section>

      {/* KEYBINDS */}
      <Section icon={KeyboardIcon} title="Keybinds" accent={`/ ${layoutLabel(layout)}`}>
        <Keyboard>
          <KbRow>
            <Kb category="warning">1<KbTag>Primary</KbTag></Kb>
            <Kb category="warning">2<KbTag>Pistol</KbTag></Kb>
            <Kb category="warning">3<KbTag>Knife</KbTag></Kb>
            <Kb category="warning">4<KbTag>Spike</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="primary">{k(p.ability2)}<KbTag>Cap 2</KbTag></Kb>
            <Kb category="movement">{k("W")}<KbTag>↑</KbTag></Kb>
            <Kb category="primary">{k(p.ability3)}<KbTag>Cap 3</KbTag></Kb>
            <Kb category="info">{k(p.reload)}<KbTag>Reload</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="movement">{k("A")}<KbTag>←</KbTag></Kb>
            <Kb category="movement">{k("S")}<KbTag>↓</KbTag></Kb>
            <Kb category="movement">{k("D")}<KbTag>→</KbTag></Kb>
            <Kb category="info">{k(p.useObject)}<KbTag>Use</KbTag></Kb>
            <Kb category="info">{k(p.drop)}<KbTag>Drop</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="info">{k(p.ping)}<KbTag>Ping</KbTag></Kb>
            <Kb category="primary">{k(p.ultimate)}<KbTag>Ult</KbTag></Kb>
            <Kb category="primary">{k(p.ability1)}<KbTag>Cap 1</KbTag></Kb>
            <Kb category="info">{k(p.voiceTeam)}<KbTag>Voice</KbTag></Kb>
            <Kb category="info">{k(p.buyMenu)}<KbTag>Buy</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb wide>Shift<KbTag>Walk</KbTag></Kb>
            <Kb wide>Ctrl<KbTag>Crouch</KbTag></Kb>
            <Kb xwide>Espace<KbTag>Jump</KbTag></Kb>
            <Kb wide>Tab<KbTag>Map</KbTag></Kb>
          </KbRow>
          <Legend items={[
            { color: "#7c7c7c", label: "Mouvement" },
            { color: "#1ed760", label: "Capacités" },
            { color: "#ffa42b", label: "Armes" },
            { color: "#539df5", label: "Actions" },
          ]} />
        </Keyboard>

        <SubTitle>Liste complète des bindings</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Action</Th><Th>Touche</Th><Th>Note</Th></tr></thead>
          <tbody>
            <Tr action="Arme principale"     keys={["1"]} note="Fusil/SMG/Shotgun" />
            <Tr action="Arme secondaire"     keys={["2"]} note="Pistolet" />
            <Tr action="Couteau"             keys={["3"]} note="Switch rapide Operator" />
            <Tr action="Spike"               keys={["4"]} note="Plant/Defuse" />
            <Tr action="Capacité 1"          keys={[k(p.ability1)]} note="Slot signature" />
            <Tr action="Capacité 2"          keys={[k(p.ability2)]} note="Slot basic" />
            <Tr action="Capacité 3 (grenade)"keys={[k(p.ability3)]} note="Slot signature/basic" />
            <Tr action="Ultimate"            keys={[k(p.ultimate)]} note="Sur boutons souris si dispo" />
            <Tr action="Avancer"             keys={[k("W")]} note="" />
            <Tr action="Reculer"             keys={[k("S")]} note="" />
            <Tr action="Gauche / Droite"     keys={[k("A"), k("D")]} note="" />
            <Tr action="Sauter"              keys={["Space"]} note="+ Mouse Wheel Down pour bhop" />
            <Tr action="Crouch"              keys={["L-Ctrl"]} note="" />
            <Tr action="Walk (silencieux)"   keys={["L-Shift"]} note="" />
            <Tr action="Use Object"          keys={[k(p.useObject)]} note="Spike/Ult/Switches" />
            <Tr action="Reload"              keys={[k(p.reload)]} note="" />
            <Tr action="Drop arme"           keys={[k(p.drop)]} note="" />
            <Tr action="Inspect arme"        keys={[k(p.inspect)]} note="" />
            <Tr action="Ping (wheel)"        keys={[k(p.ping)]} note="" />
            <Tr action="Map toggle"          keys={["Tab"]} note="" />
            <Tr action="Megamap"             keys={[k(p.megamap)]} note="" />
            <Tr action="Buy Menu"            keys={[k(p.buyMenu)]} note="" />
            <Tr action="Voice Team (PTT)"    keys={[k(p.voiceTeam)]} note="" />
            <Tr action="Voice Party (PTT)"   keys={[k(p.voiceParty)]} note="" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* CROSSHAIR */}
      <Section icon={Crosshair} title="Crosshair" accent="/ Codes">
        <Callout type="info" icon={Clipboard} title="Comment importer">
          Settings → Crosshair → Primary → <strong>Import Profile Code</strong> → colle le code → Import
        </Callout>
        <CrosshairCard
          name={`${p.name} — Style actif`}
          icon={Star}
          stats={`${p.crosshairColor} • Code du profil actuel`}
          code={p.crosshairCode}
        />
        <CrosshairCard
          name="TenZ Style (Recommandé)"
          icon={Star}
          stats="Cyan • Inner Lines 4/2/2 • No outlines • No center dot • Movement/Firing error OFF"
          code="0;s;1;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0"
        />
        <CrosshairCard
          name="Demon1 (Dot Only)"
          icon={CircleDot}
          stats="Cyan • Center dot uniquement • Pas de lignes"
          code="0;P;c;5;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0"
        />
        <CrosshairCard
          name="Aspas (Tracking)"
          icon={Plus}
          stats="Cyan • Lignes plus larges, gap 0 • Idéal pour tracking"
          code="0;P;c;5;h;0;0l;4;0o;0;0a;1;0f;0;1b;0"
        />

        <SubTitle>Paramètres détaillés (style TenZ — référence)</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th></tr></thead>
          <tbody>
            <Tr asText action="Color"                            keys={["Cyan (#00FFFF)"]} />
            <Tr asText action="Outlines"                         keys={["OFF"]} />
            <Tr asText action="Center Dot"                       keys={["OFF"]} />
            <Tr asText action="Inner Lines — Show"               keys={["ON"]}  highlight="green" />
            <Tr asText action="Inner Lines — Opacity"            keys={["1.0"]} />
            <Tr asText action="Inner Lines — Length"             keys={["4"]} />
            <Tr asText action="Inner Lines — Thickness"          keys={["2"]} />
            <Tr asText action="Inner Lines — Offset"             keys={["2"]} />
            <Tr asText action="Movement Error"                   keys={["OFF"]} />
            <Tr asText action="Firing Error"                     keys={["OFF"]} />
            <Tr asText action="Outer Lines"                      keys={["OFF"]} />
            <Tr asText action="Override Firing Error Offset"     keys={["ON"]} highlight="green" />
            <Tr asText action="Override All Primary Crosshairs"  keys={["ON"]} highlight="green" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* GRAPHISMES */}
      <Section icon={Monitor} title="Graphismes" accent="/ Max FPS">
        <SubTitle>General Video</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Effet</Th></tr></thead>
          <tbody>
            <Tr asText action="Display Mode"               keys={[p.displayMode]}    note="Max FPS + min latence" />
            <Tr asText action="Resolution"                 keys={[p.resolution]}    note="Native moniteur" />
            <Tr asText action="Aspect Ratio Method"        keys={["Fill"]}          note="" />
            <Tr asText action="Frame Rate Limit"           keys={[p.frameRateLimit]} note="0 = pas de limite" />
            <Tr asText action="Limit FPS in Menus"         keys={["ON (60)"]}       note="Évite chauffe inutile" />
            <Tr asText action="Limit FPS in Background"    keys={["ON (30)"]}       note="" />
            <Tr asText action="NVIDIA Reflex Low Latency"  keys={[p.nvidiaReflex]}  note="Réduit input lag" highlight="green" />
            <Tr asText action="VSync"                      keys={[p.vsync]}         note="Cause de l'input lag" highlight="negative" />
          </tbody>
        </SpotifyTable>

        <SubTitle>Graphics Quality</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Pourquoi</Th></tr></thead>
          <tbody>
            <Tr asText action="Material Quality"          keys={[p.materialQuality]} note="FPS++" />
            <Tr asText action="Texture Quality"           keys={[p.textureQuality]}  note="FPS++" />
            <Tr asText action="Detail Quality"            keys={[p.detailQuality]}   note="FPS++" />
            <Tr asText action="UI Quality"                keys={["Low"]}             note="" />
            <Tr asText action="Vignette"                  keys={["OFF"]}             note="Meilleure visibilité bords" />
            <Tr asText action="Anti-Aliasing"             keys={[p.antiAliasing]}    note="Lignes propres sans coût" />
            <Tr asText action="Anisotropic Filtering"     keys={["2x"]}              note="" />
            <Tr asText action="Improve Clarity"           keys={["OFF"]}             note="Préférence personnelle" />
            <Tr asText action="Experimental Sharpening"   keys={["OFF"]}             note="" />
            <Tr asText action="Bloom"                     keys={[p.bloom]}           note="Moins de halo lumineux" />
            <Tr asText action="Distortion"                keys={[p.distortion]}      note="Évite ondulations skills" />
            <Tr asText action="Cast Shadows"              keys={[p.castShadows]}     note="FPS++ massif" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* AUDIO */}
      <Section icon={Volume2} title="Audio" accent="/ HRTF">
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Note</Th></tr></thead>
          <tbody>
            <Tr asText action="Master Volume"           keys={[p.masterVolume]}    note="Base de référence" />
            <Tr asText action="Music Volume"            keys={[p.musicVolume]}     note="Silence, on entend mieux" />
            <Tr asText action="In Agent Select"         keys={["20"]}              note="" />
            <Tr asText action="Round Start/End"         keys={["30"]}              note="" />
            <Tr asText action="SFX Volume (effets)"     keys={[p.sfxVolume]}       note="Pour les pas/tirs" highlight="green" />
            <Tr asText action="Voice-Over Lines"        keys={["30"]}              note="" />
            <Tr asText action="Ambient Volume"          keys={["30"]}              note="" />
            <Tr asText action="Voice Chat Volume"       keys={[p.voiceChatVolume]} note="Pour bien entendre l'équipe" />
            <Tr bold asText action="HRTF (audio 3D)"    keys={[p.hrtf]}            note="Localisation précise des sons" highlight="green" />
            <Tr asText action="Mute Music in Background"keys={["ON"]}              note="" />
          </tbody>
        </SpotifyTable>
        <Callout type="success" icon={Headphones} title="HRTF = game changer">
          Active toujours HRTF. Tu entendras précisément si l'ennemi est devant/derrière/au-dessus/en-dessous. Indispensable au casque.
        </Callout>
      </Section>

      {/* MINIMAP */}
      <Section icon={Map} title="Minimap" accent="/ HUD">
        <CardsGrid>
          <SpotifyCard icon={RotateCw} label="Rotate"               value={p.minimapRotate}    note="Suit la rotation du joueur" />
          <SpotifyCard icon={User}     label="Keep Player Centered" value={p.minimapCentered}  note="Tu restes au milieu" accent="green" />
          <SpotifyCard icon={Maximize} label="Minimap Size"         value={p.minimapSize}      note="Légèrement agrandie" />
          <SpotifyCard icon={ZoomOut}  label="Minimap Zoom"         value={p.minimapZoom}      note="Vue plus large" />
          <SpotifyCard icon={Eye}      label="Vision Cones"         value={p.visionCones}      note="Voir où ton équipe regarde" accent="green" />
          <SpotifyCard icon={MapPin}   label="Show Region Names"    value="Always"             note="Callouts toujours visibles" />
        </CardsGrid>
      </Section>

      {/* PROS — informational, not editable */}
      <Section icon={Star} title="Pros" accent="/ Références">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProCard name="TenZ"     stats={[["DPI","800"], ["Sens","0.40"],  ["eDPI","320"], ["Scope","1.0"]]} />
          <ProCard name="Aspas"    stats={[["DPI","800"], ["Sens","0.40"],  ["eDPI","320"], ["Scope","1.0"]]} />
          <ProCard name="Demon1"   stats={[["DPI","800"], ["Sens","0.245"], ["eDPI","196"], ["Scope","1.0"]]} />
          <ProCard name="f0rsakeN" stats={[["DPI","1600"],["Sens","0.18"],  ["eDPI","288"], ["Scope","1.0"]]} />
        </div>
        <Callout type="default" icon={ChartBar} title="Plage pro">
          eDPI commun chez les pros : <strong>196 à 384</strong> • Moyenne : ~267 • Sweet spot débutant : <strong>240-320</strong>
        </Callout>
      </Section>

      {/* TIPS */}
      <Section icon={Lightbulb} title="Tips" accent="/ Pour progresser">
        <Callout type="default" icon={Target} title="Test 180°">
          Sur le practice range : place ta souris à gauche de ton tapis, glisse jusqu'à la droite. Tu dois faire exactement 180°. Si plus → baisse, si moins → monte.
        </Callout>
        <Callout type="info" icon={Repeat} title="Routine d'aim quotidienne (15 min)">
          • 5 min : Aim Lab / Kovaak (gridshot, flick)<br />
          • 5 min : Practice range Valorant — bots faciles, distance courte<br />
          • 5 min : Deathmatch (focus crosshair placement, pas le kill)
        </Callout>
        <Callout type="warn" icon={AlertTriangle} title="Reste stable">
          Ne change PAS ta sensi tous les jours. La mémoire musculaire prend 2-3 semaines à se construire. Choisis une sensi, tiens-toi-y.
        </Callout>
        <Callout type="success" icon={CircleCheck} title="Pré-aim toujours">
          Garde ton crosshair à hauteur de tête, sur les angles potentiels. 90% des duels se gagnent avant de voir l'ennemi.
        </Callout>
        <Callout type="default" icon={Headphones} title="Sound > Vision">
          Toujours écouter avant de bouger. Walk (Shift) systématique sauf si tu rotates loin. Les bruits de pas sont l'info #1.
        </Callout>
      </Section>

      <ConfigFooter
        title="Configuration générée pour Valorant 2026"
        sources={[
          { label: "ProSettings.net", url: "https://prosettings.net/guides/valorant-options/" },
          { label: "Mobalytics",      url: "https://www.mobalytics.gg/valorant" },
          { label: "Team Liquid",     url: "https://www.teamliquid.com/articles/valorant-settings" },
        ]}
        disclaimer={`Les keybinds et préférences personnelles doivent être adaptés à ton style. La config "pro" n'est pas magique — utilise-la comme point de départ.`}
      />
      </div>

      <FabAddProfile game="valorant" />
    </>
  );
}

function edpi(dpi: string, sens: string): string {
  const d = parseFloat(dpi.replace(/[^\d.]/g, "")) || 0;
  const s = parseFloat(sens.replace(/[^\d.]/g, "")) || 0;
  const n = Math.round(d * s);
  return n > 0 ? String(n) : "—";
}
