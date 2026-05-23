/* ============================================================
   Detailed explanations for every test & training in the app.
   Used by /info/:slug page, opened via the (?) button in each
   game/hardware page header.
   ============================================================ */

export interface Section {
  title: string;
  body: string;
}

export interface Explanation {
  slug: string;
  category: "game" | "hardware";
  title: string;
  short: string;
  /** Color accent for the page (Tailwind text-X class) */
  accent: string;
  sections: Section[];
}

export const EXPLANATIONS: Record<string, Explanation> = {
  /* ============ AIM TRAINERS ============ */
  reaction: {
    slug: "reaction",
    category: "game",
    title: "Temps de Réaction",
    short: "Mesure ta latence visuelle pure (du stimulus au clic)",
    accent: "text-red-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "Le délai entre le moment où un stimulus visuel apparaît (l'écran passe au vert) et le moment où ton cerveau commande à tes doigts de cliquer. C'est une mesure de ta latence neurologique pure, sans composante de visée."
      },
      {
        title: "Comment ça marche",
        body: "L'écran reste rouge pendant un délai aléatoire (1 à 5s). Dès qu'il passe au vert, tu cliques. On mesure le temps en millisecondes. Si tu cliques avant le vert, c'est compté comme faux-départ."
      },
      {
        title: "Comprendre ton score",
        body: "• 150–200 ms : niveau pro esport\n• 200–250 ms : très bon, top 5% des joueurs\n• 250–300 ms : moyen, niveau de la majorité\n• 300+ ms : à améliorer (peut indiquer fatigue, latence écran élevée ou hardware)"
      },
      {
        title: "Pour t'améliorer",
        body: "• Dors bien (la fatigue dégrade ton temps de 20-30 ms)\n• Réduis la latence hardware : moniteur 144+ Hz, souris à bas polling rate, câble Ethernet\n• Évite la caféine juste avant (paradoxalement, peut ajouter du jitter)\n• Entraîne-toi 5 min par jour\n• Tes deux mains : ta main dominante est généralement 5-15 ms plus rapide"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "En FPS, le temps de réaction limite tes peeks, tes contre-flashes, tes para-attaques. Sur Valorant, 30 ms d'écart = la différence entre toucher l'ennemi ou se faire one-tap."
      },
    ],
  },

  gridshot: {
    slug: "gridshot",
    category: "game",
    title: "Gridshot",
    short: "Touche un maximum de cibles statiques en 30 secondes",
    accent: "text-emerald-400",
    sections: [
      {
        title: "Ce que ça entraîne",
        body: "Le target acquisition (vitesse à passer d'une cible à l'autre) et le micro-aim (précision de placement du crosshair). C'est l'un des entraînements les plus connus, popularisé par Kovaak's et Aim Lab."
      },
      {
        title: "Comment ça marche",
        body: "5 cibles vertes apparaissent en permanence dans une zone. Tu cliques le plus vite possible : chaque cible touchée disparaît et une nouvelle apparaît ailleurs. 30 secondes pour faire le max de hits."
      },
      {
        title: "Comprendre ton score",
        body: "• 80+ hits : niveau pro (Aim Lab top 5%)\n• 60–80 : très bon, niveau diamant FPS compétitif\n• 40–60 : moyen, niveau gold/platine\n• <40 : à développer\nLa précision compte aussi : 80 hits avec 95% acc > 90 hits avec 70% acc."
      },
      {
        title: "Pour t'améliorer",
        body: "• Échauffe-toi 5 min sur des cibles plus grosses avant\n• Ajuste ta sensibilité : trop basse = trop lent, trop haute = imprécis\n• Place ton coude comme pivot, pas le poignet pour les grands mouvements\n• Ne snipe pas chaque cible — fais confiance à ton flick et continue\n• Vise le centre des cibles, pas le bord"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Reproduit les situations FPS classiques : team-fight, multi-kill, prefiring. Améliore directement ta capacité à enchaîner les frags rapidement."
      },
    ],
  },

  tracking: {
    slug: "tracking",
    category: "game",
    title: "Tracking",
    short: "Maintiens ton crosshair sur une cible mobile",
    accent: "text-cyan-400",
    sections: [
      {
        title: "Ce que ça entraîne",
        body: "Le tracking continu — capacité à suivre une cible qui bouge tout en maintenant le clic gauche enfoncé. Compétence critique pour les jeux avec armes hitscan automatiques (Overwatch, Apex, Valorant Spectre/Phantom spray)."
      },
      {
        title: "Comment ça marche",
        body: "Une sphère verte se déplace de façon imprévisible dans la zone (rebondit aux murs, change de vitesse). Tu maintiens clic gauche enfoncé et suit la cible. Le score = % du temps où ton crosshair est dans la zone de la cible pendant que tu cliques."
      },
      {
        title: "Comprendre ton score",
        body: "• 70%+ : excellent, niveau pro Overwatch DPS\n• 50–70% : très bon\n• 30–50% : moyen, à travailler\n• <30% : ta sens est probablement mal calibrée"
      },
      {
        title: "Pour t'améliorer",
        body: "• Sensibilité plus basse que pour le flicking pur (range 200-400 eDPI Valorant)\n• Anticipe le mouvement, ne réagis pas à retardement\n• Bouge ton bras complet, pas juste le poignet\n• Respire calmement, le stress crispe le poignet\n• Entraîne 10 min par jour, pas 1h le samedi"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Direct match avec : Soldier 76 / Tracer dans Overwatch, R-99 / Volt dans Apex, spray Phantom dans Valorant, AK dans CS2 (rifle spray control)."
      },
    ],
  },

  flickshot: {
    slug: "flickshot",
    category: "game",
    title: "Flickshot",
    short: "Vise et tire le plus vite possible (15 cibles consécutives)",
    accent: "text-yellow-400",
    sections: [
      {
        title: "Ce que ça entraîne",
        body: "Le flick — mouvement explosif et précis pour amener instantanément ton crosshair sur une cible apparue ailleurs. Compétence #1 des AWP CS2, Operator Valorant, snipers en général."
      },
      {
        title: "Comment ça marche",
        body: "Tu reviens au centre (petit dot jaune visible). Une cible apparaît à une distance et un angle aléatoire. Tu fais ton flick + clic. On mesure le temps entre l'apparition et le hit. 15 shots, moyenne calculée."
      },
      {
        title: "Comprendre ton score",
        body: "• <300 ms : flickeur pro\n• 300–500 ms : très bon\n• 500–800 ms : moyen\n• >800 ms : tu sur-aimes, fais confiance à ton premier mouvement"
      },
      {
        title: "Pour t'améliorer",
        body: "• Sensibilité plus haute pour le flicking (450-600 eDPI Valorant)\n• Bouge ton bras complet pour les grands flicks, pas que le poignet\n• Ne corrige pas — tire dès que tu penses être sur la cible\n• Visualise la cible avant d'amorcer le mouvement\n• Range ta souris au centre du mousepad pour avoir l'espace"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Awp / Operator / Outlaw : ton existence dépend du flick. Aussi pour les peeks rapides en CS2/Valo (peek une window, tap un mec, repli)."
      },
    ],
  },

  cps: {
    slug: "cps",
    category: "game",
    title: "Vitesse de Clic (CPS)",
    short: "Clique le plus vite possible pendant 10 secondes",
    accent: "text-orange-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "Click Per Second — vitesse physique de ton doigt et de ta souris (debounce, switch). Test populaire des joueurs Minecraft PvP."
      },
      {
        title: "Comment ça marche",
        body: "10 secondes, tu cliques le plus vite possible n'importe où dans la zone. Le score est le CPS moyen (clicks ÷ 10)."
      },
      {
        title: "Comprendre ton score",
        body: "• 12+ CPS : très rapide (probablement jitter clicking)\n• 8–12 : bon, niveau Minecraft PvP confirmé\n• 6–8 : normal\n• <6 : ta souris a peut-être un debounce élevé"
      },
      {
        title: "Pour t'améliorer",
        body: "• Pose ton poignet bien à plat sur le bureau\n• Apprend le jitter clicking (vibration contrôlée du bras)\n• Apprend le butterfly clicking (alterne 2 doigts)\n• Souris avec switchs rapides (Razer Optical, Kailh GM 8.0)\n• ⚠️ Ne pas abuser, peut donner tendinite"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Minecraft PvP (Bedwars, Skywars). Aussi pertinent pour les jeux compétitifs où tu spam-click (MOBA last-hit, RTS, fighters). Pour les FPS, peu d'impact direct."
      },
    ],
  },

  microshots: {
    slug: "microshots",
    category: "game",
    title: "Microshots",
    short: "Précision pure sur de très petites cibles (18 px)",
    accent: "text-violet-400",
    sections: [
      {
        title: "Ce que ça entraîne",
        body: "Le micro-aim, fine motor control. C'est Gridshot en mode hard — cibles très petites qui exigent une précision quasi-millimétrique."
      },
      {
        title: "Comment ça marche",
        body: "Identique à Gridshot mais les cibles font 18 pixels au lieu de 60. 4 cibles simultanées, 30 secondes."
      },
      {
        title: "Comprendre ton score",
        body: "• 40+ hits : excellent, signe d'une sens basse maîtrisée\n• 25–40 : très bon\n• 15–25 : moyen\n• <15 : ta sens est probablement trop haute pour ce test"
      },
      {
        title: "Pour t'améliorer",
        body: "• Baisse drastiquement ta sens pour ce test (essaye à 0.5×)\n• Bouge ton bras, pas juste le poignet\n• Vise le pixel central, pas la zone\n• Mousepad qualité (Artisan, Logitech G640) — fait une vraie différence\n• Plus important : la qualité > la quantité, ne spam pas"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Headshots à longue distance dans CS2/Valorant. Snipe sur des têtes peekées (peek-shoulder bug, jiggle peek). Distinction key entre joueurs gold et radiant."
      },
    ],
  },

  strafe: {
    slug: "strafe",
    category: "game",
    title: "Cibles Mobiles (Strafe Targets)",
    short: "Touche des cibles qui se déplacent latéralement",
    accent: "text-sky-400",
    sections: [
      {
        title: "Ce que ça entraîne",
        body: "La prédiction de trajectoire (leading the target) — anticiper où sera la cible quand ta balle arrivera. Et le tracking court combiné au tap shooting."
      },
      {
        title: "Comment ça marche",
        body: "3 cibles vertes se déplacent horizontalement avec des vitesses différentes, rebondissent aux bords. Tu les touches. Combine tracking + flicking, c'est plus dur que Gridshot statique."
      },
      {
        title: "Comprendre ton score",
        body: "• 40+ hits : excellent\n• 25–40 : très bon\n• 15–25 : moyen\n• <15 : tu réagis trop tard, anticipe le mouvement"
      },
      {
        title: "Pour t'améliorer",
        body: "• Vise légèrement DEVANT la cible (lead)\n• Bouge ton crosshair dans la même direction que la cible avant de tirer\n• Ne suis pas chaque mouvement, fais des petits flicks anticipés\n• Reste calme : le panic spam baisse ta précision"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Counter-strafing en CS2/Valorant. Suivre un ennemi qui strafe ou jiggle peek. Apex où les ennemis bougent énormément. Tous les modes battle royale."
      },
    ],
  },

  stroop: {
    slug: "stroop",
    category: "game",
    title: "Test de Stroop",
    short: "Clique la COULEUR du mot, pas le mot lui-même",
    accent: "text-pink-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "L'interférence cognitive — capacité du cerveau à inhiber la réponse automatique (lire le mot) au profit d'une réponse demandée (identifier la couleur). Test psychologique célèbre depuis 1935."
      },
      {
        title: "Comment ça marche",
        body: "Un mot comme \"BLEU\" s'affiche, mais écrit en rouge. Tu dois cliquer le bouton ROUGE, pas le bouton BLEU. Le cerveau lit le mot instinctivement, tu dois résister."
      },
      {
        title: "Comprendre ton score",
        body: "Mesure la précision et le temps moyen par réponse. Plus tu es rapide ET précis, meilleure est ta flexibilité cognitive et ton attention sélective."
      },
      {
        title: "Pour t'améliorer",
        body: "• Concentre-toi sur la couleur, ignore le sens du mot\n• Méditation / mindfulness améliore l'attention sélective\n• Bien dormi = meilleure inhibition cognitive\n• L'âge dégrade le score Stroop (peak à 25 ans)"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Décision sous pression : confondre un coéquipier avec un ennemi (skins similaires), réagir au bon stimulus dans le chaos d'un team-fight, ne pas tilt sur une fausse info."
      },
    ],
  },

  sequence: {
    slug: "sequence",
    category: "game",
    title: "Mémoire Séquence",
    short: "Mémorise et reproduis une séquence croissante",
    accent: "text-indigo-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "La mémoire de travail (working memory) — capacité à retenir et manipuler des infos sur quelques secondes. Test classique inspiré du jeu Simon."
      },
      {
        title: "Comment ça marche",
        body: "L'app illumine des pads dans un ordre. Tu dois reproduire. À chaque manche réussie, la séquence s'allonge d'un pad."
      },
      {
        title: "Comprendre ton score",
        body: "• 10+ : excellent (top 5% population)\n• 7–10 : très bon\n• 5–7 : moyen (capacité standard 7±2 — Miller's Law)\n• <5 : sous la moyenne, fatigue ou distraction probable"
      },
      {
        title: "Pour t'améliorer",
        body: "• Chunking : groupe les éléments par 3 ou 4\n• Visualise un pattern (ex: forme géométrique tracée)\n• Pas de stress, respire profondément\n• Évite les distractions audio/visuelles autour"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Stratégie en MOBA (League, Dota) : retenir les cooldowns ennemis, les positions sur la minimap. RTS : build orders. Mémorisation des callouts d'équipe."
      },
    ],
  },

  visualmatch: {
    slug: "visualmatch",
    category: "game",
    title: "Visual Match",
    short: "Trouve la cible qui correspond au pattern montré",
    accent: "text-teal-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "La reconnaissance visuelle rapide et la prise de décision sous pression. Capacité à scanner plusieurs éléments simultanément et identifier le bon en un coup d'œil."
      },
      {
        title: "Comment ça marche",
        body: "Un pattern (forme + couleur) s'affiche. Plusieurs cibles apparaissent, tu cliques celle qui correspond. Plus c'est rapide et précis, mieux c'est."
      },
      {
        title: "Comprendre ton score",
        body: "Mesure la précision et le temps de réaction visuel. Bon score = haute précision + temps court."
      },
      {
        title: "Pour t'améliorer",
        body: "• Élargis ton champ de vision — ne fixe pas un point\n• Utilise la vision périphérique\n• Pas de tunnel vision : balaye l'écran\n• Pratique : ça s'améliore vite avec l'entraînement"
      },
      {
        title: "Pourquoi c'est utile en jeu",
        body: "Identifier ami / ennemi en team-fight chaotique. Repérer le sniper sur un toit dans Apex. Distinguer les abilities ennemies (Valorant : Sage wall vs Sage slow).",
      },
    ],
  },

  /* ============ HARDWARE TESTS ============ */
  polling: {
    slug: "polling",
    category: "hardware",
    title: "Mouse Polling Rate",
    short: "Mesure la fréquence à laquelle ta souris envoie sa position",
    accent: "text-blue-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "Le polling rate (Hz) de ta souris — nombre de fois par seconde où elle envoie sa position à l'OS. Plus c'est élevé, plus le mouvement est fluide et la latence basse."
      },
      {
        title: "Comment ça marche",
        body: "Tu bouges ta souris rapidement dans la zone. L'app capture chaque événement mousemove et compte combien d'événements arrivent par seconde sur 1-2s de mouvement continu."
      },
      {
        title: "Comprendre ton score",
        body: "• 1000 Hz : standard moderne (la plupart des souris gaming)\n• 4000–8000 Hz : haut de gamme (Razer Viper 8K, Logitech G Pro X Superlight 2)\n• 500 Hz : ancien standard, OK mais latence visible\n• 125 Hz : souris office, à éviter pour le gaming"
      },
      {
        title: "Pour augmenter",
        body: "• Active 1000 Hz dans le logiciel de ta souris (Razer Synapse, Logitech G Hub)\n• Vérifie le câble USB direct au PC (pas via hub)\n• Pour les souris 4K-8K Hz : besoin d'un PC capable de gérer ce débit\n• Plus haut n'est pas toujours mieux : 1000 Hz suffit pour 99% des cas"
      },
      {
        title: "Limitations du test",
        body: "Le browser limite parfois les événements mousemove à ~120-240 Hz selon les optimisations. Pour une mesure 100% précise du polling rate, utilise [MouseTester](https://github.com/microe1/MouseTester)."
      },
    ],
  },

  clicklatency: {
    slug: "clicklatency",
    category: "hardware",
    title: "Click Latency",
    short: "Estime la latence entre signal visuel et clic enregistré",
    accent: "text-amber-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "Le délai total : (signal visuel → cerveau → muscle → switch souris → debounce → OS → app). Combine latence neuro et latence hardware de ta souris."
      },
      {
        title: "Comment ça marche",
        body: "Quand l'app dit \"Go!\", tu cliques. Mesure le temps en ms. Plus c'est bas, mieux c'est."
      },
      {
        title: "Comprendre ton score",
        body: "• <180 ms : excellent (combinaison réflexe + bonne souris)\n• 180–250 ms : normal\n• >250 ms : signe de souris à haute latence (debounce élevé) ou fatigue"
      },
      {
        title: "Pour t'améliorer",
        body: "• Souris à switchs optiques (Razer Viper, Logitech G Pro X) : 0 ms debounce\n• Désactive 'mouse click delay' dans Windows\n• Polling rate à 1000 Hz minimum\n• Câble USB direct, pas en wifi/dongle si possible"
      },
      {
        title: "Difference avec Reaction Time",
        body: "Reaction Time mesure ta latence neurologique pure. Click Latency ajoute le délai hardware/OS de ta souris. Si Reaction = 200 ms et Click Latency = 230 ms, ta souris ajoute ~30 ms."
      },
    ],
  },

  monitorhz: {
    slug: "monitorhz",
    category: "hardware",
    title: "Monitor Refresh Rate",
    short: "Mesure le vrai refresh rate de ton écran",
    accent: "text-fuchsia-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "Le refresh rate (Hz) réel de ton écran — combien d'images par seconde il peut afficher. Mesuré via `requestAnimationFrame()` qui se cale sur la VSync."
      },
      {
        title: "Comment ça marche",
        body: "L'app compte combien de frames sont rendues en 2 secondes via rAF. Si tu as un 144 Hz, tu verras ~288 frames sur 2s = 144 Hz. Si Windows est mal configuré à 60 Hz, tu verras 120 frames même avec un écran 144 Hz."
      },
      {
        title: "Comprendre ton score",
        body: "• 60 Hz : vieux moniteurs ou laptops basiques\n• 75/100 Hz : transition, peu commun\n• 120/144 Hz : standard gaming (sweet spot perf/prix)\n• 165/180 Hz : haut de gamme, à peine différent de 144\n• 240 Hz : esport compétitif (Valorant pro)\n• 360/480 Hz : pro AWP CS2"
      },
      {
        title: "Comment activer le Hz max",
        body: "1. Clic droit Bureau → Paramètres d'affichage\n2. Paramètres d'affichage avancés\n3. Propriétés de la carte d'affichage → onglet Moniteur\n4. Sélectionne la fréquence max\n→ Si pas dispo : câble HDMI 2.0/DisplayPort 1.2+ requis pour 144 Hz à 1080p"
      },
      {
        title: "Pourquoi c'est crucial en jeu",
        body: "L'écran est ton seul moyen de voir le jeu. Un 60 Hz limite ta latence à 16.6 ms minimum, un 240 Hz descend à 4.16 ms — différence énorme en compétitif."
      },
    ],
  },

  network: {
    slug: "network",
    category: "hardware",
    title: "Speed Test Gaming",
    short: "Latence, jitter, packet loss vers les serveurs de jeu",
    accent: "text-emerald-400",
    sections: [
      {
        title: "Ce que ça teste",
        body: "La qualité de ta connexion vers 23 serveurs de jeu (Riot/Valorant/LoL, Epic/Fortnite, Steam/CS2, Discord, Battle.net, Xbox, PSN). Mesure latence, jitter et packet loss via requêtes HTTPS."
      },
      {
        title: "Comment ça marche",
        body: "Pour chaque serveur, l'app envoie 5 requêtes HTTPS HEAD et mesure :\n• **Latence** : temps moyen d'aller-retour\n• **Jitter** : écart-type (stabilité de la latence)\n• **Packet loss** : % de requêtes qui timeout\n• Plus un test de bandwidth via Cloudflare (10 MB download)"
      },
      {
        title: "Comprendre les seuils gaming",
        body: "**Latence** :\n• <20 ms : pro\n• 20–50 ms : smooth compétitif\n• 50–100 ms : jouable\n• >150 ms : laggy\n\n**Jitter** :\n• <5 ms : stable\n• >20 ms : erratique\n\n**Packet loss** :\n• 0% : parfait\n• >2% : contacte ton FAI"
      },
      {
        title: "Améliorer ta connexion",
        body: "• Câble Ethernet > WiFi (latence x2-3 plus stable)\n• Routeur récent (Wi-Fi 6/6E si tu dois rester en sans-fil)\n• Pas de VPN sauf si nécessaire (ajoute 10-30 ms)\n• Choisis le serveur le plus proche (région auto-sélectionnée dans Valo/LoL)\n• Ferme les apps qui DL en arrière-plan (Steam updates, OneDrive sync)"
      },
      {
        title: "Limites du test",
        body: "Les mesures HTTPS ajoutent ~10-20 ms vs un ping ICMP natif (à cause du TLS handshake). Donc ton ping in-game Valorant sera typiquement plus bas que ce que tu vois ici. Mais la comparaison entre régions est précise."
      },
    ],
  },
};

export function getExplanation(slug: string): Explanation | null {
  return EXPLANATIONS[slug] ?? null;
}
