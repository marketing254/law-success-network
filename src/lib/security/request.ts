import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Salted hash of the client IP. The raw IP is NEVER stored.
 *
 * IP_HASH_SALT must be stable forever: rotating it orphans every hash already
 * in the database and silently breaks duplicate/abuse detection.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || process.env.SIGNUP_IP_SALT;
  if (!salt) {
    console.warn("[security] IP_HASH_SALT is not set — skipping IP hashing.");
    return null;
  }
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || null;
}

export function requestFingerprint(req: NextRequest) {
  return {
    ip_hash: hashIp(clientIp(req)),
    user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
  };
}
