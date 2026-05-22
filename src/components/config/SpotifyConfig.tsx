import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Copy, Check, Trophy, Crown } from "lucide-react";

/* ============================================================
   SPOTIFY CONFIG — shared component library
   Strict adherence to Spotify DESIGN.md:
   - #121212 / #181818 / #1f1f1f surfaces
   - Spotify Green #1ed760 = functional only
   - Pill buttons (9999px), uppercase + letter-spacing 1.4px
   - White / #b3b3b3 silver typography
   - No decorative gradients
   ============================================================ */

/* ---------- HEADER ---------- */
interface ConfigHeaderProps {
  /** Lucide icon — used if `image` is not provided */
  icon?: LucideIcon;
  /** Image URL (e.g., imported asset) — takes precedence over icon */
  image?: string;
  title: string;
  subtitle?: string;
  badges?: { icon: LucideIcon; label: string; value: string }[];
}
export function ConfigHeader({ icon: Icon, image, title, subtitle, badges }: ConfigHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-5 mb-3">
        {image ? (
          <div
            className="w-20 h-20 rounded-2xl bg-[#181818] flex items-center justify-center shrink-0 p-3"
            style={{ boxShadow: "rgba(0, 0, 0, 0.5) 0px 8px 24px" }}
          >
            <img src={image} alt="" className="w-full h-full object-contain" />
          </div>
        ) : Icon ? (
          <div
            className="w-16 h-16 rounded-full bg-[#1ed760] flex items-center justify-center shrink-0"
            style={{ boxShadow: "rgba(0, 0, 0, 0.5) 0px 8px 24px" }}
          >
            <Icon className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
        ) : null}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-[#b3b3b3] text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {badges.map((b, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-[#1f1f1f] text-white"
              style={{ letterSpacing: "0.02em" }}
            >
              <b.icon className="w-3.5 h-3.5 text-[#1ed760]" />
              <span className="text-[#b3b3b3]">{b.label}</span>
              <strong className="text-white font-bold">{b.value}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- SECTION ---------- */
interface SectionProps {
  icon: LucideIcon;
  title: string;
  accent?: string;
  children: ReactNode;
}
export function Section({ icon: Icon, title, accent, children }: SectionProps) {
  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.06]">
        <Icon className="w-6 h-6 text-[#1ed760]" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {title}
          {accent && <span className="text-[#b3b3b3] font-normal ml-2 text-base">{accent}</span>}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function SubTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-[11px] uppercase font-bold text-[#b3b3b3] mt-6 mb-3"
      style={{ letterSpacing: "1.4px" }}
    >
      {children}
    </h3>
  );
}

/* ---------- CARDS ---------- */
export function CardsGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

interface SpotifyCardProps {
  icon?: LucideIcon;
  label: string;
  value: string;
  note?: string;
  /** "green" highlights value in Spotify Green */
  accent?: "white" | "green" | "warning" | "negative";
}
export function SpotifyCard({ icon: Icon, label, value, note, accent = "white" }: SpotifyCardProps) {
  const colors: Record<string, string> = {
    white: "text-white",
    green: "text-[#1ed760]",
    warning: "text-[#ffa42b]",
    negative: "text-[#f3727f]",
  };
  return (
    <div className="bg-[#181818] hover:bg-[#252525] transition-colors rounded-lg p-5">
      <div
        className="text-[11px] uppercase font-bold text-[#b3b3b3] mb-2 flex items-center gap-1.5"
        style={{ letterSpacing: "1.4px" }}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className={`text-3xl font-extrabold font-mono ${colors[accent]}`}>{value}</div>
      {note && <div className="text-xs text-[#b3b3b3] mt-2">{note}</div>}
    </div>
  );
}

/* ---------- TABLE ---------- */
export function SpotifyTable({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#181818] rounded-lg overflow-hidden">
      <table className="w-full">{children}</table>
    </div>
  );
}
export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      className="text-left px-5 py-3 text-[11px] uppercase font-bold text-[#b3b3b3] bg-[#1f1f1f] border-b border-white/[0.06]"
      style={{ letterSpacing: "1.4px" }}
    >
      {children}
    </th>
  );
}
interface RowProps {
  action: string;
  keys: string[];
  /** When true, keys are rendered as plain text (e.g., values like "Low", "ON") */
  asText?: boolean;
  note?: string;
  /** Highlight first cell strong */
  bold?: boolean;
  /** Highlight value (text) color */
  highlight?: "green" | "negative" | "warning";
}
export function Tr({ action, keys, asText, note, bold, highlight }: RowProps) {
  const highlightColors: Record<string, string> = {
    green: "text-[#1ed760]",
    negative: "text-[#f3727f]",
    warning: "text-[#ffa42b]",
  };
  return (
    <tr className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
      <td className={`px-5 py-3 text-sm ${bold ? "font-bold text-white" : "text-white"}`}>{action}</td>
      <td className="px-5 py-3">
        {asText ? (
          <span className={`font-mono font-bold text-sm ${highlight ? highlightColors[highlight] : "text-white"}`}>
            {keys.join(" / ")}
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {keys.map((kk, i) => (
              <Kbd key={i}>{kk}</Kbd>
            ))}
          </div>
        )}
      </td>
      {note !== undefined && <td className="px-5 py-3 text-xs text-[#b3b3b3]">{note}</td>}
    </tr>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded text-[11px] font-mono font-bold text-white bg-[#1f1f1f] border border-[#4d4d4d]"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
    >
      {children}
    </kbd>
  );
}

/* ---------- CALLOUTS ---------- */
interface CalloutProps {
  type?: "default" | "info" | "warn" | "success" | "negative";
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}
export function Callout({ type = "default", icon: Icon, title, children }: CalloutProps) {
  const map: Record<string, { border: string; text: string }> = {
    default: { border: "#1ed760", text: "text-[#1ed760]" },
    info: { border: "#539df5", text: "text-[#539df5]" },
    warn: { border: "#ffa42b", text: "text-[#ffa42b]" },
    success: { border: "#1ed760", text: "text-[#1ed760]" },
    negative: { border: "#f3727f", text: "text-[#f3727f]" },
  };
  const c = map[type];
  return (
    <div
      className="px-5 py-4 my-4 rounded-r bg-[#181818]"
      style={{ borderLeft: `4px solid ${c.border}` }}
    >
      <div
        className={`flex items-center gap-2 mb-2 text-[11px] uppercase font-bold ${c.text}`}
        style={{ letterSpacing: "1.4px" }}
      >
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <div className="text-sm text-white leading-relaxed">{children}</div>
    </div>
  );
}

/* ---------- CROSSHAIR CODE CARD ---------- */
interface CrosshairCardProps {
  name: string;
  icon: LucideIcon;
  stats: string;
  code: string;
}
export function CrosshairCard({ name, icon: Icon, stats, code }: CrosshairCardProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="bg-[#181818] rounded-lg p-5 mb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-[#1ed760]" />
        <span
          className="text-sm font-bold text-white uppercase"
          style={{ letterSpacing: "0.05em" }}
        >
          {name}
        </span>
      </div>
      <div className="text-xs text-[#b3b3b3] mb-3">{stats}</div>
      <div className="flex items-center gap-3 bg-[#121212] rounded-md p-3">
        <code className="flex-1 font-mono text-xs text-white select-all break-all">{code}</code>
        <button
          onClick={copy}
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-[11px] uppercase transition-all ${
            copied
              ? "bg-white text-black"
              : "bg-[#1ed760] text-black hover:scale-105"
          }`}
          style={{ letterSpacing: "1.4px" }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
    </div>
  );
}

/* ---------- PRO CARD ---------- */
interface ProCardProps {
  name: string;
  tag?: string;
  stats: [string, string][];
  /** Icon variant (Crown for LoL, Trophy for others) */
  icon?: "trophy" | "crown";
}
export function ProCard({ name, tag, stats, icon = "trophy" }: ProCardProps) {
  const Icon = icon === "crown" ? Crown : Trophy;
  return (
    <div className="bg-[#181818] hover:bg-[#252525] transition-colors rounded-lg p-4 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1ed760] flex items-center justify-center">
        <Icon className="w-6 h-6 text-black" strokeWidth={2.5} />
      </div>
      <div className="text-base font-extrabold uppercase text-white" style={{ letterSpacing: "0.03em" }}>
        {name}
      </div>
      {tag && (
        <div className="text-[10px] uppercase tracking-[1.4px] font-bold text-[#b3b3b3] mb-3 mt-0.5">{tag}</div>
      )}
      <div className={`${tag ? "" : "mt-3"} space-y-1`}>
        {stats.map(([l, v], i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-[#b3b3b3]">{l}</span>
            <span className="font-mono font-bold text-white">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- BUILD CARD (Fortnite) ---------- */
interface BuildCardProps {
  icon: LucideIcon;
  name: string;
  keyText: string;
}
export function BuildCard({ icon: Icon, name, keyText }: BuildCardProps) {
  return (
    <div className="bg-[#181818] hover:bg-[#252525] transition-colors rounded-lg p-4 text-center">
      <Icon className="w-9 h-9 mx-auto mb-2 text-[#1ed760]" strokeWidth={2} />
      <div
        className="text-[11px] uppercase font-bold text-white mb-2"
        style={{ letterSpacing: "1.4px" }}
      >
        {name}
      </div>
      <Kbd>{keyText}</Kbd>
    </div>
  );
}

/* ---------- SMART CAST CARD (LoL) ---------- */
interface SmartCardProps {
  icon: LucideIcon;
  name: string;
  combo: string[];
  desc: string;
}
export function SmartCard({ icon: Icon, name, combo, desc }: SmartCardProps) {
  return (
    <div className="bg-[#181818] hover:bg-[#252525] transition-colors rounded-lg p-4 text-center">
      <div
        className="flex items-center justify-center gap-1.5 mb-3 text-[11px] uppercase font-bold text-[#1ed760]"
        style={{ letterSpacing: "1.4px" }}
      >
        <Icon className="w-4 h-4" /> {name}
      </div>
      <div className="flex justify-center gap-1.5 items-center my-3">
        {combo.map((part, i) =>
          part === "+" ? (
            <span key={i} className="text-[#b3b3b3] font-bold">+</span>
          ) : (
            <Kbd key={i}>{part}</Kbd>
          )
        )}
      </div>
      <div className="text-xs text-[#b3b3b3] mt-2">{desc}</div>
    </div>
  );
}

/* ---------- KEYBOARD VISUAL ---------- */
export function Keyboard({ children }: { children: ReactNode }) {
  return <div className="bg-[#181818] rounded-lg p-5">{children}</div>;
}

export function KbRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-1.5 justify-center mb-1.5">{children}</div>;
}

/** Spotify-aligned key colors using only the semantic palette */
export type KbCategory =
  | "default"
  | "movement"
  | "primary"   // Spotify green (active/important)
  | "warning"   // Orange (items/builds)
  | "negative"  // Red (edit/destructive)
  | "info";     // Blue (special/camera)

interface KbProps {
  children: ReactNode;
  category?: KbCategory;
  wide?: boolean;
  xwide?: boolean;
}
export function Kb({ children, category = "default", wide, xwide }: KbProps) {
  const styles: Record<KbCategory, { bg: string; border: string; color: string }> = {
    default:  { bg: "#1f1f1f", border: "#4d4d4d",            color: "#ffffff" },
    movement: { bg: "#1f1f1f", border: "#7c7c7c",            color: "#ffffff" },
    primary:  { bg: "rgba(30, 215, 96, 0.15)", border: "#1ed760", color: "#1ed760" },
    warning:  { bg: "rgba(255, 164, 43, 0.15)", border: "#ffa42b", color: "#ffa42b" },
    negative: { bg: "rgba(243, 114, 127, 0.15)", border: "#f3727f", color: "#f3727f" },
    info:     { bg: "rgba(83, 157, 245, 0.15)", border: "#539df5", color: "#539df5" },
  };
  const s = styles[category];
  return (
    <div
      className="relative font-mono font-bold flex flex-col items-center justify-center rounded text-sm"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        minWidth: xwide ? 280 : wide ? 88 : 44,
        height: 44,
        padding: 2,
      }}
    >
      {children}
    </div>
  );
}

export function KbTag({ children }: { children: ReactNode }) {
  return (
    <span className="absolute bottom-0 text-[0.55rem] font-normal opacity-70 normal-case">
      {children}
    </span>
  );
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-5 pt-4 flex justify-center gap-4 flex-wrap border-t border-white/[0.04]">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#b3b3b3]">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

/* ---------- FOOTER ---------- */
interface FooterProps {
  title: string;
  sources: { label: string; url: string }[];
  disclaimer?: string;
}
export function ConfigFooter({ title, sources, disclaimer }: FooterProps) {
  return (
    <footer className="mt-16 px-6 py-8 rounded-lg bg-[#181818] text-center text-sm">
      <p className="text-white font-bold">{title}</p>
      <p className="mt-2 text-[#b3b3b3]">
        Sources :{" "}
        {sources.map((s, i) => (
          <span key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-[#1ed760] hover:underline"
            >
              {s.label}
            </a>
            {i < sources.length - 1 && " • "}
          </span>
        ))}
      </p>
      {disclaimer && <p className="mt-4 text-xs text-[#b3b3b3] opacity-70">{disclaimer}</p>}
    </footer>
  );
}
