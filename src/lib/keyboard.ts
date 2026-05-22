import type { KeyboardLayout } from "../store/settings";

// Maps a logical key (US QWERTY position) to its label on each layout
// Used to display "press the key at this physical position" with correct label
const POSITION_MAP: Record<string, Record<KeyboardLayout, string>> = {
  Q: { qwerty: "Q", qwertz: "Q", azerty: "A" },
  W: { qwerty: "W", qwertz: "W", azerty: "Z" },
  E: { qwerty: "E", qwertz: "E", azerty: "E" },
  R: { qwerty: "R", qwertz: "R", azerty: "R" },
  T: { qwerty: "T", qwertz: "T", azerty: "T" },
  Y: { qwerty: "Y", qwertz: "Z", azerty: "Y" },
  U: { qwerty: "U", qwertz: "U", azerty: "U" },
  I: { qwerty: "I", qwertz: "I", azerty: "I" },
  O: { qwerty: "O", qwertz: "O", azerty: "O" },
  P: { qwerty: "P", qwertz: "P", azerty: "P" },
  A: { qwerty: "A", qwertz: "A", azerty: "Q" },
  S: { qwerty: "S", qwertz: "S", azerty: "S" },
  D: { qwerty: "D", qwertz: "D", azerty: "D" },
  F: { qwerty: "F", qwertz: "F", azerty: "F" },
  G: { qwerty: "G", qwertz: "G", azerty: "G" },
  H: { qwerty: "H", qwertz: "H", azerty: "H" },
  J: { qwerty: "J", qwertz: "J", azerty: "J" },
  K: { qwerty: "K", qwertz: "K", azerty: "K" },
  L: { qwerty: "L", qwertz: "L", azerty: "L" },
  Z: { qwerty: "Z", qwertz: "Y", azerty: "W" },
  X: { qwerty: "X", qwertz: "X", azerty: "X" },
  C: { qwerty: "C", qwertz: "C", azerty: "C" },
  V: { qwerty: "V", qwertz: "V", azerty: "V" },
  B: { qwerty: "B", qwertz: "B", azerty: "B" },
  N: { qwerty: "N", qwertz: "N", azerty: "N" },
  M: { qwerty: "M", qwertz: "M", azerty: ","  },
};

/** Map a US-QWERTY key to its display label on the given layout */
export function mapKey(usKey: string, layout: KeyboardLayout): string {
  const upper = usKey.toUpperCase();
  if (POSITION_MAP[upper]) return POSITION_MAP[upper][layout];
  return usKey;
}

/** Same as mapKey but for an array */
export function mapKeys(usKeys: string[], layout: KeyboardLayout): string[] {
  return usKeys.map((k) => mapKey(k, layout));
}

/** Layout display name */
export function layoutLabel(layout: KeyboardLayout): string {
  switch (layout) {
    case "qwerty": return "QWERTY US";
    case "qwertz": return "QWERTZ CH/DE";
    case "azerty": return "AZERTY FR/BE";
  }
}

/** Movement keys (WASD logical → display per layout) */
export function movementKeys(layout: KeyboardLayout): { up: string; left: string; down: string; right: string } {
  return {
    up: mapKey("W", layout),
    left: mapKey("A", layout),
    down: mapKey("S", layout),
    right: mapKey("D", layout),
  };
}
