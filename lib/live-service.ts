import { db } from "@/lib/db"
import { CACHE_KEYS, CACHE_TTL, getCachedData, setCachedData, invalidateCache } from "@/lib/redis"

export async function getLiveSessionById(sessionId: string) {
  try {
    const liveSession = await db.liveSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return liveSession
  } catch (error) {
    console.error("Error fetching live session:", error)
    return null
  }
}

export async function getUpcomingLiveSessions() {
  try {
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.UPCOMING_LIVE_SESSIONS
    const cachedSessions = await getCachedData(cacheKey)

    if (cachedSessions) {
      return cachedSessions
    }

    const now = new Date()

    const liveSessions = await db.liveSession.findMany({
      where: {
        scheduledFor: {
          gte: now,
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    })

    // Cache the results
    await setCachedData(cacheKey, liveSessions, CACHE_TTL.LIVE_SESSIONS)

    return liveSessions
  } catch (error) {
    console.error("Error fetching upcoming live sessions:", error)
    return []
  }
}

export async function getInstructorLiveSessions(instructorId: string) {
  try {
    const liveSessions = await db.liveSession.findMany({
      where: {
        instructorId,
      },
      orderBy: {
        scheduledFor: "desc",
      },
    })

    return liveSessions
  } catch (error) {
    console.error("Error fetching instructor live sessions:", error)
    return []
  }
}

export async function getUserLiveSessions(userId: string) {
  try {
    // In a real app, this would fetch live sessions the user has registered for
    // For now, we'll just return all upcoming sessions
    const now = new Date()

    const liveSessions = await db.liveSession.findMany({
      where: {
        scheduledFor: {
          gte: now,
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    })

    return liveSessions
  } catch (error) {
    console.error("Error fetching user live sessions:", error)
    return []
  }
}

export async function createLiveSession(
  instructorId: string,
  data: {
    title: string
    description?: string
    scheduledFor: Date
    courseId?: string
    youtubeLiveId: string
    streamKey?: string
  },
) {
  try {
    // Create live session in database
    const liveSession = await db.liveSession.create({
      data: {
        title: data.title,
        description: data.description,
        scheduledFor: data.scheduledFor,
        instructorId,
        youtubeLiveId: data.youtubeLiveId,
        streamKey: data.streamKey,
        ...(data.courseId && { courseId: data.courseId }),
      },
    })

    // Invalidate cache
    await invalidateCache(CACHE_KEYS.UPCOMING_LIVE_SESSIONS)
    await invalidateCache(CACHE_KEYS.LIVE_SESSIONS)

    return liveSession
  } catch (error) {
    console.error("Error creating live session:", error)
    throw error
  }
}

