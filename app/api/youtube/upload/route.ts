import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getYouTubeClient, refreshTokensIfNeeded } from "@/lib/youtube-api"

export async function POST(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByClerkId(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has connected YouTube
    if (!user.youtubeAccessToken || !user.youtubeRefreshToken || !user.youtubeChannelId) {
      return NextResponse.json({ error: "YouTube account not connected" }, { status: 400 })
    }

    // Refresh tokens if needed
    await refreshTokensIfNeeded(user.id)

    // Get YouTube client
    const youtube = await getYouTubeClient(user.id)

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!file || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload video to YouTube
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description: description || "",
          categoryId: "27", // Education category
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      media: {
        body: buffer,
      },
    })

    if (!response.data.id) {
      return NextResponse.json({ error: "Failed to upload video" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      videoId: response.data.id,
      videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`,
    })
  } catch (error) {
    console.error("Error uploading video to YouTube:", error)
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 })
  }
}

// Increase the body size limit for video uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

