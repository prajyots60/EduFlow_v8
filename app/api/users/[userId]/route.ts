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

    const currentUser = await getUserByClerkId(userId)

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Only allow users to update their own profile, unless they're an admin
    if (currentUser.id !== params.userId && currentUser.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { name, role } = body

    // Only admins can change roles
    if (role && currentUser.role !== "admin") {
      return new NextResponse("Forbidden: Only admins can change roles", { status: 403 })
    }

    const updateData: any = {}

    if (name) {
      updateData.name = name
    }

    if (role && currentUser.role === "admin") {
      updateData.role = role
    }

    const updatedUser = await db.user.update({
      where: {
        id: params.userId,
      },
      data: updateData,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[USER_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

