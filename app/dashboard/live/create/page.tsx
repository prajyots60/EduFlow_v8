import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import LiveSessionForm from "@/components/dashboard/live-session-form"

export default async function CreateLiveSessionPage() {
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
      <h1 className="text-3xl font-bold mb-6">Create Live Session</h1>
      <LiveSessionForm userId={user.id} />
    </div>
  )
}

