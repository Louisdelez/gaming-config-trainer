<div align="center">

![Pulse hero](branding/hero-source.png)

# Pulse

### *Feel the game.*

[![Latest Release](https://img.shields.io/github/v/release/Louisdelez/pulse?style=for-the-badge&color=1ed760&label=Latest)](https://github.com/Louisdelez/pulse/releases/latest)
[![License](https://img.shields.io/github/license/Louisdelez/pulse?style=for-the-badge&color=1ed760)](LICENSE)
[![Downloads](https://img.shields.io/github/downloads/Louisdelez/pulse/total?style=for-the-badge&color=1ed760)](https://github.com/Louisdelez/pulse/releases)

**Le gaming companion all-in-one pour Windows.**
Configs pro, aim training, hardware tests, screen capture, music player — dans une seule app native.

[📥 Télécharger](https://github.com/Louisdelez/pulse/releases/latest) · [📖 Documentation](#-fonctionnalités) · [🐛 Signaler un bug](https://github.com/Louisdelez/pulse/issues)

</div>

---

## ⚡ En quelques mots

Pulse est une application desktop **Tauri 2 + React** (binaire natif ~14 MB hors FFmpeg) pensée pour les joueurs PC compétitifs. Elle remplace **5 outils différents** par une seule interface cohérente :

| Au lieu de… | Avec Pulse |
|--------------|------------|
| Chercher des configs pros éparpillées | Configs prêtes pour Valorant, Fortnite, LoL avec profils multi |
| Aim Lab / Kovaak's | 10 aim trainers gratuits, Pointer Lock + crosshair custom |
| NVIDIA ShadowPlay | Screen capture + recording MP4 + replay buffer (NVENC/AMF/QSV) |
| Speedtest.net | Test latence + jitter + packet loss vers 23 serveurs gaming |
| Spotify en arrière-plan | Music player intégré (bottom bar + queue panel) |

---

## 🎯 Fonctionnalités

### 🎮 Configs de jeu (Valorant · Fortnite · League of Legends)
- Réglages **pro** : keybinds, sensibilité, crosshair, graphismes, audio, minimap
- **Multi-profils** par jeu (custom, partage entre potes)
- Stockage local SQLite, jamais cloud
- **Export/Import** en HTML, PDF, PNG, TXT, Markdown
- Adapte automatiquement les bindings selon ta disposition clavier (QWERTY/QWERTZ/AZERTY)

### 🎯 10 Aim Trainers
Reaction Time · Gridshot · Tracking · Flickshot · CPS · Microshots · Strafe Targets · Stroop · Sequence Memory · Visual Match

Implémentation **Pointer Lock API** pour une vraie sensation FPS :
- Curseur OS caché, **crosshair custom** (7 formes, 8 couleurs presets + hex)
- **Sensibilité globale** configurable (0.1× – 5.0×)
- Presets calculés depuis tes profils Valorant/Fortnite/LoL (eDPI)
- Score history persistant + best/avg/attempts

### 🔧 4 Hardware Tests
- **Polling Rate** — mesure les Hz réels de ta souris
- **Click Latency** — délai signal → click
- **Monitor Hz** — refresh rate réel de l'écran
- **Speed Test gaming** — ping/jitter/loss vers **23 serveurs** (Riot, Epic, Steam, Discord, Battle.net, Xbox, PSN…)

### 📹 Screen Capture (FFmpeg bundled)
- **Screenshot** PNG plein écran
- **Recording MP4** avec hardware encoder auto-détecté : NVIDIA NVENC, AMD AMF, Intel QuickSync, Windows Media Foundation, libx264
- **Replay buffer** style ShadowPlay : garde les N dernières secondes (10–120s), sauve à la volée
- **Hotkeys globaux configurables** (marchent quand le jeu a le focus) : F9 / F10 / F11 par défaut, customisables dans Settings
- Audio système optionnel (via virtual-audio-capturer)
- **Bibliothèque** centralisée avec filtres, tri, recherche

### 🎵 Music Player (Spotify-style)
- **Bottom bar** toujours visible : shuffle, prev, play/pause, next, repeat, progress, volume
- **Now Playing panel** droit toggleable
- Library locale, formats : mp3, m4a, aac, wav, ogg, flac, opus
- Audio sandbox via Tauri asset protocol

### 🔄 Auto-update
- **Signatures cryptographiques minisign** (clé publique embarquée, clé privée jamais distribuée)
- Manifest sur GitHub Releases (`latest.json`)
- Détection silencieuse au boot, modal avec changelog, install + relaunch en un click

### 🎨 Design system Spotify
- Dark theme `#121212` / surfaces `#181818` / accent `#1ed760`
- Pills, UPPERCASE letter-spacing 1.4px, fonts gras
- Sidebar gauche · main content · player bottom · now playing right
- Responsive (min 1024×700)

---

## 📥 Installation

### Recommandé — Installer Windows (auto-update inclus)
1. Télécharge **[Pulse-X.Y.Z-setup.exe](https://github.com/Louisdelez/pulse/releases/latest)** depuis la dernière release
2. Double-clic → installer télécharge **WebView2** auto si nécessaire
3. Lance depuis le menu Démarrer
4. Les futures versions s'installent **automatiquement** au démarrage (bannière verte → "Installer")

> ⚠️ Windows SmartScreen peut afficher un avertissement au 1er lancement (app non signée code-signing). Click *Informations complémentaires* → *Exécuter quand même*.

### Alternative — Portable
Télécharge `Pulse-X.Y.Z-portable.zip`, extrais le dossier, double-clic sur `Pulse.exe`. ⚠️ Pas d'auto-update sur le portable.

### Prérequis
- Windows 10/11 **64-bit**
- WebView2 Runtime (auto-download par l'installer si manquant)

---

## 🛠️ Tech stack

| Catégorie | Tech |
|-----------|------|
| **Backend** | Tauri 2 (Rust) — wrapper natif léger |
| **Frontend** | React 19 + TypeScript 5.8 + Vite 7 |
| **Styling** | Tailwind CSS v4 (design system custom Spotify) |
| **State** | Zustand 5 |
| **Persistence** | SQLite via `tauri-plugin-sql` (3 migrations) |
| **Capture** | FFmpeg gyan.dev essentials 7.1 (sidecar, auto-download via npm postinstall) |
| **Updater** | `tauri-plugin-updater` + signature minisign |
| **i18n** | i18next + react-i18next (FR / EN, 95 clés) |
| **Plugins Tauri** | opener, dialog, fs, shell, global-shortcut, sql, updater, process |

---

## 🏗️ Développement local

```bash
# Prérequis : Node 20+ et Rust 1.70+
git clone https://github.com/Louisdelez/pulse.git
cd pulse
npm install            # déclenche le download FFmpeg automatique (postinstall)
npm run tauri dev      # hot reload
npm run tauri build    # build production signé (.exe + installer)
```

### Release process
```powershell
# 1. Bump version dans 3 fichiers : package.json, src-tauri/tauri.conf.json, src-tauri/Cargo.toml
# 2. Build signé
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content "$env:USERPROFILE\.gct-keys\pulse-updater.key" -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "***"
npm run tauri build

# 3. Push tag + publish auto
git tag v0.X.Y && git push origin v0.X.Y
node scripts/publish-release.mjs
```

---

## 📂 Structure

```
src/
├── pages/                 # 17 routes
│   ├── configs/           # Valorant, Fortnite, LeagueOfLegends
│   ├── games/             # 10 aim trainers
│   ├── hardware/          # 4 tests hardware + Speed Test
│   ├── Capture.tsx        # Screenshot + recording + replay
│   ├── Library.tsx        # Captures centralisées
│   ├── Music.tsx          # Music library
│   ├── Settings.tsx       # Tous les paramètres
│   └── Info.tsx           # /info/:slug — explications détaillées
├── components/
│   ├── config/            # ProfileBar, modals (create/rename/delete), exporter
│   ├── PlayerBar.tsx      # Bottom music player
│   ├── NowPlayingSidebar.tsx
│   ├── AimZone.tsx        # Pointer Lock + crosshair
│   ├── UpdateBanner.tsx
│   └── SpotifyConfig.tsx  # Design system partagé
├── store/                 # 4 Zustand : profiles, scores, settings, player
├── lib/                   # capture, db, audioEngine, hotkeys, updater, exporters…
├── data/                  # explanations.ts (14 entrées)
└── i18n/                  # locales FR/EN

src-tauri/
├── src/                   # main.rs, lib.rs (migrations SQL, plugins init)
├── icons/                 # Toutes tailles auto-générées via npx tauri icon
├── binaries/              # FFmpeg sidecar (auto-download via postinstall)
└── capabilities/          # Permissions Tauri scopées

scripts/
├── download-ffmpeg.mjs    # Pull gyan.dev essentials 7.1
├── process-brand.mjs      # Strip BG + resize logo
└── publish-release.mjs    # Build manifest + GitHub release auto
```

---

## 💾 Sauvegarde des données

SQLite local : `%APPDATA%\com.loicd.gamingconfig\gct.db`

Toutes tes données (profils, scores, captures, library musique) y vivent. Pour migrer entre PC : copie ce fichier.

---

## 📜 Licence

[MIT](LICENSE) © 2026 Louisdelez

FFmpeg © FFmpeg developers (LGPL 2.1+) — build gyan.dev essentials, téléchargé séparément par `npm install`, jamais redistribué dans le code source du repo.
