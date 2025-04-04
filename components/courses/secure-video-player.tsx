"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface SecureVideoPlayerProps {
  lessonId: string
  onProgress?: (seconds: number, completed: boolean) => void
  initialProgress?: number
  duration?: number
}

export default function SecureVideoPlayer({
  lessonId,
  onProgress,
  initialProgress = 0,
  duration = 0,
}: SecureVideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialProgress)
  const [videoDuration, setVideoDuration] = useState(duration)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const playerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerApiRef = useRef<any>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load the YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Fetch secure video URL
    fetchVideoUrl()

    // Set up progress reporting interval
    const progressInterval = setInterval(() => {
      if (playerApiRef.current && isPlaying) {
        const currentTime = Math.floor(playerApiRef.current.getCurrentTime())
        setCurrentTime(currentTime)

        // Report progress to parent component
        if (onProgress) {
          const isCompleted = videoDuration > 0 && currentTime >= videoDuration * 0.9
          onProgress(currentTime, isCompleted)
        }
      }
    }, 5000) // Report progress every 5 seconds

    return () => {
      clearInterval(progressInterval)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, videoDuration, onProgress])

  // Handle mouse movement to show/hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const playerElement = playerRef.current
    if (playerElement) {
      playerElement.addEventListener("mousemove", handleMouseMove)
      return () => {
        playerElement.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [isPlaying])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const fetchVideoUrl = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/secure-video/${lessonId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load video")
      }

      const data = await response.json()
      setEmbedUrl(data.embedUrl)

      if (data.videoDetails?.duration) {
        setVideoDuration(data.videoDetails.duration)
      }

      // Initialize YouTube player once we have the URL
      initializeYouTubePlayer(data.embedUrl)
    } catch (error) {
      console.error("Error fetching video:", error)
      setError(error instanceof Error ? error.message : "Failed to load video")
      toast({
        title: "Error loading video",
        description: error instanceof Error ? error.message : "Failed to load video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeYouTubePlayer = (embedUrl: string) => {
    // Wait for YouTube API to be ready
    if (typeof window.YT === "undefined" || !window.YT.Player) {
      window.onYouTubeIframeAPIReady = () => {
        createYouTubePlayer(embedUrl)
      }
    } else {
      createYouTubePlayer(embedUrl)
    }
  }

  const createYouTubePlayer = (embedUrl: string) => {
    if (!iframeRef.current) return

    // Extract video ID from embed URL
    const videoIdMatch = embedUrl.match(/\/embed\/([^?]+)/)
    if (!videoIdMatch) return

    const videoId = videoIdMatch[1]

    // Create YouTube player
    playerApiRef.current = new window.YT.Player(iframeRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        start: initialProgress,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    })
  }

  const onPlayerReady = (event: any) => {
    // Set initial volume
    event.target.setVolume(volume)

    // Set initial time if we have progress
    if (initialProgress > 0) {
      event.target.seekTo(initialProgress, true)
    }

    // Update duration if not provided
    if (duration === 0) {
      setVideoDuration(event.target.getDuration())
    }
  }

  const onPlayerStateChange = (event: any) => {
    // Update playing state based on YouTube player state
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
  }

  const togglePlay = () => {
    if (!playerApiRef.current) return

    if (isPlaying) {
      playerApiRef.current.pauseVideo()
    } else {
      playerApiRef.current.playVideo()
    }

    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!playerApiRef.current) return

    if (isMuted) {
      playerApiRef.current.unMute()
      playerApiRef.current.setVolume(volume)
    } else {
      playerApiRef.current.mute()
    }

    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!playerApiRef.current) return

    const newVolume = value[0]
    playerApiRef.current.setVolume(newVolume)
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      playerApiRef.current.unMute()
      setIsMuted(false)
    }
  }

  const handleSeek = (value: number[]) => {
    if (!playerApiRef.current || !videoDuration) return

    const seekTime = Math.floor((value[0] / 100) * videoDuration)
    playerApiRef.current.seekTo(seekTime, true)
    setCurrentTime(seekTime)
  }

  const toggleFullscreen = () => {
    if (!playerRef.current) return

    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const seekForward = () => {
    if (!playerApiRef.current) return

    const newTime = Math.min(currentTime + 10, videoDuration)
    playerApiRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }

  const seekBackward = () => {
    if (!playerApiRef.current) return

    const newTime = Math.max(currentTime - 10, 0)
    playerApiRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }

  // Calculate progress percentage
  const progressPercentage = videoDuration ? (currentTime / videoDuration) * 100 : 0

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
      onDoubleClick={toggleFullscreen}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
          <div className="text-center p-4">
            <p className="text-lg font-semibold mb-2">Error loading video</p>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              title="Secure video player"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Custom controls overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Center play button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  onClick={togglePlay}
                >
                  <Play className="h-8 w-8 fill-white" />
                </Button>
              </div>
            )}

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress bar */}
              <Slider
                value={[progressPercentage]}
                onValueChange={handleSeek}
                className="w-full cursor-pointer [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
              />

              {/* Controls row */}
              <div className="flex items-center gap-3 text-white">
                <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-black/50" onClick={seekBackward}>
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button size="icon" variant="ghost" className="w-10 h-10 hover:bg-black/50" onClick={togglePlay}>
                  {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                </Button>

                <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-black/50" onClick={seekForward}>
                  <SkipForward className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-black/50" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  <div className="w-20 hidden sm:block">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
                    />
                  </div>
                </div>

                <div className="text-sm ml-2">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-black/50" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

