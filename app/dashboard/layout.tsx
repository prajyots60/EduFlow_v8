import type React from "react"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  // Get or create user in our database
  const user = await getUserByClerkId(clerkUser.id)

  if (!user) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole={user.role} />
      <div className="flex-1">{children}</div>
    </div>
  )
}

