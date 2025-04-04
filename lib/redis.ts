import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export default redis

// Cache keys
export const CACHE_KEYS = {
  COURSE: (id: string) => `course:${id}`,
  COURSES: "courses",
  LESSON: (id: string) => `lesson:${id}`,
  USER_COURSES: (userId: string) => `user:${userId}:courses`,
  YOUTUBE_VIDEO: (videoId: string) => `youtube:video:${videoId}`,
  LIVE_SESSIONS: "live-sessions",
  UPCOMING_LIVE_SESSIONS: "upcoming-live-sessions",
}

// Cache TTLs in seconds
export const CACHE_TTL = {
  COURSE: 60 * 60, // 1 hour
  COURSES: 60 * 5, // 5 minutes
  LESSON: 60 * 60, // 1 hour
  USER_COURSES: 60 * 5, // 5 minutes
  YOUTUBE_VIDEO: 60 * 60 * 24, // 24 hours
  LIVE_SESSIONS: 60 * 5, // 5 minutes
}

// Cache helper functions
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data as T
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function setCachedData<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    await redis.setex(key, ttl, data)
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error("Redis delete pattern error:", error)
  }
}

