import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getInstructorCourses } from "@/lib/course-service"
import { getInstructorLiveSessions } from "@/lib/live-service"
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard"

export default async function AnalyticsPage() {
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

  const courses = await getInstructorCourses(user.id)
  const liveSessions = await getInstructorLiveSessions(user.id)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <AnalyticsDashboard courses={courses} liveSessions={liveSessions} />
    </div>
  )
}

