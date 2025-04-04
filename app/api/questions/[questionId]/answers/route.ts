import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"

export async function POST(req: Request, { params }: { params: { questionId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (!params.questionId) {
      return new NextResponse("Question ID is required", { status: 400 })
    }

    const body = await req.json()
    const { content } = body

    if (!content) {
      return new NextResponse("Content is required", { status: 400 })
    }

    const answer = await db.answer.create({
      data: {
        content,
        userId: user.id,
        questionId: params.questionId,
      },
    })

    return NextResponse.json(answer)
  } catch (error) {
    console.error("[ANSWERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

