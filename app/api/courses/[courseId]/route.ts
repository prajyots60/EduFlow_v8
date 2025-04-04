import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    if (!params.courseId) {
      return new NextResponse("Course ID is required", { status: 400 })
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
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
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

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

    if (!params.courseId) {
      return new NextResponse("Course ID is required", { status: 400 })
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
      },
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.instructorId !== user.id && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { title, description, thumbnail } = body

    const updatedCourse = await db.course.update({
      where: {
        id: params.courseId,
      },
      data: {
        title,
        description,
        thumbnail,
        isApproved: user.role === "admin" ? true : false,
      },
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!params.courseId) {
      return new NextResponse("Course ID is required", { status: 400 })
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
      },
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.instructorId !== user.id && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Delete all related data
    await db.$transaction([
      // Delete lessons
      db.lesson.deleteMany({
        where: {
          section: {
            courseId: params.courseId,
          },
        },
      }),
      // Delete sections
      db.section.deleteMany({
        where: {
          courseId: params.courseId,
        },
      }),
      // Delete enrollments
      db.enrollment.deleteMany({
        where: {
          courseId: params.courseId,
        },
      }),
      // Delete notes
      db.note.deleteMany({
        where: {
          lesson: {
            section: {
              courseId: params.courseId,
            },
          },
        },
      }),
      // Delete questions
      db.question.deleteMany({
        where: {
          lesson: {
            section: {
              courseId: params.courseId,
            },
          },
        },
      }),
      // Finally delete the course
      db.course.delete({
        where: {
          id: params.courseId,
        },
      }),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COURSE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

