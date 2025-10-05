import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate Limiting Configuration
 * Uses Upstash Redis for distributed rate limiting
 *
 * Strategy: Sliding window - 5 attempts per hour per email
 * This prevents brute-force attacks on login/registration
 */

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter for authentication attempts
 * 5 attempts per hour per email address
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "auth_ratelimit",
});

/**
 * Check if an email has exceeded rate limit
 * @param email - The email address to check
 * @returns Object with { success: boolean, remaining: number, reset: Date }
 */
export async function checkAuthRateLimit(email: string): Promise<{
  success: boolean;
  remaining: number;
  reset: Date;
}> {
  const identifier = `auth:${email.toLowerCase()}`;
  const { success, remaining, reset } = await authRateLimiter.limit(identifier);

  return {
    success,
    remaining,
    reset: new Date(reset),
  };
}

/**
 * Reset rate limit for an email (e.g., after successful login)
 * @param email - The email address to reset
 */
export async function resetAuthRateLimit(email: string): Promise<void> {
  const identifier = `auth:${email.toLowerCase()}`;
  // Upstash doesn't have a direct reset, so we'd need to wait for expiry
  // Or manually delete the key (not recommended for sliding window)
  // For now, this is a placeholder for future implementation
  await redis.del(`auth_ratelimit:${identifier}`);
}

/**
 * Generic rate limiter factory
 * Use this to create custom rate limiters for other features
 */
export function createRateLimiter(
  requests: number,
  window: Duration,
  prefix: string,
) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  });
}
