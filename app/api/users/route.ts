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

    const body = await req.json()
    const { name, role } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByClerkId(userId)

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 })
    }

    // Create new user
    const user = await db.user.create({
      data: {
        clerkId: userId,
        name,
        role: role || "student",
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserByClerkId(userId)

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

