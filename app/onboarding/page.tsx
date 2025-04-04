import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import OnboardingForm from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  // Check if user already exists in our database
  const existingUser = await getUserByClerkId(clerkUser.id)

  if (existingUser) {
    redirect("/dashboard")
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
      <OnboardingForm
        clerkId={clerkUser.id}
        email={clerkUser.emailAddresses[0]?.emailAddress || ""}
        name={`${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim()}
      />
    </div>
  )
}

