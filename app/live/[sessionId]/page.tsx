import { notFound } from "next/navigation"
import { getLiveSessionById } from "@/lib/live-service"
import LiveSessionHeader from "@/components/live/live-session-header"
import LiveSessionPlayer from "@/components/live/live-session-player"
import LiveSessionChat from "@/components/live/live-session-chat"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"

interface LiveSessionPageProps {
  params: {
    sessionId: string
  }
}

export default async function LiveSessionPage({ params }: LiveSessionPageProps) {
  const session = await getLiveSessionById(params.sessionId)

  if (!session) {
    notFound()
  }

  // Get current user if logged in
  const clerkUser = await currentUser()
  let user = null

  if (clerkUser) {
    user = await getUserByClerkId(clerkUser.id)
  }

  return (
    <div className="container py-10">
      <LiveSessionHeader title={session.title} instructor={session.instructor} scheduledFor={session.scheduledFor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <LiveSessionPlayer youtubeLiveId={session.youtubeLiveId} />
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Session Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{session.description}</p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <LiveSessionChat sessionId={session.id} userId={user?.id} userName={user?.name || "Guest"} />
        </div>
      </div>
    </div>
  )
}

