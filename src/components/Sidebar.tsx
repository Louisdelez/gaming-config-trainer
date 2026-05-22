import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home, Settings, BarChart3, Crosshair,
  Timer, Grid3X3, Move, Zap, MousePointer2, Crosshair as CrosshairIcon,
  ChevronsLeftRight, Palette, Brain, ScanSearch,
  Gauge, MousePointerClick, Monitor, Wifi,
} from "lucide-react";
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
