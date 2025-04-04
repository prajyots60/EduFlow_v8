import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

interface LiveSessionHeaderProps {
  title: string
  instructor: {
    id: string
    name: string
  }
  scheduledFor: string
}

export default function LiveSessionHeader({ title, instructor, scheduledFor }: LiveSessionHeaderProps) {
  const sessionDate = new Date(scheduledFor)
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isPast ? "outline" : isLiveNow ? "destructive" : "default"}>
              {isPast ? "Completed" : isLiveNow ? "Live Now" : "Upcoming"}
            </Badge>
            {isUpcoming && <span className="text-sm text-muted-foreground">Starting {timeUntil}</span>}
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${instructor.name.charAt(0)}`} />
                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{instructor.name}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

