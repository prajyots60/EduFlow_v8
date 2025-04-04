import { google } from "googleapis"

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`,
)

// Scopes required for YouTube API
const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
]

// Generate YouTube auth URL
export function getYouTubeAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force to get refresh token every time
  })

  return authUrl
}

// Exchange code for tokens
export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  } catch (error) {
    console.error("Error exchanging code for tokens:", error)
    throw error
  }
}

// Check if user has connected YouTube
export async function hasConnectedYouTube(userId: string) {
  try {
    const user = await getUserById(userId)
    return !!(user?.youtubeAccessToken && user?.youtubeChannelId)
  } catch (error) {
    console.error("Error checking YouTube connection:", error)
    return false
  }
}

// Get user by ID
async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    return user
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Get YouTube client for a user
export async function getYouTubeClient(userId: string) {
  try {
    const user = await getUserById(userId)

    if (!user?.youtubeAccessToken) {
      throw new Error("User has not connected YouTube account")
    }

    // Set credentials
    oauth2Client.setCredentials({
      access_token: user.youtubeAccessToken,
      refresh_token: user.youtubeRefreshToken,
    })

    // Create YouTube client
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    })

    return youtube
  } catch (error) {
    console.error("Error getting YouTube client:", error)
    throw error
  }
}

// Refresh tokens if needed
export async function refreshTokensIfNeeded(userId: string) {
  try {
    const user = await getUserById(userId)

    if (!user?.youtubeAccessToken || !user?.youtubeRefreshToken) {
      throw new Error("User has not connected YouTube account")
    }

    // Check if token is expired
    const tokenExpiry = user.youtubeTokenExpiry
    const now = new Date()

    if (tokenExpiry && tokenExpiry > now) {
      // Token is still valid
      return
    }

    // Set credentials with refresh token
    oauth2Client.setCredentials({
      refresh_token: user.youtubeRefreshToken,
    })

    // Refresh token
    const { credentials } = await oauth2Client.refreshAccessToken()

    // Update user with new tokens
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        youtubeAccessToken: credentials.access_token,
        youtubeTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
      },
    })
  } catch (error) {
    console.error("Error refreshing tokens:", error)
    throw error
  }
}

// Upload video to YouTube
export async function uploadVideoToYouTube(
  userId: string,
  videoFile: Buffer,
  metadata: {
    title: string
    description: string
    tags?: string[]
    categoryId?: string
    privacyStatus?: "private" | "unlisted" | "public"
  },
) {
  try {
    await refreshTokensIfNeeded(userId)
    const youtube = await getYouTubeClient(userId)

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: metadata.categoryId || "27", // Education category
        },
        status: {
          privacyStatus: metadata.privacyStatus || "unlisted",
        },
      },
      media: {
        body: videoFile,
      },
    })

    return res.data
  } catch (error) {
    console.error("Error uploading video to YouTube:", error)
    throw error
  }
}

// Create live broadcast
export async function createYouTubeLiveBroadcast(
  userId: string,
  title: string,
  description: string,
  scheduledStartTime: Date,
) {
  try {
    await refreshTokensIfNeeded(userId)
    const youtube = await getYouTubeClient(userId)

    // Create broadcast
    const broadcastResponse = await youtube.liveBroadcasts.insert({
      part: ["snippet", "status", "contentDetails"],
      requestBody: {
        snippet: {
          title: title,
          description: description,
          scheduledStartTime: scheduledStartTime.toISOString(),
        },
        status: {
          privacyStatus: "unlisted",
        },
        contentDetails: {
          enableAutoStart: true,
          enableAutoStop: true,
        },
      },
    })

    const broadcastId = broadcastResponse.data.id

    if (!broadcastId) {
      throw new Error("Failed to create broadcast")
    }

    // Create stream
    const streamResponse = await youtube.liveStreams.insert({
      part: ["snippet", "cdn", "contentDetails"],
      requestBody: {
        snippet: {
          title: title,
        },
        cdn: {
          frameRate: "variable",
          ingestionType: "rtmp",
          resolution: "variable",
        },
        contentDetails: {
          isReusable: true,
        },
      },
    })

    const streamId = streamResponse.data.id
    const streamKey = streamResponse.data.cdn?.ingestionInfo?.streamName

    if (!streamId) {
      throw new Error("Failed to create stream")
    }

    if (!streamKey) {
      throw new Error("Failed to get stream key")
    }

    // Bind broadcast to stream
    await youtube.liveBroadcasts.bind({
      id: broadcastId,
      part: ["id", "snippet", "contentDetails", "status"],
      streamId: streamId,
    })

    return {
      broadcastId,
      streamId,
      streamKey,
    }
  } catch (error) {
    console.error("Error creating live broadcast:", error)
    throw error
  }
}

export async function getYouTubeVideoDetails(videoId: string) {
  try {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    })

    const response = await youtube.videos.list({
      part: ["contentDetails"],
      id: [videoId],
    })

    if (response.data.items && response.data.items.length > 0) {
      const duration = parseDuration(response.data.items[0].contentDetails?.duration || "")
      return {
        duration,
      }
    } else {
      throw new Error("Video not found")
    }
  } catch (error) {
    console.error("Error getting YouTube video details:", error)
    throw error
  }
}

function parseDuration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  const match = duration.match(regex)

  if (match) {
    const hours = Number.parseInt(match[1] || "0")
    const minutes = Number.parseInt(match[2] || "0")
    const seconds = Number.parseInt(match[3] || "0")
    return hours * 3600 + minutes * 60 + seconds
  }

  return 0
}

// Import prisma client
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

