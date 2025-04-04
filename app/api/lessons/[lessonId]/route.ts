import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"

export async function PATCH(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!params.lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 })
    }

    const lesson = await db.lesson.findUnique({
      where: {
        id: params.lessonId,
      },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 })
    }

    if (lesson.section.course.instructorId !== user.id && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { title, description, youtubeVideoId } = body

    if (!title || !youtubeVideoId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const updatedLesson = await db.lesson.update({
      where: {
        id: params.lessonId,
      },
      data: {
        title,
        description: description || "",
        youtubeVideoId,
      },
    })

    return NextResponse.json(updatedLesson)
  } catch (error) {
    console.error("[LESSON_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { lessonId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!params.lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 })
    }

    const lesson = await db.lesson.findUnique({
      where: {
        id: params.lessonId,
      },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 })
    }

    if (lesson.section.course.instructorId !== user.id && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Delete the lesson
    await db.lesson.delete({
      where: {
        id: params.lessonId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[LESSON_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

