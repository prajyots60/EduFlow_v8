import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { exchangeCodeForTokens } from "@/lib/youtube-api"
import { getUserByClerkId } from "@/lib/user-service"
import { google } from "googleapis"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { userId } = auth()
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    if (!userId) {
      console.error("No userId found in auth")
      return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL!))
    }

    if (error) {
      console.error("YouTube OAuth error:", error)
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=youtube_auth_failed", process.env.NEXT_PUBLIC_APP_URL!),
      )
    }

    if (!code) {
      console.error("No code parameter found in callback URL")
      return NextResponse.redirect(new URL("/dashboard/settings?error=no_code", process.env.NEXT_PUBLIC_APP_URL!))
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    console.log("Tokens received:", tokens ? "tokens received" : "no tokens")

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error("Missing access_token or refresh_token in response")
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=token_exchange_failed", process.env.NEXT_PUBLIC_APP_URL!),
      )
    }

    // Get user from database
    const user = await getUserByClerkId(userId)
    console.log("User found:", user ? "user found" : "no user")

    if (!user) {
      console.error("User not found in database")
      return NextResponse.redirect(new URL("/onboarding", process.env.NEXT_PUBLIC_APP_URL!))
    }

    // Get YouTube channel info
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`,
    )

    oauth2Client.setCredentials(tokens)

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    })

    const channelResponse = await youtube.channels.list({
      part: ["id", "snippet"],
      mine: true,
    })
    console.log("Channel response:", channelResponse.data.items ? "channel found" : "no channel")

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      console.error("No YouTube channel found for user")
      return NextResponse.redirect(new URL("/dashboard/settings?error=no_channel", process.env.NEXT_PUBLIC_APP_URL!))
    }

    const channelId = channelResponse.data.items[0].id

    // Update user with YouTube tokens
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        youtubeAccessToken: tokens.access_token,
        youtubeRefreshToken: tokens.refresh_token,
        youtubeChannelId: channelId,
        youtubeTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
    })
    console.log("User updated with YouTube tokens")

    return NextResponse.redirect(
      new URL("/dashboard/settings?success=youtube_connected", process.env.NEXT_PUBLIC_APP_URL!),
    )
  } catch (error) {
    console.error("Error in YouTube OAuth callback:", error)
    return NextResponse.redirect(new URL("/dashboard/settings?error=unexpected", process.env.NEXT_PUBLIC_APP_URL!))
  }
}

