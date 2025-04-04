import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getUserByClerkId } from "@/lib/user-service"
import { createCourse } from "@/lib/course-service"

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

    if (user.role !== "instructor" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, thumbnail, price, category, mode } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const course = await createCourse({
      title,
      description,
      thumbnail,
      instructorId: user.id,
      price: price || 0,
      category: category || "Other",
      mode: mode || "video",
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSES_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query") || ""
    const pendingOnly = searchParams.get("pending") === "true"
    const category = searchParams.get("category") || ""

    // For pending courses, check if user is admin
    if (pendingOnly) {
      const { userId } = auth()

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const user = await getUserByClerkId(userId)

      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const where = {
      ...(pendingOnly ? { isApproved: false } : { isApproved: true }),
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    }

    const courses = await db.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("[COURSES_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

