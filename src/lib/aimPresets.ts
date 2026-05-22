import type { ValorantProfile, FortniteProfile, LolProfile } from "../store/profiles";
import { AIM_SENS_MIN, AIM_SENS_MAX } from "../store/settings";

/* ============================================================
   Compute an equivalent aim-training sensitivity multiplier
   from the user's active game profile.

   Our `aimSensitivity` is a pure scalar on browser mousemove
   deltas. There is no true cm/360 equivalence with a game (we
   don't know the OS DPI or screen pixel-pitch), but we can
   approximate by:
     1. Computing the eDPI (or eDPI-like metric) of the source
        game from the user's profile.
     2. Dividing by a reference eDPI (300) so that ~average pro
        sens maps to 1.0.
   The user can still fine-tune afterwards.
   ============================================================ */

const REFERENCE_EDPI = 300;

function parseNumLoose(s: string): number {
  if (!s) return 0;
  // Take the first numeric token (handles "800", "0.35", "8.0 %", "6 / 10", "240+", etc.)
  const m = /-?\d+(\.\d+)?/.exec(s);
  return m ? parseFloat(m[0]) : 0;
}

function clamp(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return 1;
  return Math.min(AIM_SENS_MAX, Math.max(AIM_SENS_MIN, v));
}

/* -------- VALORANT --------
   eDPI = DPI × sensitivity   (Riot uses 0.07 yaw)
*/
export function aimSensFromValorant(p: ValorantProfile): { value: number; edpi: number } {
  const dpi  = parseNumLoose(p.dpi);
  const sens = parseNumLoose(p.sensitivity);
  const edpi = dpi * sens;
  return { value: clamp(edpi / REFERENCE_EDPI), edpi };
}

/* -------- FORTNITE --------
   eDPI = DPI × (X-axis sens / 100) × 5.5
   (5.5 is the unofficial in-game multiplier widely used by pros)
*/
export function aimSensFromFortnite(p: FortniteProfile): { value: number; edpi: number } {
  const dpi  = parseNumLoose(p.dpi);
  const xPct = parseNumLoose(p.xSens);
  const edpi = dpi * (xPct / 100) * 5.5;
  return { value: clamp(edpi / REFERENCE_EDPI), edpi };
}

/* -------- LOL --------
   LoL is top-down click-to-move, no FPS aim. We map the in-game
   "Game Mouse Speed" (1..10 scale) so that 6/10 = 1.0×.
*/
export function aimSensFromLol(p: LolProfile): { value: number; edpi: number | null } {
  const speed = parseNumLoose(p.gameMouseSpeed); // typically 1..10
  if (speed <= 0) return { value: 1, edpi: null };
  return { value: clamp(speed / 6), edpi: null };
}
