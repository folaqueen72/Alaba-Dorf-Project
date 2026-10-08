// Minimal abuse protection for public endpoints (order spam can otherwise
// reserve all stock with fake orders). In-memory per-instance sliding window:
// good enough for this scale; upgrade to Redis/Upstash if abuse appears.
const hits = new Map<string, number[]>();

export function rateLimit(
  req: Request,
  opts: { key: string; limit: number; windowMs: number }
): Response | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const mapKey = `${opts.key}:${ip}`;
  const now = Date.now();
  const windowStart = now - opts.windowMs;
  const times = (hits.get(mapKey) ?? []).filter((t) => t > windowStart);
  if (times.length >= opts.limit) {
    return Response.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429 }
    );
  }
  times.push(now);
  hits.set(mapKey, times);
  // Prevent unbounded growth.
  if (hits.size > 5000) hits.clear();
  return null;
}

export const WRITE_LIMIT = { limit: 20, windowMs: 60_000 };
export const READ_LIMIT = { limit: 60, windowMs: 60_000 };
