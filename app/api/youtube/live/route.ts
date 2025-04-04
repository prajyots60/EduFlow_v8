import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { createYouTubeLiveBroadcast } from "@/lib/youtube-api"
import { createLiveSession } from "@/lib/live-service"

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

    if (!user.youtubeAccessToken || !user.youtubeRefreshToken) {
      return NextResponse.json({ error: "YouTube account not connected" }, { status: 400 })
    }

    const body = await req.json()
    const { title, description, scheduledStartTime, courseId } = body

    if (!title || !scheduledStartTime) {
      return NextResponse.json({ error: "Title and scheduled start time are required" }, { status: 400 })
    }

    // Create YouTube live broadcast
    const { broadcastId, streamId, streamKey } = await createYouTubeLiveBroadcast(
      user.id,
      title,
      description || "",
      new Date(scheduledStartTime),
    )

    // Create live session in database if courseId is provided
    if (courseId) {
      await createLiveSession(user.id, {
        title,
        description: description || "",
        scheduledFor: new Date(scheduledStartTime),
        courseId,
        youtubeLiveId: broadcastId,
        streamKey,
      })
    }

    return NextResponse.json({ broadcastId, streamId, streamKey })
  } catch (error) {
    console.error("[YOUTUBE_LIVE_POST]", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create YouTube live broadcast",
      },
      { status: 500 },
    )
  }
}

