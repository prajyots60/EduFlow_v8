import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getCourseById } from "@/lib/course-service"
import SectionCreationForm from "@/components/dashboard/section-creation-form"

interface SectionCreatePageProps {
  params: {
    courseId: string
  }
}

export default async function SectionCreatePage({ params }: SectionCreatePageProps) {
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

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Add Section to: {course.title}</h1>
      <SectionCreationForm courseId={params.courseId} />
    </div>
  )
}

