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

    const question = await db.question.create({
      data: {
        content,
        userId: user.id,
        lessonId,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error("[QUESTIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 })
    }

    const questions = await db.question.findMany({
      where: {
        lessonId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("[QUESTIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

