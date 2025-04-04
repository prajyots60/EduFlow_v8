import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"

export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    if (!params.courseId) {
      return new NextResponse("Course ID is required", { status: 400 })
    }

    const course = await db.course.update({
      where: {
        id: params.courseId,
      },
      data: {
        isApproved: true,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSE_APPROVE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

