import { getUpcomingLiveSessions } from "@/lib/live-service"
import LiveSessionCard from "@/components/live/live-session-card"

export default async function LiveSessionsPage() {
  const liveSessions = await getUpcomingLiveSessions()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Upcoming Live Sessions</h1>

      {liveSessions.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No upcoming live sessions</h2>
          <p className="text-muted-foreground">
            Check back later for new live sessions or follow instructors to get notified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveSessions.map((session) => (
            <LiveSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}

