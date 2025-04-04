import { db } from "@/lib/db"

export async function getLessonById(lessonId: string) {
  try {
    const lesson = await db.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        section: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return lesson
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return null
  }
}

export async function getLessonsBySectionId(sectionId: string) {
  try {
    const lessons = await db.lesson.findMany({
      where: {
        sectionId,
      },
      orderBy: {
        order: "asc",
      },
    })

    return lessons
  } catch (error) {
    console.error("Error fetching lessons by section ID:", error)
    return []
  }
}

