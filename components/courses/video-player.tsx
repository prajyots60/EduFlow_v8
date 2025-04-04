"use client"

import { useState, useEffect } from "react"

interface VideoPlayerProps {
  youtubeVideoId: string
}

export default function VideoPlayer({ youtubeVideoId }: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading video player...</p>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

