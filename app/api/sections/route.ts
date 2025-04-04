import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"

export async function POST(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const body = await req.json()
    const { title, courseId } = body

    if (!title || !courseId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if course exists and user is the instructor
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.instructorId !== user.id && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Get the highest order number for sections in this course
    const highestOrderSection = await db.section.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        order: "desc",
      },
    })

    const newOrder = highestOrderSection ? highestOrderSection.order + 1 : 1

    // Create the section
    const section = await db.section.create({
      data: {
        title,
        courseId,
        order: newOrder,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("[SECTIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

