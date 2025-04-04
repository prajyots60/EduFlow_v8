import { redirect, notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getCourseWithSectionsAndLessons } from "@/lib/course-service"
import SectionManager from "@/components/dashboard/section-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

interface SectionManagementPageProps {
  params: {
    courseId: string
  }
}

export default async function SectionManagementPage({ params }: SectionManagementPageProps) {
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
            <Link href={`/dashboard/courses/${params.courseId}/edit`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Manage Sections: {course.title}</h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/courses/${params.courseId}/sections/create`}>
            <Plus className="h-4 w-4 mr-2" /> Add Section
          </Link>
        </Button>
      </div>

      <SectionManager courseId={params.courseId} sections={course.sections} />
    </div>
  )
}

