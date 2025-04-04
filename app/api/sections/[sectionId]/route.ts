import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"

export async function PATCH(req: Request, { params }: { params: { sectionId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!params.sectionId) {
      return new NextResponse("Section ID is required", { status: 400 })
    }

    const section = await db.section.findUnique({
      where: {
        id: params.sectionId,
      },
      include: {
        course: true,
      },
    })

    if (!section) {
      return new NextResponse("Section not found", { status: 404 })
    }

    if (section.course.instructorId !== user.id && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { title } = body

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    const updatedSection = await db.section.update({
      where: {
        id: params.sectionId,
      },
      data: {
        title,
      },
    })

    return NextResponse.json(updatedSection)
  } catch (error) {
    console.error("[SECTION_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { sectionId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!params.sectionId) {
      return new NextResponse("Section ID is required", { status: 400 })
    }

    const section = await db.section.findUnique({
      where: {
        id: params.sectionId,
      },
      include: {
        course: true,
      },
    })

    if (!section) {
      return new NextResponse("Section not found", { status: 404 })
    }

    if (section.course.instructorId !== user.id && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Delete all lessons in this section first
    await db.lesson.deleteMany({
      where: {
        sectionId: params.sectionId,
      },
    })

    // Then delete the section
    await db.section.delete({
      where: {
        id: params.sectionId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[SECTION_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

