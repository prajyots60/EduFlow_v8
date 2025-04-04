import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"
import { enrollUserInCourse } from "@/lib/enrollment-service"

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
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

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isApproved: true,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const enrollment = await enrollUserInCourse(user.id, params.courseId)

    if (!enrollment) {
      return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("[ENROLL_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

