import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "./store/settings";
import { useProfiles } from "./store/profiles";
import { useScores } from "./store/scores";
import { migrateFromLocalStorage } from "./lib/db";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Valorant from "./pages/configs/Valorant";
import Fortnite from "./pages/configs/Fortnite";
import LeagueOfLegends from "./pages/configs/LeagueOfLegends";
import ReactionTime from "./pages/games/ReactionTime";
import Gridshot from "./pages/games/Gridshot";
import Tracking from "./pages/games/Tracking";
import Flickshot from "./pages/games/Flickshot";
import CPS from "./pages/games/CPS";
import Microshots from "./pages/games/Microshots";
import StrafeTargets from "./pages/games/StrafeTargets";
import Stroop from "./pages/games/Stroop";
import SequenceMemory from "./pages/games/SequenceMemory";
import VisualMatch from "./pages/games/VisualMatch";
import PollingRate from "./pages/hardware/PollingRate";
import ClickLatency from "./pages/hardware/ClickLatency";
import MonitorHz from "./pages/hardware/MonitorHz";
import NetworkTest from "./pages/hardware/Network";
import Capture from "./pages/Capture";
import Library from "./pages/Library";
import Music from "./pages/Music";
import Info from "./pages/Info";
import Scores from "./pages/Scores";
import { usePlayer } from "./store/player";
import { startAudioEngine } from "./lib/audioEngine";
import { exists } from "@tauri-apps/plugin-fs";

/** Pre-load the 3 test MP3s on first boot (only if they exist on disk) */
const TEST_TRACKS = [
  "C:\\Users\\loicd\\Downloads\\Chuis trop fort (I'm cracked, I'm cracke.mp3",
  "C:\\Users\\loicd\\Downloads\\I'm alive, nah I ain't dead.mp3",
  "C:\\Users\\loicd\\Downloads\\Un jour, j’serai MVP.mp3",
];

async function loadTestTracksOnFirstRun() {
  const flag = "gct-music-test-loaded";
  if (localStorage.getItem(flag) === "true") return;
  const player = usePlayer.getState();
  let added = 0;
  for (const p of TEST_TRACKS) {
    try {
      const has = await exists(p).catch(() => false);
      if (!has) continue;
      await player.addTrackFromPath(p);
      added++;
    } catch (e) {
      console.error("[App] failed to add test track:", p, e);
    }
  }
  localStorage.setItem(flag, "true");
  console.log(`[App] pre-loaded ${added} test tracks`);
}

function App() {
  const { i18n } = useTranslation();
  const language = useSettings((s) => s.language);
  const hydrateSettings = useSettings((s) => s.hydrate);
  const hydrateProfiles = useProfiles((s) => s.hydrate);
  const hydrateScores = useScores((s) => s.hydrate);
  const hydratePlayer = usePlayer((s) => s.hydrate);

  // Boot: migrate localStorage → SQLite (one-time) then hydrate all stores
  useEffect(() => {
    (async () => {
      try {
        await migrateFromLocalStorage();
      } catch (e) {
        console.error("[App] migration failed:", e);
      }
      await Promise.all([
        hydrateSettings(),
        hydrateProfiles(),
        hydrateScores(),
        hydratePlayer(),
      ]);
      // Pre-load test tracks once player store is hydrated
      await loadTestTracksOnFirstRun();
      // Start the audio engine (singleton subscriber)
      startAudioEngine();
    })();
  }, [hydrateSettings, hydrateProfiles, hydrateScores, hydratePlayer]);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/configs/valorant" element={<Valorant />} />
        <Route path="/configs/fortnite" element={<Fortnite />} />
        <Route path="/configs/lol" element={<LeagueOfLegends />} />
        <Route path="/games/reaction" element={<ReactionTime />} />
        <Route path="/games/gridshot" element={<Gridshot />} />
        <Route path="/games/tracking" element={<Tracking />} />
        <Route path="/games/flickshot" element={<Flickshot />} />
        <Route path="/games/cps" element={<CPS />} />
        <Route path="/games/microshots" element={<Microshots />} />
        <Route path="/games/strafe" element={<StrafeTargets />} />
        <Route path="/games/stroop" element={<Stroop />} />
        <Route path="/games/sequence" element={<SequenceMemory />} />
        <Route path="/games/visualmatch" element={<VisualMatch />} />
        <Route path="/hardware/polling" element={<PollingRate />} />
        <Route path="/hardware/clicklatency" element={<ClickLatency />} />
        <Route path="/hardware/monitorhz" element={<MonitorHz />} />
        <Route path="/hardware/network" element={<NetworkTest />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/library" element={<Library />} />
        <Route path="/music" element={<Music />} />
        <Route path="/info/:slug" element={<Info />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
