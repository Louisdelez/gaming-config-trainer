import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, writeFile, readTextFile } from "@tauri-apps/plugin-fs";
import type { AnyProfile, GameId } from "../store/profiles";
import { SCHEMA_BY_GAME, GAME_LABEL, getField } from "./profileSchemas";

/* ============================================================
   Helpers — filenames, dialog
   ============================================================ */

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "config";
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function defaultFilename(profile: AnyProfile, ext: string): string {
  return `${profile.game}_${slug(profile.name)}_${timestamp()}.${ext}`;
}

async function pickSavePath(profile: AnyProfile, ext: string, label: string): Promise<string | null> {
  const result = await save({
    defaultPath: defaultFilename(profile, ext),
    filters: [
      { name: label, extensions: [ext] },
      { name: "Tous les fichiers", extensions: ["*"] },
    ],
  });
  return result ?? null;
}

function getConfigElement(game: GameId): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-config-export="${game}"]`);
  if (!el) throw new Error(`Élément config introuvable pour ${game}`);
  return el;
}

/** Collect all CSS rules from <style> tags and same-origin stylesheets */
function collectAllCss(): string {
  let css = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      for (const rule of Array.from(rules)) {
        css += rule.cssText + "\n";
      }
    } catch {
      // Cross-origin or inaccessible stylesheet — skip
    }
  }
  return css;
}

/* ============================================================
   TXT EXPORT (text-only)
   ============================================================ */

export function buildTxt(profile: AnyProfile): string {
  const lines: string[] = [];
  lines.push(`# Profile: ${profile.name}`);
  lines.push(`Game: ${GAME_LABEL[profile.game]}`);
  lines.push(`Layout: ${profile.keyboardLayout.toUpperCase()}`);
  lines.push("");
  const schema = SCHEMA_BY_GAME[profile.game];
  for (const section of schema) {
    lines.push(`[${section.title}]`);
    for (const f of section.fields) {
      lines.push(`${f.label}: ${getField(profile, f.key)}`);
    }
    lines.push("");
  }
  lines.push(`# Exported on ${new Date().toLocaleString()}`);
  return lines.join("\n");
}

export async function exportTxt(profile: AnyProfile): Promise<string | null> {
  const path = await pickSavePath(profile, "txt", "Fichier texte");
  if (!path) return null;
  await writeTextFile(path, buildTxt(profile));
  return path;
}

/* ============================================================
   MARKDOWN EXPORT (text-only)
   ============================================================ */

