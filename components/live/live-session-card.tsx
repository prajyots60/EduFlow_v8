import Link from "next/link"
import { Calendar, Clock, User } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LiveSessionCardProps {
  session: any
}

export default function LiveSessionCard({ session }: LiveSessionCardProps) {
  const sessionDate = new Date(session.scheduledFor)
  const now = new Date()

  // Calculate if the session is live now (within 15 minutes of scheduled time)
  const diffMs = sessionDate.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const isLiveNow = diffMins >= -15 && diffMins <= 60 // Consider "live" from 15 mins before to 60 mins after

  const isPast = sessionDate < now && !isLiveNow
  const isUpcoming = !isPast && !isLiveNow

  const formattedDate = sessionDate.toLocaleDateString()
  const formattedTime = sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // Calculate time until session
  let timeUntil = ""
  if (isUpcoming) {
    const days = Math.floor(diffMins / 1440)
    const hours = Math.floor((diffMins % 1440) / 60)
    const mins = diffMins % 60

    if (days > 0) {
      timeUntil = `${days} day${days > 1 ? "s" : ""} from now`
    } else if (hours > 0) {
      timeUntil = `${hours} hour${hours > 1 ? "s" : ""} from now`
    } else {
      timeUntil = `${mins} minute${mins > 1 ? "s" : ""} from now`
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{session.title}</CardTitle>
          <Badge variant={isPast ? "outline" : isLiveNow ? "destructive" : "default"}>
            {isPast ? "Completed" : isLiveNow ? "Live Now" : "Upcoming"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{session.instructor.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedTime}</span>
          </div>

          {isUpcoming && <p className="text-sm text-muted-foreground">Starting {timeUntil}</p>}

          {session.description && <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={isPast ? "outline" : isLiveNow ? "destructive" : "default"}>
          <Link href={`/live/${session.id}`}>
            {isPast ? "View Recording" : isLiveNow ? "Join Live Now" : "View Details"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

