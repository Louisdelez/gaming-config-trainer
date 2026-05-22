import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState,
  type CSSProperties, type ReactNode,
} from "react";
import { Crosshair, MousePointer } from "lucide-react";
import { useSettings } from "../store/settings";

/* ============================================================
   AimZone — FPS-style canvas with Pointer Lock + virtual cursor

   - When `active` becomes true, user must click once on the
     overlay to engage pointer lock (browser security requirement).
   - While locked, the OS cursor is hidden, a custom crosshair is
     drawn, and mouse movement is scaled by the global aim
     sensitivity from the settings store.
   - Press ESC to exit pointer lock at any time.
   - Click events emit through onShoot(x, y) at the VIRTUAL cursor
     coordinates (relative to the canvas).
   - Optional onMove / onMouseDown / onMouseUp for tracking-style
     games.

   Children are rendered INSIDE the canvas (no click handlers) so
   the hit-test stays in the parent component using virtual coords.
   ============================================================ */

export interface AimZoneHandle {
  /** Programmatically exit pointer lock */
  exitLock: () => void;
  /** Current virtual cursor position */
  getCursor: () => { x: number; y: number };
}

export interface AimZoneProps {
  className?: string;
  style?: CSSProperties;
  /** Game is running and pointer lock can be requested */
  active: boolean;
  /** Show the "click to engage" overlay when active but not locked */
  engageHint?: string;
  /** Color of the crosshair */
  crosshairColor?: string;
  /** Show a small dot at center (target indicator)? */
  showCenterDot?: boolean;
  /** Called on click at virtual position */
  onShoot?: (x: number, y: number) => void;
  /** Called continuously while moving */
  onMove?: (x: number, y: number) => void;
  /** Called on mousedown */
  onMouseDown?: (x: number, y: number) => void;
  /** Called on mouseup */
  onMouseUp?: (x: number, y: number) => void;
  /** Notify parent when lock state changes */
  onLockChange?: (locked: boolean) => void;
  children?: ReactNode;
}

const AimZone = forwardRef<AimZoneHandle, AimZoneProps>(function AimZone(
  {
    className,
    style,
    active,
    engageHint = "Cliquez pour activer le viseur",
    crosshairColor = "#1ed760",
    showCenterDot = false,
    onShoot,
    onMove,
    onMouseDown,
    onMouseUp,
    onLockChange,
    children,
  },
  ref
) {
  const sensitivity = useSettings((s) => s.aimSensitivity);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);
  const cursorRef = useRef({ x: 0, y: 0 });
  const sensRef = useRef(sensitivity);
  // Keep latest sens in ref so the mousemove handler uses live value
  useEffect(() => { sensRef.current = sensitivity; }, [sensitivity]);

  // Force re-render at most every frame to update crosshair visual
  const [, forceRender] = useState(0);
  const rafScheduled = useRef(false);
  const scheduleRender = useCallback(() => {
    if (rafScheduled.current) return;
    rafScheduled.current = true;
    requestAnimationFrame(() => {
      rafScheduled.current = false;
      forceRender((n) => (n + 1) & 0xffff);
    });
  }, []);

  // Center the virtual cursor at canvas center initially
  const centerCursor = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    cursorRef.current = { x: rect.width / 2, y: rect.height / 2 };
    scheduleRender();
  }, [scheduleRender]);

  // Pointer lock change listener (global)
  useEffect(() => {
    const onChange = () => {
      const isLocked = document.pointerLockElement === canvasRef.current;
      setLocked(isLocked);
      onLockChange?.(isLocked);
      if (isLocked) centerCursor();
    };
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, [centerCursor, onLockChange]);

  // Auto-release lock when game becomes inactive
  useEffect(() => {
    if (!active && document.pointerLockElement === canvasRef.current) {
      document.exitPointerLock();
    }
  }, [active]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (document.pointerLockElement === canvasRef.current) {
        document.exitPointerLock();
      }
    };
  }, []);

  // Mouse movement → update virtual cursor (only while locked)
  useEffect(() => {
    if (!locked) return;
    const handler = (e: MouseEvent) => {
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const c = cursorRef.current;
      const s = sensRef.current;
      c.x = Math.max(0, Math.min(rect.width,  c.x + e.movementX * s));
      c.y = Math.max(0, Math.min(rect.height, c.y + e.movementY * s));
      scheduleRender();
      onMove?.(c.x, c.y);
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, [locked, onMove, scheduleRender]);

  // Click handler (only fires while locked)
  useEffect(() => {
    if (!locked) return;
    const down = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const c = cursorRef.current;
      onMouseDown?.(c.x, c.y);
    };
    const up = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const c = cursorRef.current;
      onMouseUp?.(c.x, c.y);
      onShoot?.(c.x, c.y);
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
    };
  }, [locked, onShoot, onMouseDown, onMouseUp]);

  // Click on engage overlay → request lock
  const engage = () => {
    if (!canvasRef.current) return;
    try {
      const res = canvasRef.current.requestPointerLock({ unadjustedMovement: true } as any);
      // Some browsers return a Promise, others void
      if (res && typeof (res as Promise<void>).catch === "function") {
        (res as Promise<void>).catch(() => {
          // fallback without unadjustedMovement
          canvasRef.current?.requestPointerLock();
        });
      }
    } catch {
      canvasRef.current?.requestPointerLock();
    }
  };

  useImperativeHandle(ref, () => ({
    exitLock: () => {
      if (document.pointerLockElement === canvasRef.current) {
        document.exitPointerLock();
      }
    },
    getCursor: () => ({ ...cursorRef.current }),
  }), []);

  const cur = cursorRef.current;

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden select-none ${className ?? ""}`}
      style={{ ...style, cursor: locked ? "none" : (active ? "crosshair" : "default") }}
    >
      {/* User children (targets visualization) */}
      {children}

      {/* Center dot (reference) */}
      {showCenterDot && locked && (
        <div
          className="absolute pointer-events-none w-1 h-1 rounded-full"
          style={{
            background: crosshairColor,
            opacity: 0.4,
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Virtual crosshair (drawn while locked) */}
      {locked && (
        <Crosshair
          className="absolute pointer-events-none will-change-transform"
          style={{
            color: crosshairColor,
            width: 28, height: 28,
            left: cur.x, top: cur.y,
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 0 4px rgba(0,0,0,0.6))",
          }}
          strokeWidth={2.5}
        />
      )}

      {/* Engage overlay when active but not locked */}
      {active && !locked && (
        <button
          type="button"
          onClick={engage}
          className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white hover:bg-black/70 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-[#1ed760] flex items-center justify-center" style={{ boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px" }}>
            <MousePointer className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <div className="text-lg font-extrabold uppercase tracking-[0.05em]">{engageHint}</div>
          <div className="text-xs text-[#b3b3b3]">Échap pour quitter le mode visée</div>
        </button>
      )}

      {/* Tiny ESC hint while locked */}
      {locked && (
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-[1.4px] bg-black/50 text-[#b3b3b3] pointer-events-none"
        >
          ESC pour quitter
        </div>
      )}
    </div>
  );
});

export default AimZone;
