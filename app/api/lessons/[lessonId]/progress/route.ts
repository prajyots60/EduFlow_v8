import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { updateLessonProgress } from "@/lib/course-service"

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!params.lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 })
    }

    const body = await req.json()
    const { watchedSeconds, completed } = body

    if (typeof watchedSeconds !== "number") {
      return NextResponse.json({ error: "watchedSeconds is required and must be a number" }, { status: 400 })
    }

    const progress = await updateLessonProgress(user.id, params.lessonId, {
      watchedSeconds,
      completed,
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("[LESSON_PROGRESS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

