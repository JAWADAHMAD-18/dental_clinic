/**
 * lib/ratelimit.ts
 *
 * Upstash Redis rate-limit helpers.
 * Chat: 20 messages per IP per hour, global 500 per day.
 * Enquiry: 3 per IP per hour.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

function makeRedis() {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set"
    );
  }
  return new Redis({ url, token });
}

let _redis: Redis | null = null;
function redis() {
  if (!_redis) _redis = makeRedis();
  return _redis;
}

/** 20 chat messages per IP per hour */
export function chatIpLimiter() {
  return new Ratelimit({
    redis: redis(),
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "rl:chat:ip",
  });
}

/** 500 chat messages globally per day */
export function chatGlobalLimiter() {
  return new Ratelimit({
    redis: redis(),
    limiter: Ratelimit.slidingWindow(500, "1 d"),
    prefix: "rl:chat:global",
  });
}

/** 3 enquiries per IP per hour */
export function enquiryIpLimiter() {
  return new Ratelimit({
    redis: redis(),
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:enquiry:ip",
  });
}
