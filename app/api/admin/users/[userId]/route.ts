import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"

export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const adminUser = await getUserByClerkId(userId)

    if (!adminUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (adminUser.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    const body = await req.json()
    const { role } = body

    if (!role || !["admin", "instructor", "student"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 })
    }

    const user = await db.user.update({
      where: {
        id: params.userId,
      },
      data: {
        role,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

