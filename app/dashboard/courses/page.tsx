import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getUserCourses } from "@/lib/course-service"
import { getInstructorCourses } from "@/lib/course-service"
import StudentCourseList from "@/components/dashboard/student-course-list"
import InstructorCourseList from "@/components/dashboard/instructor-course-list"

export default async function DashboardCoursesPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  const user = await getUserByClerkId(clerkUser.id)

  if (!user) {
    redirect("/onboarding")
  }

  let courses = []

  if (user.role === "student") {
    courses = await getUserCourses(user.id)
  } else if (user.role === "instructor" || user.role === "admin") {
    courses = await getInstructorCourses(user.id)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        {user.role === "student" ? "My Enrolled Courses" : "My Created Courses"}
      </h1>

      {user.role === "student" ? <StudentCourseList courses={courses} /> : <InstructorCourseList courses={courses} />}
    </div>
  )
}

