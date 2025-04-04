import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { hasConnectedYouTube } from "@/lib/youtube-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Youtube } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import InstructorVideoUpload from "@/components/dashboard/instructor-video-upload"
import InstructorLiveStream from "@/components/dashboard/instructor-live-stream"

export default async function InstructorDashboardPage() {
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

    if (user.role !== "instructor" && user.role !== "admin") {
      console.log("User is not an instructor or admin, redirecting to dashboard")
      redirect("/dashboard")
    }

    // Check if YouTube is connected
    const isYouTubeConnected = await hasConnectedYouTube(user.id)
    console.log("YouTube connected:", isYouTubeConnected)

    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>

        {!isYouTubeConnected ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Connect Your YouTube Account</CardTitle>
              <CardDescription>
                You need to connect your YouTube account to upload videos and create live streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>YouTube Account Not Connected</AlertTitle>
                <AlertDescription>
                  To upload videos and create live streams, you need to connect your YouTube account first.
                </AlertDescription>
              </Alert>

              <Button asChild>
                <Link href="/dashboard/settings">
                  <Youtube className="mr-2 h-4 w-4" />
                  Connect YouTube Account
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <InstructorVideoUpload isYouTubeConnected={isYouTubeConnected} userId={user.id} />

            <InstructorLiveStream isYouTubeConnected={isYouTubeConnected} userId={user.id} />
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Content</CardTitle>
              <CardDescription>Create and manage your courses, sections, and lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/dashboard/courses/create">Create New Course</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/courses">Manage Existing Courses</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/live">Manage Live Sessions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in instructor dashboard:", error)
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was an error loading your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}

