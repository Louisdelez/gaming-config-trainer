# Gaming Config Trainer

> Optimise ton setup. Entraîne tes réflexes.

Application desktop tout-en-un pour **Valorant**, **Fortnite** et **League of Legends** :
- 🎯 **Configs pro** : keybinds, sensibilité, crosshair, graphismes, audio (avec profils personnalisables)
- 🎮 **10 mini-jeux** d'aim training (Reaction Time, Gridshot, Tracking, Flickshot, CPS, Microshots, Strafe, Stroop, Sequence, Visual Match)
- 🔧 **4 tests hardware** : Polling Rate, Click Latency, Monitor Hz, Speed Test gaming
- 💾 **Profils sauvegardés** dans SQLite local (multi-profils par jeu)
- 📤 **Export/Import** des configs en HTML / PDF / PNG / TXT / MD
- 🌍 **Multi-langue** FR/EN + **3 layouts clavier** (QWERTY / QWERTZ / AZERTY)

## 📥 Installation

### Option 1 — Installer (recommandé)
1. Télécharge `GamingConfigTrainer-Setup.exe` depuis la dernière [Release](../../releases/latest)
2. Double-clic → l'installer télécharge WebView2 si nécessaire + installe l'app
3. Lancer depuis le menu Démarrer

### Option 2 — Portable
1. Télécharge `GamingConfigTrainer.exe` depuis la [Release](../../releases/latest)
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
npm install
npm run tauri dev      # dev mode (hot reload)
npm run tauri build    # build production (.exe + installer)
```

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
