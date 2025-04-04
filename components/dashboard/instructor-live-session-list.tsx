"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Search, Video } from "lucide-react"

interface InstructorLiveSessionListProps {
  sessions: any[]
}

export default function InstructorLiveSessionList({ sessions }: InstructorLiveSessionListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const now = new Date()

  const upcomingSessions = sessions.filter((session) => new Date(session.scheduledFor) > now)

  const pastSessions = sessions.filter((session) => new Date(session.scheduledFor) <= now)

  const filteredSessions = sessions.filter((session) => session.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredUpcomingSessions = upcomingSessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPastSessions = pastSessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-xl font-medium mb-2">No live sessions scheduled yet</h3>
          <p className="text-muted-foreground mb-4">
            Schedule your first live session to engage with your students in real-time
          </p>
          <Button asChild>
            <Link href="/dashboard/live/create">
              <Plus className="h-4 w-4 mr-2" /> Schedule Your First Live Session
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search live sessions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/dashboard/live/create">
            <Plus className="h-4 w-4 mr-2" /> Schedule Live Session
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({filteredUpcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({filteredPastSessions.length})</TabsTrigger>
          <TabsTrigger value="all">All Sessions ({filteredSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcomingSessions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No upcoming live sessions found</p>
              </div>
            ) : (
              filteredUpcomingSessions.map((session) => <LiveSessionCard key={session.id} session={session} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPastSessions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No past live sessions found</p>
              </div>
            ) : (
              filteredPastSessions.map((session) => <LiveSessionCard key={session.id} session={session} isPast />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No live sessions found matching your search</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isPast = new Date(session.scheduledFor) <= now
                return <LiveSessionCard key={session.id} session={session} isPast={isPast} />
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LiveSessionCard({ session, isPast = false }: { session: any; isPast?: boolean }) {
  const sessionDate = new Date(session.scheduledFor)
  const formattedDate = sessionDate.toLocaleDateString()
  const formattedTime = sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{session.title}</CardTitle>
          <Badge variant={isPast ? "outline" : "default"}>{isPast ? "Completed" : "Upcoming"}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{session.description || "No description provided"}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 pt-0 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">🕒</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button asChild className="w-full" variant={isPast ? "outline" : "default"}>
          <Link href={isPast ? `/dashboard/live/${session.id}/analytics` : `/live/${session.id}`}>
            {isPast ? (
              <>View Analytics</>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" /> Go Live
              </>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

