// Adapter-agnostic env: Workers via ctx.cloudflare.env; dev/Vercel via process.env

type Query = {
  q: string;
  period: number; // days
  minViews: number;
  videoType: "all" | "shorts" | "long";
  subscriberUpper?: number;
  order: "date" | "relevance" | "viewCount";
  pages: number;
};

type Env = {
  DB?: D1Database;
  YOUTUBE_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
};

function parseQuery(req: Request): Query | { error: string } {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return { error: "q is required" };

  const period = Number(url.searchParams.get("period") ?? "30");
  const minViews = Number(url.searchParams.get("minViews") ?? "10000");
  const videoTypeParam = (
    url.searchParams.get("videoType") ?? "all"
  ).toLowerCase();
  const videoType = ["all", "shorts", "long"].includes(videoTypeParam)
    ? (videoTypeParam as Query["videoType"])
    : "all";
  const subscriberUpperRaw = url.searchParams.get("subscriberUpper");
  const subscriberUpper = subscriberUpperRaw
    ? Number(subscriberUpperRaw)
    : undefined;
  const orderParam = (url.searchParams.get("order") ?? "viewCount").toString();
  const order = (["date", "relevance", "viewCount"] as const).includes(
    orderParam as any
  )
    ? (orderParam as Query["order"])
    : "viewCount";
  const pagesParam = Number(url.searchParams.get("pages") ?? "3");
  const pages = Math.max(1, Math.min(5, isNaN(pagesParam) ? 3 : pagesParam));

  return {
    q,
    period,
    minViews,
    videoType,
    subscriberUpper,
    order,
    pages,
  } as Query;
}

function stableKey(q: Query): string {
  return `q:${q.q}\nperiod:${q.period}\nminViews:${q.minViews}\nvideoType:${
    q.videoType
  }\nsubUpper:${q.subscriberUpper ?? ""}\norder:${q.order}\npages:${q.pages}`;
}

function parseISODurationToSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const mi = m[2] ? parseInt(m[2], 10) : 0;
  const s = m[3] ? parseInt(m[3], 10) : 0;
  return h * 3600 + mi * 60 + s;
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

async function verifyTurnstile(
  secret: string | undefined,
  token: string | null,
  ip: string | undefined
): Promise<boolean> {
  if (!secret) return true; // If not configured, bypass in dev.
  if (!token) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: ip ?? "",
        }),
      }
    );
    const json: any = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}

