import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import UserManagement from "@/components/dashboard/user-management"

export default async function AdminUsersPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  const user = await getUserByClerkId(clerkUser.id)

  if (!user) {
    redirect("/onboarding")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserManagement />
    </div>
  )
}

