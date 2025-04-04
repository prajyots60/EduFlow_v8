import type React from "react"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return <div className="flex-1">{children}</div>
}

