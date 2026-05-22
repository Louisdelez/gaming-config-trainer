import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Crosshair, Timer, Grid3X3, Move, Zap,
  MousePointer2, ChevronsLeftRight, Palette, Brain, ScanSearch,
  Gauge, MousePointerClick, Monitor, ChevronRight, Wifi,
} from "lucide-react";
import valorantIcon from "../assets/games/valorant.png";
import fortniteIcon from "../assets/games/fortnite.svg";
import lolIcon from "../assets/games/lol.png";

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      {/* Hero */}
      <section className="mb-10">
        <h1 className="spotify-title text-5xl md:text-6xl mb-3">{t("home.welcome")}</h1>
        <p className="text-[#b3b3b3] text-base max-w-2xl">{t("home.intro")}</p>
      </section>

      {/* Big categories */}
      <h2 className="spotify-title text-2xl mb-4">{t("home.quickAccess")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <BigCard to="/configs/valorant" icon={Crosshair} title={t("home.configsCard.title")} desc={t("home.configsCard.desc")} />
        <BigCard to="/games/reaction" icon={Timer} title={t("home.gamesCard.title")} desc={t("home.gamesCard.desc")} />
        <BigCard to="/hardware/polling" icon={Gauge} title={t("home.hardwareCard.title")} desc={t("home.hardwareCard.desc")} />
      </div>

      {/* Configs */}
      <SectionTitle>{t("nav.configs")}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <GameCard to="/configs/valorant" img={valorantIcon} label={t("nav.valorant")} />
        <GameCard to="/configs/fortnite" img={fortniteIcon} label={t("nav.fortnite")} />
        <GameCard to="/configs/lol" img={lolIcon} label={t("nav.lol")} />
      </div>

      {/* Games */}
      <SectionTitle>{t("nav.games")}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <ListCard to="/games/reaction" icon={Timer} label={t("nav.reaction")} />
        <ListCard to="/games/gridshot" icon={Grid3X3} label={t("nav.gridshot")} />
        <ListCard to="/games/tracking" icon={Move} label={t("nav.tracking")} />
        <ListCard to="/games/flickshot" icon={Zap} label={t("nav.flickshot")} />
        <ListCard to="/games/cps" icon={MousePointer2} label={t("nav.cps")} />
        <ListCard to="/games/microshots" icon={Crosshair} label={t("nav.microshots")} />
        <ListCard to="/games/strafe" icon={ChevronsLeftRight} label={t("nav.strafe")} />
        <ListCard to="/games/stroop" icon={Palette} label={t("nav.stroop")} />
        <ListCard to="/games/sequence" icon={Brain} label={t("nav.sequence")} />
        <ListCard to="/games/visualmatch" icon={ScanSearch} label={t("nav.visualmatch")} />
      </div>

      {/* Hardware */}
      <SectionTitle>{t("nav.hardware")}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ListCard to="/hardware/polling" icon={Gauge} label={t("nav.polling")} />
        <ListCard to="/hardware/clicklatency" icon={MousePointerClick} label={t("nav.clicklatency")} />
        <ListCard to="/hardware/monitorhz" icon={Monitor} label={t("nav.monitorhz")} />
        <ListCard to="/hardware/network" icon={Wifi} label={t("nav.network")} />
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="spotify-title text-xl mb-4 mt-2">{children}</h2>;
}

function BigCard({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="spotify-card group block relative overflow-hidden">
      <div className="w-12 h-12 rounded-full bg-[#1ed760] flex items-center justify-center mb-4 shadow-spotify-sm">
        <Icon className="w-6 h-6 text-black" strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-[#b3b3b3]">{desc}</p>
      <ChevronRight className="absolute top-5 right-5 w-5 h-5 text-[#b3b3b3] opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function ListCard({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="spotify-card flex items-center gap-3 group">
      <div className="w-10 h-10 rounded bg-[#1f1f1f] flex items-center justify-center group-hover:bg-[#1ed760] transition-colors">
        <Icon className="w-5 h-5 text-white group-hover:text-black transition-colors" strokeWidth={2.2} />
      </div>
      <span className="text-sm font-bold text-white">{label}</span>
    </Link>
  );
}

function GameCard({ to, img, label }: { to: string; img: string; label: string }) {
  return (
    <Link to={to} className="spotify-card flex items-center gap-3 group">
      <div className="w-12 h-12 rounded bg-[#0f0f0f] flex items-center justify-center p-2 shrink-0">
        <img src={img} alt="" className="w-full h-full object-contain" />
      </div>
      <span className="text-sm font-bold text-white">{label}</span>
    </Link>
  );
}
