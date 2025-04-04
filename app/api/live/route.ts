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

    if (user.role !== "instructor" && user.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { title, description, scheduledFor, youtubeLiveId } = body

    if (!title || !scheduledFor || !youtubeLiveId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const liveSession = await db.liveSession.create({
      data: {
        title,
        description: description || "",
        scheduledFor: new Date(scheduledFor),
        youtubeLiveId,
        instructorId: user.id,
      },
    })

    return NextResponse.json(liveSession)
  } catch (error) {
    console.error("[LIVE_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const upcoming = searchParams.get("upcoming") === "true"

    const now = new Date()

    const liveSessions = await db.liveSession.findMany({
      where: upcoming
        ? {
            scheduledFor: {
              gte: now,
            },
          }
        : {},
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    })

    return NextResponse.json(liveSessions)
  } catch (error) {
    console.error("[LIVE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

