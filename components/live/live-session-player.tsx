"use client"

import { useState, useEffect } from "react"

interface LiveSessionPlayerProps {
  youtubeLiveId: string
}

export default function LiveSessionPlayer({ youtubeLiveId }: LiveSessionPlayerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading live stream...</p>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${youtubeLiveId}?autoplay=1`}
        title="YouTube live stream player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

