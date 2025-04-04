import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { getUserLiveSessions, getInstructorLiveSessions } from "@/lib/live-service"
import StudentLiveSessionList from "@/components/dashboard/student-live-session-list"
import InstructorLiveSessionList from "@/components/dashboard/instructor-live-session-list"

export default async function DashboardLiveSessionsPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  const user = await getUserByClerkId(clerkUser.id)

  if (!user) {
    redirect("/onboarding")
  }

  let liveSessions = []

  if (user.role === "student") {
    liveSessions = await getUserLiveSessions(user.id)
  } else if (user.role === "instructor" || user.role === "admin") {
    liveSessions = await getInstructorLiveSessions(user.id)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        {user.role === "student" ? "My Live Sessions" : "My Scheduled Live Sessions"}
      </h1>

      {user.role === "student" ? (
        <StudentLiveSessionList sessions={liveSessions} />
      ) : (
        <InstructorLiveSessionList sessions={liveSessions} />
      )}
    </div>
  )
}

