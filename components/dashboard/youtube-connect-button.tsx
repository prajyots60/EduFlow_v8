"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Youtube } from "lucide-react"

interface YouTubeConnectButtonProps {
  isConnected: boolean
  onDisconnect?: () => Promise<void>
}

export default function YouTubeConnectButton({ isConnected, onDisconnect }: YouTubeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/youtube")

      if (!response.ok) {
        throw new Error("Failed to get YouTube auth URL")
      }

      const { authUrl } = await response.json()

      if (!authUrl) {
        throw new Error("No auth URL returned")
      }

      // Redirect to YouTube OAuth
      window.location.href = authUrl
    } catch (error) {
      console.error("Error connecting YouTube:", error)
      toast({
        title: "Error",
        description: "Failed to connect YouTube account. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!onDisconnect) return

    try {
      setIsLoading(true)
      await onDisconnect()

      toast({
        title: "Success",
        description: "YouTube account disconnected successfully.",
      })
    } catch (error) {
      console.error("Error disconnecting YouTube:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect YouTube account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={isConnected ? handleDisconnect : handleConnect}
      variant={isConnected ? "outline" : "default"}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Youtube className="mr-2 h-4 w-4" />}
      {isConnected ? "Disconnect YouTube" : "Connect YouTube"}
    </Button>
  )
}

