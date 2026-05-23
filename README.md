# Pulse

> Feel the game.

Gaming companion all-in-one pour Windows. Conçu pour **Valorant**, **Fortnite** et **League of Legends** mais utile bien au-delà.

- 🎯 **Configs pro** par jeu : keybinds, sensibilité, crosshair, graphismes, audio (multi-profils SQLite)
- 🎮 **10 aim trainers** avec Pointer Lock + crosshair custom (Reaction, Gridshot, Tracking, Flickshot, CPS, Microshots, Strafe, Stroop, Sequence, VisualMatch)
- 🔧 **4 hardware tests** : Polling Rate, Click Latency, Monitor Hz, Speed Test gaming (23 serveurs)
- 📹 **Screen capture** : screenshot + recording MP4 (NVENC/AMF/QSV) + replay buffer style ShadowPlay
- ⌨️ **Hotkeys globaux** configurables (marchent en jeu)
- 🎵 **Music player** Spotify-style intégré (bottom bar + queue panel)
- 📤 **Export/Import** configs en HTML / PDF / PNG / TXT / MD
- 🔄 **Auto-update** signé minisign + manifest GitHub Releases
- 🌍 **Multi-langue** FR/EN + **3 layouts clavier** (QWERTY/QWERTZ/AZERTY)

## 📥 Installation

### Option 1 — Installer (recommandé)
1. Télécharge `Pulse-Setup.exe` depuis la dernière [Release](../../releases/latest)
2. Double-clic → l'installer télécharge WebView2 si nécessaire + installe l'app
3. Lancer depuis le menu Démarrer

### Option 2 — Portable
1. Télécharge `Pulse.exe` depuis la [Release](../../releases/latest)
2. Pose-le où tu veux et double-clic

> ⚠️ Au premier lancement, Windows SmartScreen peut afficher un avertissement (l'app n'est pas signée). Click "Informations complémentaires" → "Exécuter quand même".

### Prérequis
- Windows 10/11 **64-bit**
- **WebView2 Runtime** (pré-installé sur Win 11, téléchargé auto par l'installer sinon)

## 🚀 Tech stack

- **Tauri 2** (Rust) — backend natif, ~14 MB binaire
- **React 19 + TypeScript + Vite** — frontend
- **Tailwind CSS v4** — design system Spotify
- **SQLite** via `tauri-plugin-sql` — persistance locale
- **Zustand** — state management
- **i18next** — internationalisation
- **html-to-image + jsPDF** — exports PNG/PDF
- **Lucide React** — icônes

## 🏗️ Développement local

```bash
# Prérequis : Node 20+ et Rust 1.70+
npm install            # déclenche aussi le download de FFmpeg (postinstall)
npm run tauri dev      # dev mode (hot reload)
npm run tauri build    # build production (.exe + installer)
```

### FFmpeg auto-download

Le binaire **FFmpeg** (~97 MB) n'est **pas dans le repo** — il est téléchargé automatiquement par `npm install` via le script `scripts/download-ffmpeg.mjs` :
- Version pinnée : **gyan.dev essentials 7.1**
- Idempotent (skip si déjà présent au bon hash)
- Forcer re-download : `npm run fetch-ffmpeg`

Cette approche garde le repo léger (~150 MB → quelques MB) tout en livrant un installer **autonome** avec FFmpeg bundled à chaque release.

## 📂 Structure

```
src/
├── pages/
│   ├── configs/        # Valorant, Fortnite, LoL
│   ├── games/          # 10 aim trainers
│   └── hardware/       # 4 tests
├── components/
│   ├── config/         # ProfileBar, Editor, modals, exporter
│   └── SpotifyConfig.tsx  # design system partagé
├── store/              # Zustand + SQLite
└── lib/                # db, exporters, importers, network
```

## 💾 Sauvegarde des données

Les profils et scores sont stockés dans :
```
%APPDATA%\com.loicd.gamingconfig\gct.db
```

Pour migrer entre PC : copie ce fichier `.db`, ou utilise **Export → TXT/MD** depuis l'app.

## 📜 Licence

MIT
