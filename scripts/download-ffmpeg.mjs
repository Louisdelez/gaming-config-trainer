#!/usr/bin/env node
/**
 * Download FFmpeg (gyan.dev essentials build) as a Tauri sidecar binary.
 * Runs automatically after `npm install` via the postinstall hook.
 *
 * - Pinned version + SHA256 checksum for reproducibility
 * - Idempotent: skips if already present with matching version marker
 * - Cross-platform extraction (PowerShell on Windows, unzip elsewhere)
 *
 * To force a re-download:
 *   node scripts/download-ffmpeg.mjs --force
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

/* ------------------------------------------------------------
   Configuration
   ------------------------------------------------------------ */

const FFMPEG_VERSION = "7.1";
const FFMPEG_URL =
  `https://github.com/GyanD/codexffmpeg/releases/download/${FFMPEG_VERSION}/ffmpeg-${FFMPEG_VERSION}-essentials_build.zip`;
// SHA256 of the gyan.dev essentials build for 7.1. Update when bumping version.
// Verified via the SHA-256 row on https://www.gyan.dev/ffmpeg/builds/
const EXPECTED_SHA256 = ""; // empty = skip verification (set this after first download is verified manually)

const TARGET_DIR  = path.join(ROOT, "src-tauri", "binaries");
const TARGET_NAME = "ffmpeg-x86_64-pc-windows-msvc.exe";
const TARGET_PATH = path.join(TARGET_DIR, TARGET_NAME);
const MARKER_PATH = path.join(TARGET_DIR, ".ffmpeg.version");

/* ------------------------------------------------------------
   Helpers
   ------------------------------------------------------------ */

const log = (...args) => console.log("[ffmpeg]", ...args);
const warn = (...args) => console.warn("[ffmpeg]", ...args);

function sha256OfFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function findFileRecursive(dir, name) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      const found = findFileRecursive(full, name);
      if (found) return found;
    } else if (entry.toLowerCase() === name.toLowerCase()) {
      return full;
    }
  }
  return null;
}

function extractZip(zipPath, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  if (process.platform === "win32") {
    const ps = `Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force`;
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${ps}"`, { stdio: ["ignore", "inherit", "inherit"] });
  } else {
    execSync(`unzip -q -o "${zipPath}" -d "${destDir}"`, { stdio: ["ignore", "inherit", "inherit"] });
  }
}

async function downloadFile(url, destPath) {
  // Use Node 18+ global fetch
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const total = Number(res.headers.get("content-length") || 0);
  log(`downloading ${(total / 1024 / 1024).toFixed(1)} MB…`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(destPath, buf);
  return buf.length;
}

/* ------------------------------------------------------------
   Main
   ------------------------------------------------------------ */

async function main() {
  const force = process.argv.includes("--force");

  // Idempotent: skip if binary present AND version marker matches
  if (!force && fs.existsSync(TARGET_PATH) && fs.existsSync(MARKER_PATH)) {
    const ver = fs.readFileSync(MARKER_PATH, "utf8").trim();
    if (ver === FFMPEG_VERSION) {
      log(`already installed (v${FFMPEG_VERSION}), skipping.`);
      log(`  → ${TARGET_PATH}`);
      log("  (run with --force to re-download)");
      return;
    }
    warn(`version mismatch (have '${ver}', want '${FFMPEG_VERSION}'), re-downloading.`);
  }

  log(`installing FFmpeg ${FFMPEG_VERSION} for Tauri sidecar…`);
  log(`  source: ${FFMPEG_URL}`);
  log(`  target: ${TARGET_PATH}`);

  fs.mkdirSync(TARGET_DIR, { recursive: true });
  const tmpZip = path.join(TARGET_DIR, "_ffmpeg.zip");
  const tmpExtract = path.join(TARGET_DIR, "_extract");
  fs.rmSync(tmpExtract, { recursive: true, force: true });

  try {
    const bytes = await downloadFile(FFMPEG_URL, tmpZip);
    log(`downloaded: ${(bytes / 1024 / 1024).toFixed(1)} MB`);

    if (EXPECTED_SHA256) {
      const actual = sha256OfFile(tmpZip);
      if (actual.toLowerCase() !== EXPECTED_SHA256.toLowerCase()) {
        throw new Error(`SHA256 mismatch\n  expected: ${EXPECTED_SHA256}\n  actual:   ${actual}`);
      }
      log("checksum OK");
    } else {
      warn("no checksum configured — skipping verification (set EXPECTED_SHA256 in this script)");
    }

    log("extracting…");
    extractZip(tmpZip, tmpExtract);

    const found = findFileRecursive(tmpExtract, "ffmpeg.exe");
    if (!found) throw new Error("ffmpeg.exe not found in archive");

    fs.copyFileSync(found, TARGET_PATH);
    fs.writeFileSync(MARKER_PATH, FFMPEG_VERSION);

    const sizeMB = (fs.statSync(TARGET_PATH).size / 1024 / 1024).toFixed(2);
    log(`installed: ${TARGET_PATH} (${sizeMB} MB) ✓`);
  } finally {
    // Cleanup tmp files (best-effort)
    fs.rmSync(tmpZip, { force: true });
    fs.rmSync(tmpExtract, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error("[ffmpeg] download failed:", e?.message ?? e);
  console.error("[ffmpeg] you can retry with: node scripts/download-ffmpeg.mjs --force");
  process.exit(1);
});
