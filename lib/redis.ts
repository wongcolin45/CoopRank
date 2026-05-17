import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const TRACK_IDS = ["cracked", "systems", "quant", "cloud", "swe", "health", "ai"] as const;
export type TrackId = typeof TRACK_IDS[number];

export const ratingsKey = (trackId: string) => `cooprank:ratings:${trackId}`;
export const votesKey = (trackId: string) => `cooprank:votes:${trackId}`;
