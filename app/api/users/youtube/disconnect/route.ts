import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user to remove YouTube tokens
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        youtubeAccessToken: null,
        youtubeRefreshToken: null,
        youtubeChannelId: null,
        youtubeTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[YOUTUBE_DISCONNECT_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

