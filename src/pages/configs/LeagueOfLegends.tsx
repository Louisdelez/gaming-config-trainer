import { useState } from "react";
import {
  Keyboard as KeyboardIcon, Monitor, Zap, Target, Mouse, Gauge, Move, XCircle, ZapOff,
  Lightbulb, Crosshair, AlertTriangle, CheckCircle, TrendingUp, Info, Volume2, Map,
  RotateCw, User, Maximize, Eye, MapPin, Crown, Repeat, Ban,
} from "lucide-react";
import { mapKey, layoutLabel } from "../../lib/keyboard";
import { useActiveProfile, type LolProfile } from "../../store/profiles";
import {
  ConfigHeader, Section, SubTitle, CardsGrid, SpotifyCard, SpotifyTable, Th, Tr,
  Callout, SmartCard, ProCard, Keyboard, KbRow, Kb, KbTag, Legend, ConfigFooter,
} from "../../components/config/SpotifyConfig";
import lolIcon from "../../assets/games/lol.png";
import ProfileBar from "../../components/config/ProfileBar";
import ProfileEditor from "../../components/config/ProfileEditor";
import FabAddProfile from "../../components/config/FabAddProfile";

export default function LeagueOfLegends() {
  const p = useActiveProfile("lol") as LolProfile;
  const [editing, setEditing] = useState(false);
  const layout = p.keyboardLayout;
  const k = (key: string) => mapKey(key, layout);

  return (
    <>
      <ProfileBar game="lol" onEdit={() => setEditing(true)} />
      {editing && <ProfileEditor profile={p} onClose={() => setEditing(false)} />}

      <div data-config-export="lol">
        <ConfigHeader
          image={lolIcon}
          title="League of Legends"
          subtitle={`${p.name}${p.isDefault ? " • Lecture seule" : " • Profil personnel"}`}
          badges={[
            { icon: KeyboardIcon, label: "Clavier :",     value: layoutLabel(layout) },
            { icon: Monitor,      label: "Résolution :",  value: p.resolution },
            { icon: Zap,          label: "Smart Cast :",  value: p.smartCastOn },
            { icon: Target,       label: "Attack Move :", value: p.attackMove },
          ]}
        />

      {/* MOUSE */}
      <Section icon={Mouse} title="Souris" accent="/ Hardware">
        <CardsGrid>
          <SpotifyCard icon={Gauge}    label="DPI"                value={p.dpi}              note="LoL = jeu top-down, DPI plus haut qu'en FPS" />
          <SpotifyCard icon={Move}     label="Game Mouse Speed"   value={p.gameMouseSpeed}   note="Curseur in-game (échelle 1-10)" />
          <SpotifyCard icon={XCircle}  label="Mouse Acceleration" value={p.mouseAcceleration} note="Windows + in-game" accent="negative" />
          <SpotifyCard icon={ZapOff}   label="Wait for V-Sync"    value={p.vsync}            note="+10-30ms input lag éliminé" accent="negative" />
        </CardsGrid>
      </Section>

      {/* KEYBINDS */}
      <Section icon={KeyboardIcon} title="Keybinds" accent={`/ Standard Pro — ${layoutLabel(layout)}`}>
        <Keyboard>
          <KbRow>
            <Kb category="warning">1<KbTag>Item 1</KbTag></Kb>
            <Kb category="warning">2<KbTag>Item 2</KbTag></Kb>
            <Kb category="warning">3<KbTag>Item 3</KbTag></Kb>
            <Kb category="warning">4<KbTag>Ward</KbTag></Kb>
            <Kb category="warning">5<KbTag>Item 4</KbTag></Kb>
            <Kb category="warning">6<KbTag>Item 5</KbTag></Kb>
            <Kb category="warning">7<KbTag>Item 6</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="primary">{k(p.spell1)}<KbTag>Spell 1</KbTag></Kb>
            <Kb category="primary">{k(p.spell2)}<KbTag>Spell 2</KbTag></Kb>
            <Kb category="primary">{k(p.spell3)}<KbTag>Spell 3</KbTag></Kb>
            <Kb category="primary">{k(p.ultimate)}<KbTag>Ult</KbTag></Kb>
            <Kb category="info">{k("T")}<KbTag>Ping</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="primary">{k(p.attackMove)}<KbTag>A-Move</KbTag></Kb>
            <Kb category="movement">{k(p.stop)}<KbTag>Stop</KbTag></Kb>
            <Kb category="info">{k(p.summoner1)}<KbTag>Summ 1</KbTag></Kb>
            <Kb category="info">{k(p.summoner2)}<KbTag>Summ 2</KbTag></Kb>
            <Kb category="info">{k("G")}<KbTag>Ping</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb category="negative">{k("Y")}<KbTag>Lock Cam</KbTag></Kb>
            <Kb category="primary">{k(p.attackMoveInstant)}<KbTag>A-Move</KbTag></Kb>
            <Kb category="negative">{k("C")}<KbTag>Stats</KbTag></Kb>
            <Kb category="info">{k("V")}<KbTag>Trinket</KbTag></Kb>
            <Kb category="info">{k(p.recall)}<KbTag>Recall</KbTag></Kb>
          </KbRow>
          <KbRow>
            <Kb wide>Tab<KbTag>Score</KbTag></Kb>
            <Kb wide>Esc<KbTag>Menu</KbTag></Kb>
            <Kb xwide>Espace<KbTag>Camera Snap</KbTag></Kb>
            <Kb wide>O / N<KbTag>Score</KbTag></Kb>
          </KbRow>
          <Legend items={[
            { color: "#7c7c7c", label: "Mouvement" },
            { color: "#1ed760", label: "Sorts / A-Move" },
            { color: "#539df5", label: "Summ / Actions" },
            { color: "#ffa42b", label: "Items" },
            { color: "#f3727f", label: "Caméra / HUD" },
          ]} />
        </Keyboard>

        <SubTitle>Bindings critiques (à vérifier)</SubTitle>
        <SpotifyTable>
          <thead><tr><Th>Action</Th><Th>Touche</Th><Th>Note</Th></tr></thead>
          <tbody>
            <Tr action="Cast Spell 1 (Q)"  keys={[k(p.spell1)]} note="Smart cast par défaut" />
            <Tr action="Cast Spell 2 (W)"  keys={[k(p.spell2)]} note="" />
            <Tr action="Cast Spell 3 (E)"  keys={[k(p.spell3)]} note="" />
            <Tr action="Cast Ult (R)"      keys={[k(p.ultimate)]} note="" />
            <Tr action="Summoner 1"        keys={[k(p.summoner1)]} note="Flash 99% du temps" />
            <Tr action="Summoner 2"        keys={[k(p.summoner2)]} note="" />
            <Tr bold action="Attack Move (cursor)"  keys={[k(p.attackMove)]} note="Kiting → impératif" highlight="green" />
            <Tr action="Stop Attack"        keys={[k(p.stop)]} note="Cancel auto-attack" />
            <Tr action="Hold Position"      keys={[k(p.holdPosition)]} note="" />
            <Tr action="Buy Menu (Shop)"    keys={[k(p.shop)]} note="" />
            <Tr action="Recall (Back)"      keys={[k(p.recall)]} note="" />
            <Tr action="Trinket / Ward"     keys={["4"]}    note="" />
            <Tr action="Self Cast (Heal sur toi)" keys={["Alt", `${k(p.spell1)}/${k(p.spell2)}/${k(p.spell3)}/${k(p.ultimate)}`]} note="Sona/Soraka W" />
            <Tr action="Level Up Spell"     keys={["Ctrl", `${k(p.spell1)}/${k(p.spell2)}/${k(p.spell3)}/${k(p.ultimate)}`]} note="" />
            <Tr action="Show Range Indicator" keys={["Shift", `${k(p.spell1)}/${k(p.spell2)}/${k(p.spell3)}/${k(p.ultimate)}`]} note="Smart cast avec indicateur" />
            <Tr action="Camera Snap (Center)" keys={["Space"]} note="Hold = follow champion" />
            <Tr action="Camera Lock Toggle" keys={["Y"]} note="Pas recommandé pro" />
            <Tr action="Champion Only Target" keys={["`"]} note="Backtick — anti-misclick" />
            <Tr asText action="Allied Champion Select" keys={["F1 - F5"]} note="F1 = toi, F2-F5 = teammates" />
            <Tr action="Ping Wheel"         keys={["T"]} note="Hold + drag" />
            <Tr action="Cursor Ping"        keys={["G"]} note="" />
            <Tr action="Danger Ping"        keys={["Ctrl", "Click"]} note="" />
            <Tr action="Score / Tab"        keys={["Tab"]} note="Hold" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* SMART CAST */}
      <Section icon={Zap} title="Smart Cast" accent="/ Le must absolu">
        <Callout type="default" icon={Info} title="Pourquoi Smart Cast = obligatoire">
          Sans smart cast, tu fais 2 clics par sort : presser la touche + cliquer la cible.
          <strong> Avec smart cast, tu fais 1 clic → -50 à 100ms par sort.</strong>
          En 1 teamfight tu castes 8-12 sorts → tu gagnes ~1 seconde de latence cumulée. Game changer.
        </Callout>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
          <SmartCard icon={Zap}        name="Cast Normal"    combo={[k(p.spell1)]}                desc="Sort lancé instantanément au curseur (recommandé)" />
          <SmartCard icon={Zap}        name="Avec Indicateur" combo={["Shift", "+", k(p.spell1)]} desc="Affiche range/skillshot avant de lancer (à la release)" />
          <SmartCard icon={Zap}        name="Self Cast"      combo={["Alt", "+", k(p.spell1)]}    desc="Cast sur TOI (heal Sona, Janna W, etc.)" />
          <SmartCard icon={TrendingUp} name="Level Up"       combo={["Ctrl", "+", k(p.spell1)]}   desc="Upgrade le sort sans cliquer dans le HUD" />
        </div>

        <Callout type="success" icon={CheckCircle} title="Réglages critiques Smart Cast">
          <strong>SmartCastOnKeyRelease = {p.smartCastOnRelease}</strong> → sort cast quand tu RELÂCHES (permet de cancel en lâchant ailleurs)<br />
          <strong>SmartCastWithIndicator_CastWhenNewSpellSelected = 0</strong> → évite les misclicks
        </Callout>
      </Section>

      {/* ATTACK MOVE */}
      <Section icon={Target} title="Attack Move" accent="/ Kiting parfait">
        <Callout type="default" icon={Crosshair} title="Le combo qui change tout">
          <strong>Attack Move on Cursor</strong> = ton champion attaque la cible la plus proche du CURSEUR (pas de ton champion).
          Tu peux kiter en cliquant DEVANT toi pendant que tu recules. Sans ça, tu rates les last-hits et tu cliques mal pendant les fights.
        </Callout>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Effet</Th></tr></thead>
          <tbody>
            <Tr asText action="EnableTargetedAttackMove"    keys={["1 (ON)"]}                  note="Attack Move sur la cible la plus proche du curseur" highlight="green" />
            <Tr asText action="Attack Move Click"           keys={[`${k(p.attackMove)} + clic`]} note="Tu cliques où attaquer" />
            <Tr asText action="Attack Move (Instant)"       keys={[k(p.attackMoveInstant)]}    note="Attaque la cible sous le curseur direct" />
            <Tr asText action="Champion Only Target"        keys={["` (backtick)"]}            note="Anti-misclick — focus champions only" />
            <Tr asText action="TargetChampionsOnlyAsToggle" keys={["0 (Hold)"]}                note="Hold ` pendant le fight" />
          </tbody>
        </SpotifyTable>
        <Callout type="warn" icon={AlertTriangle} title="Erreur de débutant à éviter">
          Si tu cliques-droit sur les minions/champions, tu perds tes auto-attacks pendant les fights (cible meurt → tu cours).
          <strong> Utilise {k(p.attackMove)} + clic ou {k(p.attackMoveInstant)} SYSTÉMATIQUEMENT</strong> pour le farm et les trades.
        </Callout>
      </Section>

      {/* GRAPHICS */}
      <Section icon={Monitor} title="Graphismes" accent="/ Max FPS">
        <Callout type="default" icon={Zap} title="Règle des pros LoL">
          <strong>Tous les pros LCK/LEC/LCS jouent en LOW.</strong> Les graphismes haut-de-gamme augmentent l'input lag et obscurcissent l'écran de teamfights. Plus c'est clair, mieux tu vois.
        </Callout>
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur</Th><Th>Pourquoi</Th></tr></thead>
          <tbody>
            <Tr asText action="Resolution"            keys={[p.resolution]}              note="Native du moniteur" />
            <Tr asText action="Window Mode"           keys={[p.windowMode]}              note="Fullscreen = +FPS, Borderless = Alt-Tab rapide" />
            <Tr asText action="Frame Rate Cap"        keys={[p.frameRateCap]}            note="240 FPS si écran 240Hz / FrameCapType=2" highlight="green" />
            <Tr bold asText action="Wait for V-Sync"  keys={[p.vsync]}                   note="VSync = input lag MASSIF" highlight="negative" />
            <Tr asText action="Character Quality"     keys={[p.characterQuality]}        note="Garder visibilité champions" />
            <Tr asText action="Environment Quality"   keys={[p.environmentQuality]}      note="+FPS" />
            <Tr asText action="Shadow Quality"        keys={[p.shadowQuality]}           note="+FPS, meilleure clarté" />
            <Tr asText action="Effects Quality"       keys={[p.effectsQuality]}          note="Moins de spam visuel teamfight" />
            <Tr asText action="Anti-Aliasing (FXAA)"  keys={[p.antiAliasing]}            note="+FPS, image plus claire" />
            <Tr asText action="Hide Eye Candy"        keys={["Off (au choix)"]}          note="Off = garde les skins" />
            <Tr asText action="Show Godrays"          keys={["On (optionnel)"]}          note="Joli mais bouffe FPS" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* HUD */}
      <Section icon={Map} title="HUD & Minimap" accent="/ Information">
        <CardsGrid>
          <SpotifyCard icon={Map}       label="Minimap Scale"          value={p.minimapScale}      note="Grosse minimap = + d'info" />
          <SpotifyCard icon={RotateCw}  label="Flip Minimap"           value="OFF"                 note="Standard pro (sauf habitude)" />
          <SpotifyCard icon={Eye}       label="Show Turret Range"      value={p.showTurretRange}   note="Tower dives safe" accent="green" />
          <SpotifyCard icon={Crosshair} label="Show Attack Radius"     value={p.showAttackRadius}  note="Voir ta portée d'AA" accent="green" />
          <SpotifyCard icon={MapPin}    label="Show Neutral Camps"     value="ON"                  note="Timer dragons/herald/baron" accent="green" />
          <SpotifyCard icon={Info}      label="Numeric Cooldowns"      value={p.numericCooldowns}  note="Chiffres sur les CD" accent="green" />
          <SpotifyCard icon={User}      label="Camera Lock"            value={p.cameraLock}        note="Camera unlocked = ESSENTIEL" accent="negative" />
          <SpotifyCard icon={Maximize}  label="Minimize Camera Motion" value="ON"                  note="Réduit le shake en teamfight" accent="green" />
        </CardsGrid>
        <Callout type="warn" icon={AlertTriangle} title="Camera Unlocked = obligatoire">
          <strong>0% des pros jouent camera locked.</strong> Avec la caméra libre tu vois plus d'info, tu controles tes positions, tu mets de meilleurs skillshots. Utilise <strong>Space</strong> pour recenter rapidement.
        </Callout>
      </Section>

      {/* AUDIO */}
      <Section icon={Volume2} title="Audio" accent="/ Pings & Sounds">
        <SpotifyTable>
          <thead><tr><Th>Paramètre</Th><Th>Valeur pro</Th><Th>Note</Th></tr></thead>
          <tbody>
            <Tr asText action="Master Volume"         keys={[p.masterVolume]} note="Confort perso" />
            <Tr asText action="Music Volume"          keys={[p.musicVolume]}  note="OFF — gêne la concentration" />
            <Tr asText action="SFX Volume"            keys={[p.sfxVolume]}    note="Important : auto-attacks, sorts" highlight="green" />
            <Tr asText action="Voice (Chat) Volume"   keys={[p.voiceVolume]}  note="Si tu utilises le voice in-game" />
            <Tr asText action="Pings Volume"          keys={[p.pingsVolume]}  note="Réactivité aux pings team" highlight="green" />
            <Tr asText action="Announcer"             keys={[p.announcer]}    note='"Baron has been slain" — critique' />
            <Tr asText action="Ambience"              keys={["30–50 %"]}      note="Bruits map (jungle, river)" />
            <Tr asText action="Theme Music"           keys={["OFF"]}          note="Pas de musique champion select" />
          </tbody>
        </SpotifyTable>
      </Section>

      {/* PROS */}
      <Section icon={Crown} title="Pros" accent="/ Références">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProCard icon="crown" name="Faker"  tag="T1 • The GOAT • Mid"  stats={[["Spells","Q/W/E/R"],["Summ","D / F"],["Cast","Smart"],   ["Cam Lock","OFF"]]} />
          <ProCard icon="crown" name="Caps"   tag="G2 Esports • EU Mid"  stats={[["Spells","Q/W/E/R"],["Summ","D / F"],["Quick Cast","ON"],["A-Move","ON"]]} />
          <ProCard icon="crown" name="Chovy"  tag="Gen.G • LCK Mid"      stats={[["Spells","Q/W/E/R"],["Summ","D / F"],["Self Cast","Alt"],["Range Ind.","Shift"]]} />
          <ProCard icon="crown" name="Knight" tag="TES • LPL Mid"        stats={[["Spells","Q/W/E/R"],["Summ","D / F"],["Items","1-7"],   ["Cam Lock","OFF"]]} />
        </div>
        <Callout type="default" icon={Info} title="La vérité sur les keybinds pros">
          <strong>99% des pros utilisent les keybinds par défaut.</strong> Q/W/E/R, D/F, 1-7, A pour attack move. Ce qui fait la différence : Smart Cast ON, Camera Unlocked, Attack Move enabled. Le reste = préférence.
        </Callout>
      </Section>

      {/* TIPS */}
      <Section icon={Lightbulb} title="Tips" accent="/ Pour progresser">
        <Callout type="default" icon={Zap} title="Trinity du LoL competitif">
          Si tu ne fais QUE ces 3 changements aujourd'hui :<br />
          <strong>1.</strong> Smart Cast ON sur Q/W/E/R<br />
          <strong>2.</strong> Attack Move on Cursor (touche {k(p.attackMove)})<br />
          <strong>3.</strong> Camera Unlocked + Space pour recenter
        </Callout>
        <Callout type="info" icon={Repeat} title="Routine warm-up (10 min avant ranked)">
          • 3 min : Practice Tool — last-hit 100 minions avec A-click<br />
          • 3 min : Practice Tool — combos full sur dummy<br />
          • 4 min : ARAM bot pour micro-warm-up de teamfights
        </Callout>
        <Callout type="success" icon={Eye} title="Use la minimap (toutes les 2 sec)">
          Les bronze regardent la minimap ~5 fois/min. Les pros ~30+ fois/min. Force-toi à jeter un œil pendant que tu farmes, recall, walk. Ça devient instinctif après 1-2 semaines.
        </Callout>
        <Callout type="warn" icon={Ban} title="Erreurs config qui ruinent la game">
          ❌ <strong>VSync ON</strong> → input lag énorme<br />
          ❌ <strong>Camera Locked</strong> → tu ne vois pas ton entourage<br />
          ❌ <strong>Sans Attack Move</strong> → kiting impossible<br />
          ❌ <strong>Sans Smart Cast</strong> → 50-100ms perdues par sort
        </Callout>
        <Callout type="default" icon={Target} title="Champion Only Target = ` (backtick)">
          Pendant un teamfight, hold <strong>`</strong> (la touche au-dessus de Tab) pour ne cliquer QUE sur les champions. Plus jamais d'auto-attack sur un minion en plein dive.
        </Callout>
      </Section>

      <ConfigFooter
        title="Configuration générée pour League of Legends • Saison 2026"
        sources={[
          { label: "ProSettings.com", url: "https://www.prosettings.com/game/leagueoflegends/" },
          { label: "LoL Wiki",        url: "https://wiki.leagueoflegends.com/" },
          { label: "Dot Esports",     url: "https://dotesports.com/league-of-legends" },
        ]}
        disclaimer="Les keybinds doivent être adaptés à ton style. La config pro est un point de départ, pas une recette magique."
      />
      </div>

      <FabAddProfile game="lol" />
    </>
  );
}