function getIPFromHeaders(req: Request): string | undefined {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

async function rateLimit(
  DB: D1Database | undefined,
  ip: string | undefined,
  limit = 60,
  windowSec = 3600
): Promise<{ ok: boolean; remaining?: number }> {
  if (!DB || !ip) return { ok: true };
  const now = Math.floor(Date.now() / 1000);
  const since = now - windowSec;
  try {
    const row = await DB.prepare(
      "SELECT COUNT(*) as c FROM usage_log WHERE ip = ? AND created_at > ?"
    )
      .bind(ip, since)
      .first<{ c: number }>();
    const count = Number(row?.c ?? 0);
    if (count >= limit) return { ok: false, remaining: 0 };
    return { ok: true, remaining: Math.max(0, limit - count - 1) };
  } catch {
    return { ok: true };
  }
}

export async function GET(req: Request, ctx?: any) {
  // Env and bindings resolution for Workers (ctx) or dev/Vercel (process.env)
  let env: Env = (ctx as any)?.cloudflare?.env ?? {};
  const DB = env.DB;
  const overrideKey = req.headers.get('x-youtube-api-key')?.trim() || undefined;
  const YT_KEY = overrideKey || env.YOUTUBE_API_KEY || (globalThis as any).process?.env?.YOUTUBE_API_KEY;
  const TS_SECRET =
    env.TURNSTILE_SECRET_KEY ||
    (globalThis as any).process?.env?.TURNSTILE_SECRET_KEY;

  // Parse
  const parsed = parseQuery(req);
  if ("error" in parsed) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const query = parsed as Query;
  const cacheKey = stableKey(query);

  // Turnstile
  const ip = getIPFromHeaders(req);
  const tsToken = req.headers.get("x-turnstile-token");
  const tsOk = await verifyTurnstile(TS_SECRET, tsToken, ip);
  if (!tsOk) {
    return Response.json({ error: "turnstile_failed" }, { status: 400 });
  }

  // Rate limit
  const rl = await rateLimit(DB, ip, 60, 3600);
  if (!rl.ok) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  // Try cache (TTL 6h)
  if (DB) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const ttl = 21600; // 6 hours
      const stmt = await DB.prepare(
        `SELECT result_json, created_at, ttl_seconds FROM query_cache WHERE key = ?`
      )
        .bind(cacheKey)
        .first<{
          result_json: string;
          created_at: number;
          ttl_seconds: number;
        }>();
      if (stmt && now - stmt.created_at < (stmt.ttl_seconds ?? ttl)) {
        return new Response(stmt.result_json, {
          headers: { "content-type": "application/json", "x-cache": "HIT" },
        });
      }
    } catch {}
  }

  if (!YT_KEY) {
    return Response.json({ error: "missing_api_key" }, { status: 500 });
  }

  // Period window
  const now = new Date();
  const publishedAfter = new Date(
    now.getTime() - query.period * 24 * 60 * 60 * 1000
  );

  // 1) search.list to get candidate IDs with pagination
  let videoIds: string[] = [];
  let nextPageToken: string | undefined;
  for (let page = 0; page < query.pages; page++) {
    const searchParams = new URLSearchParams({
      key: YT_KEY,
      part: "id",
      q: query.q,
      type: "video",
      maxResults: "50",
      order: query.order,
      publishedAfter: publishedAfter.toISOString(),
    });
    if (nextPageToken) searchParams.set("pageToken", nextPageToken);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      return Response.json(
        { error: "search_failed", status: searchRes.status },
        { status: 502 }
      );
    }
    const searchJson: any = await searchRes.json();
    const idsThisPage: string[] = (searchJson.items ?? [])
      .map((it: any) => it.id?.videoId)
      .filter(Boolean);
    for (const id of idsThisPage) {
      if (!videoIds.includes(id)) videoIds.push(id);
    }
    nextPageToken = searchJson.nextPageToken;
    if (!nextPageToken) break;
    if (videoIds.length >= 150) break; // cap
  }
  if (videoIds.length === 0) {
    const empty = { items: [], cached: false, meta: query };
    const body = JSON.stringify(empty);
    if (DB) {
      const ts = Math.floor(Date.now() / 1000);
      await DB.prepare(
        `INSERT OR REPLACE INTO query_cache (key, params, result_json, created_at, ttl_seconds) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(cacheKey, JSON.stringify(query), body, ts, 21600)
        .run();
    }
    return Response.json(empty, { headers: { "x-cache": "MISS" } });
  }

  // 2) videos.list for stats and durations (batch in chunks of 50)
  const videoItems: any[] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const videosParams = new URLSearchParams({
      key: YT_KEY,
      part: "snippet,contentDetails,statistics",
      id: batch.join(","),
      maxResults: "50",
    });
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?${videosParams}`;
    const videosRes = await fetch(videosUrl);
    if (!videosRes.ok) {
      return Response.json(
        { error: "videos_failed", status: videosRes.status },
        { status: 502 }
      );
    }
    const videosJson: any = await videosRes.json();
    for (const it of videosJson.items ?? []) videoItems.push(it);
  }

  // Filter by minViews and type
  const filtered = videoItems.filter((v) => {
    const views = Number(v.statistics?.viewCount ?? 0);
    if (views < query.minViews) return false;
    const durSec = parseISODurationToSeconds(
      v.contentDetails?.duration ?? "PT0S"
    );
    const isShort = durSec > 0 && durSec <= 60;
    if (query.videoType === "shorts" && !isShort) return false;
    if (query.videoType === "long" && isShort) return false;
    return true;
  });

  // 3) channels.list for subscriberCount, with D1 cache
  const channelIds = Array.from(
    new Set(filtered.map((v) => v.snippet?.channelId).filter(Boolean))
  );
  let subscribersMap: Record<string, number> = {};
  if (DB && channelIds.length) {
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const ttl = 172800; // 48h
      // Load cached
      const placeholders = channelIds.map(() => "?").join(",");
      const cachedRows = await DB.prepare(
        `SELECT channel_id, subscriber_count, fetched_at, ttl_seconds FROM channel_cache WHERE channel_id IN (${placeholders})`
      )
        .bind(...channelIds)
        .all<{
          channel_id: string;
          subscriber_count: number;
          fetched_at: number;
          ttl_seconds: number;
        }>();
      const freshIds = new Set(channelIds);
      for (const r of cachedRows.results ?? []) {
        if (r && nowSec - (r.fetched_at ?? 0) < (r.ttl_seconds ?? ttl)) {
          subscribersMap[r.channel_id] = Number(r.subscriber_count ?? 0) || 0;
          freshIds.delete(r.channel_id);
        }
      }
      const missing = Array.from(freshIds);
      if (missing.length) {
        // Fetch in batches of 50
        for (let i = 0; i < missing.length; i += 50) {
          const batch = missing.slice(i, i + 50);
          const chParams = new URLSearchParams({
            key: YT_KEY,
            part: "statistics",
            id: batch.join(","),
          });
          const chUrl = `https://www.googleapis.com/youtube/v3/channels?${chParams}`;
          const chRes = await fetch(chUrl);
          if (chRes.ok) {
            const chJson: any = await chRes.json();
            for (const c of chJson.items ?? []) {
              const cid = c.id;
              const subs = Number(c.statistics?.subscriberCount ?? 0) || 0;
              subscribersMap[cid] = subs;
              await DB.prepare(
                `INSERT OR REPLACE INTO channel_cache (channel_id, subscriber_count, fetched_at, ttl_seconds) VALUES (?, ?, ?, ?)`
              )
                .bind(cid, subs, nowSec, ttl)
                .run();
            }
          }
        }
      }
    } catch {}
  } else if (channelIds.length) {
    // No DB, fetch directly without caching
    for (let i = 0; i < channelIds.length; i += 50) {
      const batch = channelIds.slice(i, i + 50);
      const chParams = new URLSearchParams({
        key: YT_KEY,
        part: "statistics",
        id: batch.join(","),
      });
      const chUrl = `https://www.googleapis.com/youtube/v3/channels?${chParams}`;
      const chRes = await fetch(chUrl);
      if (chRes.ok) {
        const chJson: any = await chRes.json();
        for (const c of chJson.items ?? []) {
          const cid = c.id;
          const subs = Number(c.statistics?.subscriberCount ?? 0) || 0;
          subscribersMap[cid] = subs;
        }
      }
    }
  }

  // Build result items with scoring
  const items = filtered
    .map((v) => {
      const id = v.id;
      const title = v.snippet?.title ?? "";
      const channelId = v.snippet?.channelId ?? "";
      const channelTitle = v.snippet?.channelTitle ?? "";
      const thumbnailUrl =
        v.snippet?.thumbnails?.medium?.url ||
        v.snippet?.thumbnails?.default?.url ||
        "";
      const views = Number(v.statistics?.viewCount ?? 0);
      const subs = subscribersMap[channelId] ?? null;
      const publishedAt = v.snippet?.publishedAt ?? new Date().toISOString();
      const durSec = parseISODurationToSeconds(
        v.contentDetails?.duration ?? "PT0S"
      );
      const isShort = durSec > 0 && durSec <= 60;
      const days = daysBetween(new Date(), new Date(publishedAt));
      const vsr = subs ? views / Math.max(subs, 100) : views / 100;
      const recency = Math.exp(-days / 14);
      const score = vsr * (1 + recency);
      const viewsPerDay = days > 0 ? views / days : views;
      return {
        id,
        title,
        channelId,
        channelTitle,
        thumbnailUrl,
        views,
        subscribers: subs,
        publishedAt,
        isShort,
        vsr,
        score,
        viewsPerDay,
      };
    })
    .filter((v) =>
      query.subscriberUpper
        ? (v.subscribers ?? Infinity) <= query.subscriberUpper
        : true
    )
    .sort((a, b) => b.score - a.score);

  const result = { items, cached: false, meta: query };
  const body = JSON.stringify(result);

  if (DB) {
    try {
      const ts = Math.floor(Date.now() / 1000);
      await DB.prepare(
        `INSERT OR REPLACE INTO query_cache (key, params, result_json, created_at, ttl_seconds) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(cacheKey, JSON.stringify(query), body, ts, 21600)
        .run();
      // Log usage
      await DB.prepare(
        `INSERT INTO usage_log (ip, query_key, ok, created_at) VALUES (?, ?, ?, ?)`
      )
        .bind(ip ?? null, cacheKey, 1, ts)
        .run();
    } catch {}
  }

  return new Response(body, {
    headers: { "content-type": "application/json", "x-cache": "MISS" },
  });
}
