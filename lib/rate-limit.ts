const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 20; // 20 AI calls per minute per IP

export function checkRateLimit(identifier: string): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = requests.get(identifier);

  if (!entry || entry.resetAt <= now) {
    requests.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_PER_WINDOW - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { ok: true, remaining: MAX_PER_WINDOW - entry.count, resetAt: entry.resetAt };
}
