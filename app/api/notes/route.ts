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
    const { content, lessonId } = body

    if (!content || !lessonId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if note already exists for this user and lesson
    const existingNote = await db.note.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    })

    if (existingNote) {
      // Update existing note
      const updatedNote = await db.note.update({
        where: {
          id: existingNote.id,
        },
        data: {
          content,
        },
      })

      return NextResponse.json(updatedNote)
    }

    // Create new note
    const note = await db.note.create({
      data: {
        content,
        userId: user.id,
        lessonId,
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("[NOTES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 })
    }

    const note = await db.note.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    })

    return NextResponse.json(note || { content: "" })
  } catch (error) {
    console.error("[NOTES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

