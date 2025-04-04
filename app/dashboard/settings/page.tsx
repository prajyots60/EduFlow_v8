import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { hasConnectedYouTube } from "@/lib/youtube-api"
import UserSettingsForm from "@/components/dashboard/user-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      console.log("No clerk user found, redirecting to sign-in")
      redirect("/sign-in")
    }

    const user = await getUserByClerkId(clerkUser.id)

    if (!user) {
      console.log("No user found in database, redirecting to onboarding")
      redirect("/onboarding")
    }

    // Check if user has connected YouTube
    const youtubeConnected = await hasConnectedYouTube(user.id)
    console.log("YouTube connected:", youtubeConnected)

    // Serialize the user data to avoid passing complex objects to client components
    const serializedUser = {
      id: user.id,
      name: user.name,
      email: user.email || "",
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }

    // Serialize the clerk user data to avoid passing complex objects
    const serializedClerkUser = {
      id: clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      emailAddresses: clerkUser.emailAddresses.map((email) => ({
        id: email.id,
        emailAddress: email.emailAddress,
      })),
    }

    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSettingsForm
                user={serializedUser}
                clerkUser={serializedClerkUser}
                youtubeConnected={youtubeConnected}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in settings page:", error)
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was an error loading your settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}