export function buildMd(profile: AnyProfile): string {
  const lines: string[] = [];
  lines.push(`# ${profile.name}`);
  lines.push("");
  lines.push(`**Game:** ${GAME_LABEL[profile.game]}  `);
  lines.push(`**Keyboard layout:** ${profile.keyboardLayout.toUpperCase()}  `);
  lines.push(`**Exported:** ${new Date().toLocaleString()}`);
  lines.push("");
  const schema = SCHEMA_BY_GAME[profile.game];
  for (const section of schema) {
    lines.push(`## ${section.title}`);
    lines.push("");
    lines.push(`| Setting | Value |`);
    lines.push(`|---------|-------|`);
    for (const f of section.fields) {
      const v = getField(profile, f.key).replace(/\|/g, "\\|");
      lines.push(`| ${f.label} | \`${v}\` |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function exportMd(profile: AnyProfile): Promise<string | null> {
  const path = await pickSavePath(profile, "md", "Markdown");
  if (!path) return null;
  await writeTextFile(path, buildMd(profile));
  return path;
}

/* ============================================================
   HTML EXPORT — captures the live DOM with inlined styles
   so the file looks IDENTICAL to the app (keyboard visual,
   cards, tables, footer — everything).
   ============================================================ */

export async function exportHtml(profile: AnyProfile): Promise<string | null> {
  const path = await pickSavePath(profile, "html", "Document HTML");
  if (!path) return null;

  const element = getConfigElement(profile.game);
  const innerHtml = element.outerHTML;
  const css = collectAllCss();

  const wrapperCss = `
    /* Standalone overrides */
    html, body {
      background: #121212 !important;
      color: #fff !important;
      margin: 0;
      padding: 32px 24px;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
    }
    [data-config-export] { max-width: 1100px; margin: 0 auto; }
    /* Hide any FAB/buttons that might have leaked */
    button[aria-label*="profil"], button[aria-label*="Profil"] { display: none !important; }
  `;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(profile.name)} — ${GAME_LABEL[profile.game]}</title>
<style>${css}</style>
<style>${wrapperCss}</style>
</head>
<body>
${innerHtml}
<div style="text-align:center; color:#b3b3b3; font-size:11px; margin-top:32px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.06);">
  Généré par Gaming Config &amp; Trainer • ${escapeHtml(new Date().toLocaleString())}
</div>
</body>
</html>`;

  await writeTextFile(path, html);
  return path;
}

/* ============================================================
   PNG EXPORT — captures the live DOM via html-to-image
   ============================================================ */

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

export async function exportPng(profile: AnyProfile): Promise<string | null> {
  const path = await pickSavePath(profile, "png", "Image PNG");
  if (!path) return null;

  const element = getConfigElement(profile.game);
  const dataUrl = await toPng(element, {
    backgroundColor: "#121212",
    pixelRatio: 2,
    cacheBust: true,
  });
  await writeFile(path, dataUrlToUint8(dataUrl));
  return path;
}

/* ============================================================
   PDF EXPORT — captures live DOM → PNG → embed in jsPDF
   ============================================================ */

export async function exportPdf(profile: AnyProfile): Promise<string | null> {
  const path = await pickSavePath(profile, "pdf", "Document PDF");
  if (!path) return null;

  const element = getConfigElement(profile.game);
  const dataUrl = await toPng(element, {
    backgroundColor: "#121212",
    pixelRatio: 2,
    cacheBust: true,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image load failed"));
    img.src = dataUrl;
  });

  const aspect = img.width / img.height;
  const drawWidth = pageWidth - 40;
  const drawHeight = drawWidth / aspect;

  pdf.setFillColor(18, 18, 18);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  if (drawHeight <= pageHeight - 40) {
    pdf.addImage(dataUrl, "PNG", 20, 20, drawWidth, drawHeight);
  } else {
    const sliceHeightPx = (img.width * (pageHeight - 40)) / drawWidth;
    let yPx = 0;
    let firstPage = true;
    while (yPx < img.height) {
      if (!firstPage) {
        pdf.addPage();
        pdf.setFillColor(18, 18, 18);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
      }
      firstPage = false;
      const sliceH = Math.min(sliceHeightPx, img.height - yPx);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = sliceH;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, yPx, img.width, sliceH, 0, 0, img.width, sliceH);
      const sliceDataUrl = canvas.toDataURL("image/png");
      const sliceDrawHeight = (sliceH * drawWidth) / img.width;
      pdf.addImage(sliceDataUrl, "PNG", 20, 20, drawWidth, sliceDrawHeight);
      yPx += sliceHeightPx;
    }
  }

  const pdfBlob = pdf.output("blob");
  const arrayBuffer = await pdfBlob.arrayBuffer();
  await writeFile(path, new Uint8Array(arrayBuffer));
  return path;
}

/* ============================================================
   IMPORT — pick file with native dialog, read text
   ============================================================ */

export async function pickImportFile(): Promise<{ path: string; content: string } | null> {
  const selected = await open({
    multiple: false,
    filters: [
      { name: "Fichier de config", extensions: ["txt", "md"] },
      { name: "Tous les fichiers", extensions: ["*"] },
    ],
  });
  if (!selected) return null;
  const path = Array.isArray(selected) ? selected[0] : selected;
  if (!path) return null;
  const content = await readTextFile(path);
  return { path, content };
}

/* ============================================================
   Helpers
   ============================================================ */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
