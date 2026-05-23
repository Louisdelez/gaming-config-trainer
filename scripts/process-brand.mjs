#!/usr/bin/env node
/**
 * Process Pulse brand assets:
 *   1. Strip grey background from the app icon (keep green pulse + glow)
 *   2. Save a transparent 1024×1024 PNG → src-tauri/icon-source.png
 *   3. Also drop scaled copies for the in-app sidebar logo
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SRC_ICON  = path.join(ROOT, "branding/app-icon-source.png");
const SRC_LOGO  = path.join(ROOT, "branding/logo-horizontal-source.png");
const OUT_ICON  = path.join(ROOT, "src-tauri/icon-source.png");
const OUT_BRAND = path.join(ROOT, "src/assets/brand");

fs.mkdirSync(OUT_BRAND, { recursive: true });

/**
 * Custom background-removal:
 * - Keep pixels where green channel dominates (r,g,b) with alpha proportional
 *   to greenness so the soft glow is preserved.
 * - Drop everything else (grey background) to transparent.
 */
async function stripGreyBackground(input, output) {
  const img = sharp(input).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // "Greenness" score: how much green dominates over red+blue
    const greenness = Math.max(0, g - Math.max(r, b)); // 0..255
    // Brightness of the pixel
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    let alpha;
    if (greenness > 30) {
      // Strong green — fully visible
      alpha = 255;
    } else if (greenness > 10 && luma > 100) {
      // Soft green glow — partial alpha (smoothly fading)
      alpha = Math.min(255, Math.round((greenness - 10) * 12 + (luma - 100) * 1.2));
    } else {
      alpha = 0;
    }

    out[i]     = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = alpha;
  }

  await sharp(out, { raw: { width, height, channels } })
    .png()
    .toFile(output);

  console.log(`[brand] wrote ${output} (${width}×${height})`);
}

/** Just resize+compress the horizontal logo for use in the sidebar */
async function exportLogo(input, outputDir) {
  const sizes = [
    { name: "logo-horizontal.png",    width: 600 },
    { name: "logo-horizontal-sm.png", width: 240 },
  ];
  for (const s of sizes) {
    const outPath = path.join(outputDir, s.name);
    await sharp(input)
      .resize({ width: s.width, withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    const sz = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`[brand] logo: ${s.name} (${s.width}px wide, ${sz} KB)`);
  }
}

async function main() {
  if (!fs.existsSync(SRC_ICON)) throw new Error(`Missing ${SRC_ICON}`);
  if (!fs.existsSync(SRC_LOGO)) throw new Error(`Missing ${SRC_LOGO}`);

  console.log("=== Stripping grey BG from app icon ===");
  await stripGreyBackground(SRC_ICON, OUT_ICON);

  // Also export a small transparent icon for the sidebar (use the same processed source)
  await sharp(OUT_ICON)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(OUT_BRAND, "pulse-icon-64.png"));
  console.log(`[brand] sidebar icon: pulse-icon-64.png`);

  console.log("\n=== Exporting horizontal logo variants ===");
  await exportLogo(SRC_LOGO, OUT_BRAND);

  console.log("\n✓ Brand assets processed. Now run:");
  console.log("  npx tauri icon src-tauri/icon-source.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
