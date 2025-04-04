import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getCourseById } from "@/lib/course-service"
import { getSectionById } from "@/lib/section-service"
import LessonCreationForm from "@/components/dashboard/lesson-creation-form"

interface LessonCreatePageProps {
  params: {
    courseId: string
    sectionId: string
  }
}

export default async function LessonCreatePage({ params }: LessonCreatePageProps) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  const user = await getUserByClerkId(clerkUser.id)

  if (!user) {
    redirect("/onboarding")
  }

  if (user.role !== "instructor" && user.role !== "admin") {
    redirect("/dashboard")
  }

  const course = await getCourseById(params.courseId)

  if (!course) {
    notFound()
  }

  // Check if user is the course instructor or an admin
  if (course.instructorId !== user.id && user.role !== "admin") {
    redirect("/dashboard/courses")
  }

  const section = await getSectionById(params.sectionId)

  if (!section || section.courseId !== params.courseId) {
    notFound()
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Add Lesson to: {section.title}</h1>
      <LessonCreationForm courseId={params.courseId} sectionId={params.sectionId} />
    </div>
  )
}

