import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getCourseWithSectionsAndLessons } from "@/lib/course-service"
import CourseEditForm from "@/components/dashboard/course-edit-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Layers } from "lucide-react"

interface CourseEditPageProps {
  params: {
    courseId: string
  }
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
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

  const course = await getCourseWithSectionsAndLessons(params.courseId)

  if (!course) {
    notFound()
  }

  // Check if user is the course instructor or an admin
  if (course.instructorId !== user.id && user.role !== "admin") {
    redirect("/dashboard/courses")
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Course: {course.title}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/courses/${params.courseId}/edit/sections`}>
            <Layers className="h-4 w-4 mr-2" /> Manage Sections & Lessons
          </Link>
        </Button>
      </div>

      <CourseEditForm course={course} userId={user.id} />
    </div>
  )
}

