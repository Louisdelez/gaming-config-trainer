import type { CrosshairShape } from "../store/settings";

interface Props {
  shape: CrosshairShape;
  color: string;
  size?: number;
  className?: string;
  /** Drop shadow for better visibility on bright targets */
  shadow?: boolean;
}

/** Renders a crosshair as inline SVG — shape and color driven by props. */
export default function CrosshairSvg({ shape, color, size = 28, className, shadow = true }: Props) {
  const filter = shadow ? "drop-shadow(0 0 4px rgba(0,0,0,0.6))" : undefined;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
    style: { color, filter },
    "aria-hidden": true,
  } as const;

  switch (shape) {
    case "cross":
      // Lucide-like crosshair: circle + 4 short outer ticks
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6"  y1="12" x2="2"  y2="12" />
          <line x1="12" y1="6"  x2="12" y2="2"  />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
      );
    case "plus":
      // Simple thick plus (no circle)
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="2"  x2="12" y2="22" />
          <line x1="2"  y1="12" x2="22" y2="12" />
        </svg>
      );
    case "dot":
      // Solid small dot
      return (
        <svg {...common} fill="currentColor">
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "circle":
      // Outlined circle
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case "dot-circle":
      // Outlined circle with center dot
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      // X (diagonal lines)
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4"  y1="4"  x2="20" y2="20" />
          <line x1="20" y1="4"  x2="4"  y2="20" />
        </svg>
      );
    case "gap-dot":
      // Tactical: dot + 4 short ticks with center gap
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <line x1="12" y1="2"  x2="12" y2="7"  />
          <line x1="12" y1="17" x2="12" y2="22" />
          <line x1="2"  y1="12" x2="7"  y2="12" />
          <line x1="17" y1="12" x2="22" y2="12" />
        </svg>
      );
  }
}
