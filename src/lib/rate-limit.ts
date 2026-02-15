/**
 * Simple in-memory IP-based rate limit for public API routes.
 * Resets on serverless cold start; sufficient for abuse hygiene. For stricter
 * limits across instances, use Upstash Redis or similar.
 */

const WINDOW_MS = 60 * 1000; // 1 minute

const pledgeTimestamps: Map<string, number[]> = new Map();
const intakeTimestamps: Map<string, number[]> = new Map();

const MAX_PLEDGES_PER_WINDOW = 10;
const MAX_INTAKE_PER_WINDOW = 5;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  return ip;
}

function pruneOld(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((t) => t > cutoff);
}

export function checkPledgeRateLimit(request: Request): { ok: true } | { ok: false; status: 429 } {
  const ip = getClientIp(request);
  const now = Date.now();
  let times = pledgeTimestamps.get(ip) ?? [];
  times = pruneOld(times, WINDOW_MS);
  if (times.length >= MAX_PLEDGES_PER_WINDOW) {
    return { ok: false, status: 429 };
  }
  times.push(now);
  pledgeTimestamps.set(ip, times);
  return { ok: true };
}

export function checkIntakeRateLimit(request: Request): { ok: true } | { ok: false; status: 429 } {
  const ip = getClientIp(request);
  const now = Date.now();
  let times = intakeTimestamps.get(ip) ?? [];
  times = pruneOld(times, WINDOW_MS);
  if (times.length >= MAX_INTAKE_PER_WINDOW) {
    return { ok: false, status: 429 };
  }
  times.push(now);
  intakeTimestamps.set(ip, times);
  return { ok: true };
}
