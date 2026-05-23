#!/usr/bin/env node
/**
 * Publish a signed Tauri release to GitHub.
 *
 * Workflow:
 *   1. Read version from src-tauri/tauri.conf.json
 *   2. Locate the Tauri NSIS installer + its .sig signature
 *   3. Generate the latest.json manifest with the version, URL, signature
 *   4. Stage everything under release-stage/
 *   5. Create the GitHub release via `gh` CLI (or update existing)
 *
 * Requirements:
 *   - `gh` CLI authenticated (`gh auth status`)
 *   - Build already done with TAURI_SIGNING_PRIVATE_KEY env var set so .sig
 *     files exist next to the installers
 *
 * Usage:
 *   node scripts/publish-release.mjs            # publish current version
 *   node scripts/publish-release.mjs --dry-run  # just stage + show manifest
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const OWNER = "Louisdelez";
const REPO  = "pulse";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function findFile(dir, regex) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir)) {
    if (regex.test(entry)) return path.join(dir, entry);
  }
  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const conf = readJson(path.join(ROOT, "src-tauri/tauri.conf.json"));
  const version = conf.version;
  const tag = `v${version}`;
  console.log(`📦 Publishing ${tag}…`);

  const releaseRoot = path.join(ROOT, "src-tauri/target/release");
  const nsisDir = path.join(releaseRoot, "bundle/nsis");
  const msiDir  = path.join(releaseRoot, "bundle/msi");

  const setupRegex = new RegExp(`Pulse_${version}_x64-setup\\.exe$`);
  const setupSigRegex = new RegExp(`Pulse_${version}_x64-setup\\.exe\\.sig$`);
  const msiRegex = new RegExp(`Pulse_${version}_x64_en-US\\.msi$`);

  const setupExe = findFile(nsisDir, setupRegex);
  const setupSig = findFile(nsisDir, setupSigRegex);
  const msi      = findFile(msiDir,  msiRegex);
  // Main exe filename derives from productName "Pulse" → "Pulse.exe"
  const portable = fs.existsSync(path.join(releaseRoot, "Pulse.exe"))
    ? path.join(releaseRoot, "Pulse.exe")
    : path.join(releaseRoot, "pulse.exe");
  const ffmpeg   = path.join(releaseRoot, "ffmpeg.exe");

  if (!setupExe) throw new Error(`NSIS setup not found in ${nsisDir} (run npm run tauri build first)`);
  if (!setupSig) throw new Error(`Signature .sig missing — make sure TAURI_SIGNING_PRIVATE_KEY was set during build`);

  console.log(`  • Setup:    ${path.basename(setupExe)}`);
  console.log(`  • Sig:      ${path.basename(setupSig)}`);
  console.log(`  • MSI:      ${msi ? path.basename(msi) : "(missing)"}`);
  console.log(`  • Portable: ${fs.existsSync(portable) ? path.basename(portable) : "(missing)"}`);

  // Read signature content
  const sigContent = fs.readFileSync(setupSig, "utf8").trim();

  // Pretty notes
  let notes = "";
  const notesPath = path.join(ROOT, `release-stage/NOTES-${version}.md`);
  if (fs.existsSync(notesPath)) {
    notes = fs.readFileSync(notesPath, "utf8");
  } else {
    notes = `## v${version}\n\nSee commits since previous tag.`;
  }
  // Strip markdown for the body in latest.json
  const plainBody = notes
    .replace(/^#.*$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim()
    .split("\n").filter(Boolean).slice(0, 20).join("\n");

  // Build the manifest
  const setupUrl = `https://github.com/${OWNER}/${REPO}/releases/download/${tag}/Pulse-${version}-setup.exe`;
  const manifest = {
    version,
    notes: plainBody,
    pub_date: new Date().toISOString(),
    platforms: {
      "windows-x86_64": {
        signature: sigContent,
        url: setupUrl,
      },
    },
  };

  // Stage outputs
  const stage = path.join(ROOT, "release-stage");
  fs.mkdirSync(stage, { recursive: true });
  fs.writeFileSync(path.join(stage, "latest.json"), JSON.stringify(manifest, null, 2));

  // Copy artifacts with clean filenames
  const stageSetup    = path.join(stage, `Pulse-${version}-setup.exe`);
  const stageSetupSig = path.join(stage, `Pulse-${version}-setup.exe.sig`);
  const stageMsi      = msi      ? path.join(stage, `Pulse-${version}.msi`)             : null;
  const stagePortable = path.join(stage, `Pulse-${version}-portable.zip`);

  fs.copyFileSync(setupExe, stageSetup);
  fs.copyFileSync(setupSig, stageSetupSig);
  if (msi) fs.copyFileSync(msi, stageMsi);

  // Build portable zip (app exe + ffmpeg side-by-side)
  if (fs.existsSync(portable) && fs.existsSync(ffmpeg)) {
    const portableDir = path.join(stage, `_portable_${version}`);
    fs.rmSync(portableDir, { recursive: true, force: true });
    fs.mkdirSync(portableDir, { recursive: true });
    fs.copyFileSync(portable, path.join(portableDir, "GamingConfigTrainer.exe"));
    fs.copyFileSync(ffmpeg,   path.join(portableDir, "ffmpeg.exe"));
    // PowerShell zip on Windows
    if (process.platform === "win32") {
      const cmd = `Compress-Archive -Path '${portableDir}\\*' -DestinationPath '${stagePortable}' -Force`;
      execSync(`powershell -NoProfile -Command "${cmd}"`, { stdio: "inherit" });
    }
    fs.rmSync(portableDir, { recursive: true, force: true });
  }

  console.log("\n📜 Manifest preview (latest.json):");
  console.log(JSON.stringify(manifest, null, 2));

  if (dryRun) {
    console.log("\n--dry-run: skipping gh release create");
    return;
  }

  // gh release create
  const args = [
    "release", "create", tag,
    stageSetup, stageSetupSig, path.join(stage, "latest.json"),
    "--title", `${tag} — Gaming Config Trainer`,
    "--notes-file", notesPath,
    "--latest",
  ];
  if (stageMsi)      args.push(stageMsi);
  if (fs.existsSync(stagePortable)) args.push(stagePortable);

  console.log("\n🚀 Creating GitHub release…");
  try {
    execSync(`gh ${args.map((a) => `"${a}"`).join(" ")}`, { stdio: "inherit" });
    console.log(`\n✅ Release published: https://github.com/${OWNER}/${REPO}/releases/tag/${tag}`);
  } catch (e) {
    console.error("❌ gh release create failed. You can re-run manually:");
    console.error(`gh ${args.map((a) => `"${a}"`).join(" ")}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌", e?.message ?? e);
  process.exit(1);
});
