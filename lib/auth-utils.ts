"use client"

import { db } from "@/lib/db"

export async function getUserRole(userId: string): Promise<string> {
  try {
    // First, check if the user exists in our database
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    })

    // If user doesn't exist in our database yet, create them with default role
    if (!user) {
      const newUser = await db.user.create({
        data: {
          id: userId,
          role: "student", // Default role for new users
        },
      })

      return newUser.role
    }

    return user.role
  } catch (error) {
    console.error("Error getting user role:", error)
    return "student" // Default to student role if there's an error
  }
}

