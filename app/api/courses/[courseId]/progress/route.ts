import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getStudentProgress } from "@/lib/course-service"

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!params.courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    const progress = await getStudentProgress(user.id, params.courseId)

    if (!progress) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("[PROGRESS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

