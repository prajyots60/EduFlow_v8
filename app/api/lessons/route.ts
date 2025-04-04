import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"
import { getYouTubeVideoDetails } from "@/lib/youtube-api"
import { CACHE_KEYS, invalidateCache } from "@/lib/redis"

export async function POST(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, youtubeVideoId, sectionId, isLive, scheduledFor } = body

    if (!title || !youtubeVideoId || !sectionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if section exists and user is the instructor
    const section = await db.section.findUnique({
      where: {
        id: sectionId,
      },
      include: {
        course: true,
      },
    })

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    if (section.course.instructorId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get video details from YouTube to get duration
    let duration = null
    try {
      const videoDetails = await getYouTubeVideoDetails(youtubeVideoId)
      duration = videoDetails.duration
    } catch (error) {
      console.error("Error getting YouTube video details:", error)
      // Continue without duration if there's an error
    }

    // Get the highest order number for lessons in this section
    const highestOrderLesson = await db.lesson.findFirst({
      where: {
        sectionId,
      },
      orderBy: {
        order: "desc",
      },
    })

    const newOrder = highestOrderLesson ? highestOrderLesson.order + 1 : 1

    // Create the lesson
    const lesson = await db.lesson.create({
      data: {
        title,
        description: description || "",
        youtubeVideoId,
        sectionId,
        order: newOrder,
        isLive: isLive || false,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        duration,
      },
    })

    // Invalidate course cache
    await invalidateCache(CACHE_KEYS.COURSE(section.courseId))

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("[LESSONS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

