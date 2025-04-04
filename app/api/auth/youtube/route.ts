import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getYouTubeAuthUrl } from "@/lib/youtube-api"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authUrl = getYouTubeAuthUrl()

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Error generating YouTube auth URL:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}

