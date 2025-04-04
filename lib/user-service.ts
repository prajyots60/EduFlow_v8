import { db } from "@/lib/db"

export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        clerkId,
      },
    })

    return user
  } catch (error) {
    console.error("Error getting user by Clerk ID:", error)
    return null
  }
}

export async function createUser(userData: {
  clerkId: string
  email?: string
  name?: string
  role?: string
}) {
  try {
    const user = await db.user.create({
      data: {
        clerkId: userData.clerkId,
        email: userData.email,
        name: userData.name || "User",
        role: userData.role || "student",
      },
    })

    return user
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function updateUser(
  clerkId: string,
  userData: {
    email?: string
    name?: string
    role?: string
    youtubeAccessToken?: string
    youtubeRefreshToken?: string
    youtubeChannelId?: string
    youtubeTokenExpiry?: Date
  },
) {
  try {
    const user = await db.user.update({
      where: {
        clerkId,
      },
      data: userData,
    })

    return user
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await db.user.delete({
      where: {
        clerkId,
      },
    })

    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return users
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

