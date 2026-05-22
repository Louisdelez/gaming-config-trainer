import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home, Settings, BarChart3, Crosshair,
  Timer, Grid3X3, Move, Zap, MousePointer2, Crosshair as CrosshairIcon,
  ChevronsLeftRight, Palette, Brain, ScanSearch,
  Gauge, MousePointerClick, Monitor, Wifi, ExternalLink,
} from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

const REPO_URL = "https://github.com/Louisdelez/gaming-config-trainer";

/** Inline GitHub mark (Octicons-style) — lucide v1.16 doesn't expose Github */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.79-.25.79-.55v-2.02c-3.19.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.25.72-1.54-2.54-.29-5.21-1.27-5.21-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.39-2.68 5.36-5.23 5.64.41.35.78 1.05.78 2.12v3.14c0 .31.21.66.79.55 4.57-1.52 7.86-5.83 7.86-10.91C23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}
import valorantIcon from "../assets/games/valorant.png";
import fortniteIcon from "../assets/games/fortnite.svg";
import lolIcon from "../assets/games/lol.png";

function GameImg({ src }: { src: string }) {
  return <img src={src} alt="" className="w-5 h-5 object-contain" />;
}

const baseLink = "flex items-center gap-3 px-3 py-2 rounded text-sm transition-all";
const navItem = (active: boolean) =>
  `${baseLink} ${
    active
      ? "text-white font-bold bg-white/[0.07]"
      : "text-[#b3b3b3] font-normal hover:text-white"
  }`;

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-black flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center">
            <Crosshair className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <div className="font-bold text-base text-white tracking-tight">{t("app.title")}</div>
        </div>
      </div>

      {/* Main container */}
      <div className="mx-2 mb-2 bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
        <nav className="px-2 py-4 overflow-y-auto flex-1">
          <NavLink to="/" className={({ isActive }) => navItem(isActive)} end>
            <Home className="w-5 h-5" strokeWidth={2.5} /> {t("nav.home")}
          </NavLink>

          <SectionLabel>{t("nav.configs")}</SectionLabel>
          <NavLink to="/configs/valorant" className={({ isActive }) => navItem(isActive)}>
            <GameImg src={valorantIcon} /> {t("nav.valorant")}
          </NavLink>
          <NavLink to="/configs/fortnite" className={({ isActive }) => navItem(isActive)}>
            <GameImg src={fortniteIcon} /> {t("nav.fortnite")}
          </NavLink>
          <NavLink to="/configs/lol" className={({ isActive }) => navItem(isActive)}>
            <GameImg src={lolIcon} /> {t("nav.lol")}
          </NavLink>

          <SectionLabel>{t("nav.games")}</SectionLabel>
          <NavLink to="/games/reaction" className={({ isActive }) => navItem(isActive)}>
            <Timer className="w-5 h-5" /> {t("nav.reaction")}
          </NavLink>
          <NavLink to="/games/gridshot" className={({ isActive }) => navItem(isActive)}>
            <Grid3X3 className="w-5 h-5" /> {t("nav.gridshot")}
          </NavLink>
          <NavLink to="/games/tracking" className={({ isActive }) => navItem(isActive)}>
            <Move className="w-5 h-5" /> {t("nav.tracking")}
          </NavLink>
          <NavLink to="/games/flickshot" className={({ isActive }) => navItem(isActive)}>
            <Zap className="w-5 h-5" /> {t("nav.flickshot")}
          </NavLink>
          <NavLink to="/games/cps" className={({ isActive }) => navItem(isActive)}>
            <MousePointer2 className="w-5 h-5" /> {t("nav.cps")}
          </NavLink>
          <NavLink to="/games/microshots" className={({ isActive }) => navItem(isActive)}>
            <CrosshairIcon className="w-5 h-5" /> {t("nav.microshots")}
          </NavLink>
          <NavLink to="/games/strafe" className={({ isActive }) => navItem(isActive)}>
            <ChevronsLeftRight className="w-5 h-5" /> {t("nav.strafe")}
          </NavLink>
          <NavLink to="/games/stroop" className={({ isActive }) => navItem(isActive)}>
            <Palette className="w-5 h-5" /> {t("nav.stroop")}
          </NavLink>
          <NavLink to="/games/sequence" className={({ isActive }) => navItem(isActive)}>
            <Brain className="w-5 h-5" /> {t("nav.sequence")}
          </NavLink>
          <NavLink to="/games/visualmatch" className={({ isActive }) => navItem(isActive)}>
            <ScanSearch className="w-5 h-5" /> {t("nav.visualmatch")}
          </NavLink>

          <SectionLabel>{t("nav.hardware")}</SectionLabel>
          <NavLink to="/hardware/polling" className={({ isActive }) => navItem(isActive)}>
            <Gauge className="w-5 h-5" /> {t("nav.polling")}
          </NavLink>
          <NavLink to="/hardware/clicklatency" className={({ isActive }) => navItem(isActive)}>
            <MousePointerClick className="w-5 h-5" /> {t("nav.clicklatency")}
          </NavLink>
          <NavLink to="/hardware/monitorhz" className={({ isActive }) => navItem(isActive)}>
            <Monitor className="w-5 h-5" /> {t("nav.monitorhz")}
          </NavLink>
          <NavLink to="/hardware/network" className={({ isActive }) => navItem(isActive)}>
            <Wifi className="w-5 h-5" /> {t("nav.network")}
          </NavLink>
        </nav>

        <div className="px-2 py-3 border-t border-white/[0.06]">
          <NavLink to="/scores" className={({ isActive }) => navItem(isActive)}>
            <BarChart3 className="w-5 h-5" /> {t("nav.scores")}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => navItem(isActive)}>
            <Settings className="w-5 h-5" /> {t("nav.settings")}
          </NavLink>
          <button
            type="button"
            onClick={() => { openUrl(REPO_URL).catch((e) => console.error(e)); }}
            title="Voir le projet sur GitHub"
            className={`${baseLink} text-[#b3b3b3] font-normal hover:text-white hover:bg-white/[0.04] w-full text-left`}
          >
            <GithubIcon className="w-5 h-5" />
            <span className="flex-1">GitHub</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="spotify-section-label mt-5 mb-1 px-3">{children}</div>
  );
}
