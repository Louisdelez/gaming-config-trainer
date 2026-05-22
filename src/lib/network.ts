/* ============================================================
   Network probing — HTTP-based latency (proxy for ICMP ping)
   ============================================================ */

export interface GameServer {
  game: string;          // e.g., "Valorant / LoL"
  region: string;        // e.g., "EU West"
  city?: string;         // e.g., "Frankfurt"
  url: string;           // HTTPS endpoint
}

/** Curated public HTTPS endpoints for gaming networks (use HEAD ping). */
export const GAME_SERVERS: GameServer[] = [
  // Riot Games (Valorant + LoL) — regional API endpoints
  { game: "Valorant / LoL", region: "EU West (EUW)",     city: "Amsterdam",  url: "https://euw1.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "EU Nordic (EUNE)",  city: "Stockholm",  url: "https://eun1.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "Turkey (TR)",       city: "Istanbul",   url: "https://tr1.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "Russia (RU)",       city: "Moscow",     url: "https://ru.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "North America (NA)", city: "Chicago",   url: "https://na1.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "Brazil (BR)",       city: "São Paulo",  url: "https://br1.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "LAN",               city: "Mexico City",url: "https://la1.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "LAS",               city: "Santiago",   url: "https://la2.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "Korea (KR)",        city: "Seoul",      url: "https://kr.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "Japan (JP)",        city: "Tokyo",      url: "https://jp1.api.riotgames.com/" },
  { game: "Valorant / LoL", region: "Oceania (OCE)",     city: "Sydney",     url: "https://oc1.api.riotgames.com/" },

  // Epic Games (Fortnite)
  { game: "Fortnite (Epic)", region: "Global Auth",  url: "https://account-public-service-prod.ol.epicgames.com/" },
  { game: "Fortnite (Epic)", region: "Lightswitch",  url: "https://lightswitch-public-service-prod.ol.epicgames.com/" },
  { game: "Fortnite (Epic)", region: "Tracking",     url: "https://tracking.epicgames.com/" },

  // Steam (CS2, Dota 2, etc.)
  { game: "Steam / CS2",    region: "API",    url: "https://api.steampowered.com/" },
  { game: "Steam / CS2",    region: "Store",  url: "https://store.steampowered.com/" },
  { game: "Steam / CS2",    region: "CDN EU", url: "https://steamcdn-a.akamaihd.net/" },

  // Discord (voice)
  { game: "Discord",        region: "Global", url: "https://discord.com/" },
  { game: "Discord",        region: "Gateway", url: "https://gateway.discord.gg/" },

  // Battle.net (WoW, Overwatch, Diablo)
  { game: "Battle.net",     region: "US",     url: "https://us.battle.net/" },
  { game: "Battle.net",     region: "EU",     url: "https://eu.battle.net/" },

  // Xbox Live
  { game: "Xbox Live",      region: "Global", url: "https://login.live.com/" },

  // PlayStation Network
  { game: "PlayStation",    region: "Global", url: "https://store.playstation.com/" },

  // General reference points
  { game: "Reference",      region: "Cloudflare", url: "https://www.cloudflare.com/" },
  { game: "Reference",      region: "Google",     url: "https://www.google.com/" },
];

export interface PingResult {
  server: GameServer;
  samples: number[];   // ms per sample (failed samples NOT included)
  avg: number;         // ms
  min: number;
  max: number;
  jitter: number;      // stddev
  loss: number;        // 0-100
}

/** One HTTP HEAD request — returns ms or null on failure */
async function probeOnce(url: string, timeoutMs = 4000): Promise<number | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = performance.now();
  try {
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl.signal,
      // small bytes if server supports range
      headers: { "Range": "bytes=0-0" },
    });
    return performance.now() - start;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Run N samples sequentially, return stats. */
export async function pingServer(server: GameServer, samples = 5): Promise<PingResult> {
  // Warm-up (DNS + TLS handshake) — discard
  await probeOnce(server.url, 4000);

  const ok: number[] = [];
  let lost = 0;
  for (let i = 0; i < samples; i++) {
    const ms = await probeOnce(server.url, 4000);
    if (ms == null) lost++;
    else ok.push(ms);
    await new Promise((r) => setTimeout(r, 150));
  }
  if (ok.length === 0) {
    return { server, samples: [], avg: -1, min: -1, max: -1, jitter: -1, loss: 100 };
  }
  const avg = ok.reduce((a, b) => a + b, 0) / ok.length;
  const min = Math.min(...ok);
  const max = Math.max(...ok);
  const variance = ok.reduce((acc, x) => acc + (x - avg) ** 2, 0) / ok.length;
  const jitter = Math.sqrt(variance);
  const loss = (lost / samples) * 100;
  return { server, samples: ok, avg, min, max, jitter, loss };
}

/* ============================================================
   Download speed test — Cloudflare's __down endpoint
   ============================================================ */

export interface SpeedResult {
  mbps: number;
  bytes: number;
  seconds: number;
}

export async function testDownload(bytes = 10_000_000): Promise<SpeedResult> {
  const url = `https://speed.cloudflare.com/__down?bytes=${bytes}&t=${Date.now()}`;
  const start = performance.now();
  const res = await fetch(url, { cache: "no-store" });
  // Stream-consume to ensure we time the full download
  const reader = res.body?.getReader();
  let received = 0;
  if (reader) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) received += value.byteLength;
    }
  } else {
    const blob = await res.blob();
    received = blob.size;
  }
  const seconds = (performance.now() - start) / 1000;
  const mbps = (received * 8) / (seconds * 1_000_000);
  return { mbps, bytes: received, seconds };
}

/* ============================================================
   Quality assessment based on common gaming guidelines
   ============================================================ */

export type Grade = "excellent" | "good" | "ok" | "poor" | "bad";

export function gradeLatency(ms: number): Grade {
  if (ms < 0) return "bad";
  if (ms < 20)  return "excellent";
  if (ms < 50)  return "good";
  if (ms < 100) return "ok";
  if (ms < 150) return "poor";
  return "bad";
}

export function gradeJitter(ms: number): Grade {
  if (ms < 0) return "bad";
  if (ms < 5)  return "excellent";
  if (ms < 10) return "good";
  if (ms < 20) return "ok";
  if (ms < 30) return "poor";
  return "bad";
}

export function gradeLoss(pct: number): Grade {
  if (pct === 0)  return "excellent";
  if (pct < 1)   return "good";
  if (pct < 2)   return "ok";
  if (pct < 5)   return "poor";
  return "bad";
}

export function gradeDownload(mbps: number): Grade {
  if (mbps >= 100) return "excellent";
  if (mbps >= 25)  return "good";
  if (mbps >= 10)  return "ok";
  if (mbps >= 3)   return "poor";
  return "bad";
}

export const GRADE_COLOR: Record<Grade, string> = {
  excellent: "#1ed760",
  good:      "#67d3a0",
  ok:        "#ffa42b",
  poor:      "#ff7a45",
  bad:       "#f3727f",
};

export const GRADE_LABEL: Record<Grade, string> = {
  excellent: "Excellent",
  good:      "Bon",
  ok:        "Correct",
  poor:      "Médiocre",
  bad:       "Mauvais",
};
