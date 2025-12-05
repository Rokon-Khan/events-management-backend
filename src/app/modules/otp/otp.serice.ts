import { getRedis } from "../../utils/redis.config";

function key(email: string, purpose: string): string {
  return `otp:${purpose}:${email.toLowerCase()}`;
}

export async function storeOTP(
  email: string,
  purpose: "email_verification" | "password_reset",
  otp: string,
  ttlSec: number
): Promise<void> {
  const redis = getRedis();
  // node-redis v4 automatically returns a promise
  await redis.set(key(email, purpose), otp, { EX: ttlSec });
}

export async function verifyOTP(
  email: string,
  purpose: "email_verification" | "password_reset",
  otp: string
): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(key(email, purpose));
  if (!stored) return false;
  const match = stored === otp;
  if (match) await redis.del(key(email, purpose));
  return match;
}

export async function resendAllowed(
  _email: string,
  _purpose: string
): Promise<boolean> {
  // Implement rate-limiting if needed using INCR + EX
  return true;
}
