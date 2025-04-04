import { db } from "@/lib/db"
import { CACHE_KEYS, invalidateCache } from "@/lib/redis"

export async function isUserEnrolled(userId: string, courseId: string) {
  try {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    return !!enrollment
  } catch (error) {
    console.error("Error checking enrollment:", error)
    return false
  }
}

export async function enrollUserInCourse(userId: string, courseId: string) {
  try {
    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return existingEnrollment
    }

    // Create new enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
      },
    })

    // Invalidate cache
    await invalidateCache(CACHE_KEYS.USER_COURSES(userId))

    return enrollment
  } catch (error) {
    console.error("Error enrolling user in course:", error)
    return null
  }
}

export async function getUserEnrollments(userId: string) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return enrollments
  } catch (error) {
    console.error("Error fetching user enrollments:", error)
    return []
  }
}

