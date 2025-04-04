import { db } from "@/lib/db"
import { CACHE_KEYS, CACHE_TTL, getCachedData, setCachedData, invalidateCache } from "@/lib/redis"
import { getYouTubeVideoDetails } from "@/lib/youtube-api"
import type { Course } from "@/lib/db-schema"

export async function getCourses(query?: string) {
  try {
    // Try to get from cache first
    const cacheKey = query ? `${CACHE_KEYS.COURSES}:${query}` : CACHE_KEYS.COURSES
    const cachedCourses = await getCachedData<Course[]>(cacheKey)

    if (cachedCourses) {
      return cachedCourses
    }

    const courses = await db.course.findMany({
      where: {
        isApproved: true,
        ...(query
          ? {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  category: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Cache the results
    await setCachedData(cacheKey, courses, CACHE_TTL.COURSES)

    return courses
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

export async function getCourseById(courseId: string) {
  try {
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.COURSE(courseId)
    const cachedCourse = await getCachedData<Course>(cacheKey)

    if (cachedCourse) {
      return cachedCourse
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    if (course) {
      // Cache the result
      await setCachedData(cacheKey, course, CACHE_TTL.COURSE)
    }

    return course
  } catch (error) {
    console.error("Error fetching course:", error)
    return null
  }
}

export async function getCourseWithSectionsAndLessons(courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    })

    return course
  } catch (error) {
    console.error("Error fetching course with sections and lessons:", error)
    return null
  }
}

export async function getUserCourses(userId: string) {
  try {
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.USER_COURSES(userId)
    const cachedCourses = await getCachedData<Course[]>(cacheKey)

    if (cachedCourses) {
      return cachedCourses
    }

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
            _count: {
              select: {
                sections: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const courses = enrollments.map((enrollment) => enrollment.course)

    // Cache the results
    await setCachedData(cacheKey, courses, CACHE_TTL.USER_COURSES)

    return courses
  } catch (error) {
    console.error("Error fetching user courses:", error)
    return []
  }
}

export async function getInstructorCourses(instructorId: string) {
  try {
    const courses = await db.course.findMany({
      where: {
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            sections: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return courses
  } catch (error) {
    console.error("Error fetching instructor courses:", error)
    return []
  }
}

export async function getPendingCourses() {
  try {
    const courses = await db.course.findMany({
      where: {
        isApproved: false,
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
        createdAt: "desc",
      },
    })

    return courses
  } catch (error) {
    console.error("Error fetching pending courses:", error)
    return []
  }
}

export async function createCourse(data: {
  title: string
  description: string
  thumbnail?: string
  instructorId: string
  price: number
  category: string
  mode: "live" | "video" | "mixed"
}) {
  try {
    const course = await db.course.create({
      data,
    })

    // Invalidate cache
    await invalidateCache(CACHE_KEYS.COURSES)

    return course
  } catch (error) {
    console.error("Error creating course:", error)
    throw error
  }
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string
    description?: string
    thumbnail?: string
    price?: number
    category?: string
    mode?: "live" | "video" | "mixed"
    isApproved?: boolean
  },
) {
  try {
    const course = await db.course.update({
      where: {
        id: courseId,
      },
      data,
    })

    // Invalidate cache
    await invalidateCache(CACHE_KEYS.COURSE(courseId))
    await invalidateCache(CACHE_KEYS.COURSES)

    return course
  } catch (error) {
    console.error("Error updating course:", error)
    throw error
  }
}

export async function deleteCourse(courseId: string) {
  try {
    // Delete all related data
    await db.$transaction([
      // Delete lessons
      db.lesson.deleteMany({
        where: {
          section: {
            courseId,
          },
        },
      }),
      // Delete sections
      db.section.deleteMany({
        where: {
          courseId,
        },
      }),
      // Delete enrollments
      db.enrollment.deleteMany({
        where: {
          courseId,
        },
      }),
      // Delete notes
      db.note.deleteMany({
        where: {
          lesson: {
            section: {
              courseId,
            },
          },
        },
      }),
      // Delete questions
      db.question.deleteMany({
        where: {
          lesson: {
            section: {
              courseId,
            },
          },
        },
      }),
      // Finally delete the course
      db.course.delete({
        where: {
          id: courseId,
        },
      }),
    ])

    // Invalidate cache
    await invalidateCache(CACHE_KEYS.COURSE(courseId))
    await invalidateCache(CACHE_KEYS.COURSES)

    return true
  } catch (error) {
    console.error("Error deleting course:", error)
    throw error
  }
}

export async function getSecureVideoUrl(userId: string, lessonId: string) {
  try {
    // Check if user is enrolled in the course
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      throw new Error("Lesson not found")
    }

    const courseId = lesson.section.courseId

    // Check enrollment
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    // If not enrolled and not the instructor, deny access
    if (!enrollment && lesson.section.course.instructorId !== userId) {
      throw new Error("User not enrolled in this course")
    }

    // Get video details from YouTube
    const cacheKey = CACHE_KEYS.YOUTUBE_VIDEO(lesson.youtubeVideoId)
    let videoDetails = await getCachedData(cacheKey)

    if (!videoDetails) {
      videoDetails = await getYouTubeVideoDetails(lesson.youtubeVideoId)
      await setCachedData(cacheKey, videoDetails, CACHE_TTL.YOUTUBE_VIDEO)
    }

    // Create a secure embed URL with anti-leak measures
    const embedUrl = `https://www.youtube.com/embed/${lesson.youtubeVideoId}?autoplay=0&modestbranding=1&rel=0&controls=0&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1&origin=${process.env.NEXT_PUBLIC_APP_URL}`

    return {
      embedUrl,
      videoDetails,
      lesson,
    }
  } catch (error) {
    console.error("Error getting secure video URL:", error)
    throw error
  }
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  data: {
    watchedSeconds: number
    completed?: boolean
  },
) {
  try {
    // Get the lesson to find the course
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      throw new Error("Lesson not found")
    }

    const courseId = lesson.section.courseId

    // Find or create enrollment
    let enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      enrollment = await db.enrollment.create({
        data: {
          userId,
          courseId,
        },
      })
    }

    // Update or create progress
    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        watchedSeconds: data.watchedSeconds,
        ...(data.completed !== undefined && { completed: data.completed }),
        lastWatched: new Date(),
      },
      create: {
        userId,
        lessonId,
        enrollmentId: enrollment.id,
        watchedSeconds: data.watchedSeconds,
        completed: data.completed || false,
        lastWatched: new Date(),
      },
    })

    return progress
  } catch (error) {
    console.error("Error updating lesson progress:", error)
    throw error
  }
}

export async function getStudentProgress(userId: string, courseId: string) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: {
        userId: userId,
        courseId: courseId,
      },
      include: {
        progress: true,
      },
    })

    if (!enrollments || enrollments.length === 0) {
      return null
    }

    return enrollments
  } catch (error) {
    console.error("Error getting student progress:", error)
    return null
  }
}

