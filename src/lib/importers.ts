import type { AnyProfile, GameId } from "../store/profiles";
import { applyImportedValues } from "./profileSchemas";

/* ============================================================
   Importer — parses TXT or MD into a partial profile
   Strategy:
   - Strip Markdown noise (#, **, |, `)
   - Extract `Key: Value` pairs (one per line)
   - Apply known fields to base profile via schema mapping
   ============================================================ */

export interface ParsedImport {
  /** Detected profile name (if "Name:" or "Profile:" found) */
  name?: string;
  /** Detected layout (if "Layout:" found) */
  layout?: string;
  /** Raw key/value pairs extracted from the file */
  values: Record<string, string>;
}

export function parseProfileText(text: string): ParsedImport {
  const result: ParsedImport = { values: {} };

  // Normalize line endings
  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  for (const rawLine of lines) {
    let line = rawLine;

    // Strip Markdown table pipes: "| Key | Value |" → "Key : Value"
    const tableMatch = /^\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/.exec(line);
    if (tableMatch) {
      // Skip separator row
      if (/^[\s\-:|]+$/.test(line)) continue;
      const k = tableMatch[1].replace(/[`*_]+/g, "").trim();
      const v = tableMatch[2].replace(/[`*_]+/g, "").trim();
      // Skip table headers like "Setting | Value"
      if (/^(setting|paramètre|paramètre|key)$/i.test(k)) continue;
      if (k && v) result.values[k] = v;
      continue;
    }

    // Drop Markdown headings, bullets, comments
    line = line
      .replace(/^\s*#+\s*/, "")     // headings
      .replace(/^\s*[-*]\s*/, "")    // bullets
      .replace(/[`*_]+/g, "")        // emphasis chars
      .trim();

    if (!line) continue;
    // Skip pure section headers like "[Mouse]"
    if (/^\[.+\]$/.test(line)) continue;

    // Key: Value pattern
    const m = /^([^:]{1,80}?)\s*:\s*(.+?)\s*$/.exec(line);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    if (!key || !value) continue;

    const lk = key.toLowerCase();
    if (lk === "name" || lk === "profile" || lk === "profile name") {
      result.name = value;
    } else if (lk === "layout" || lk === "keyboard" || lk === "keyboard layout") {
      result.layout = value;
    } else {
      result.values[key] = value;
    }
  }

  return result;
}

/** Build a custom profile from text, based on a current default/active */
export function buildProfileFromText(
  text: string,
  baseProfile: AnyProfile,
  fallbackName: string,
  game: GameId
): { profile: AnyProfile; detectedName?: string; detectedLayout?: string; fieldsMatched: number } {
  const parsed = parseProfileText(text);
  // Apply known field values
  const updated = applyImportedValues(baseProfile, parsed.values);
  // Override name if detected (else use fallback)
  const name = parsed.name?.trim() || fallbackName;
  // Override layout if detected
  let layout = baseProfile.keyboardLayout;
  if (parsed.layout) {
    const l = parsed.layout.toLowerCase().trim();
    if (l === "qwerty" || l === "qwertz" || l === "azerty") layout = l;
  }
  const profile: AnyProfile = {
    ...updated,
    name,
    isDefault: false,
    keyboardLayout: layout,
    game,
  } as AnyProfile;

  return {
    profile,
    detectedName: parsed.name,
    detectedLayout: parsed.layout,
    fieldsMatched: Object.keys(parsed.values).length,
  };
}
