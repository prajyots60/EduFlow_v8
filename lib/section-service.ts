import { db } from "@/lib/db"

export async function getSectionById(sectionId: string) {
  try {
    const section = await db.section.findUnique({
      where: {
        id: sectionId,
      },
      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return section
  } catch (error) {
    console.error("Error fetching section:", error)
    return null
  }
}

export async function getSectionsByCourseId(courseId: string) {
  try {
    const sections = await db.section.findMany({
      where: {
        courseId,
      },
      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    return sections
  } catch (error) {
    console.error("Error fetching sections by course ID:", error)
    return []
  }
}

