import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getSecureVideoUrl } from "@/lib/course-service"

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
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

    const videoData = await getSecureVideoUrl(user.id, params.lessonId)

    return NextResponse.json(videoData)
  } catch (error) {
    console.error("[SECURE_VIDEO_GET]", error)

    if (error instanceof Error) {
      if (error.message === "User not enrolled in this course") {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === "Lesson not found") {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

