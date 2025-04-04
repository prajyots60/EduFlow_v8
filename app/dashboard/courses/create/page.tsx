import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import CourseCreationForm from "@/components/dashboard/course-creation-form"

export default async function CreateCoursePage() {
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

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      <CourseCreationForm userId={user.id} />
    </div>
  )
}

