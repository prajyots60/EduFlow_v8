"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Youtube } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

type SerializedUser = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

type SerializedClerkUser = {
  id: string
  firstName: string | null
  lastName: string | null
  emailAddresses: {
    id: string
    emailAddress: string
  }[]
}

interface UserSettingsFormProps {
  user: SerializedUser
  clerkUser: SerializedClerkUser
  youtubeConnected: boolean
}

export default function UserSettingsForm({ user, clerkUser, youtubeConnected }: UserSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(user.name || "")
  const router = useRouter()
  const { toast } = useToast()

  const handleConnectYouTube = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/youtube")
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error("Failed to get YouTube auth URL")
      }
    } catch (error) {
      console.error("Error connecting YouTube:", error)
      toast({
        title: "Error",
        description: "Failed to connect YouTube account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnectYouTube = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users/youtube/disconnect", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "YouTube account disconnected successfully.",
        })
        router.refresh()
      } else {
        throw new Error("Failed to disconnect YouTube account")
      }
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

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        })
        router.refresh()
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={clerkUser.emailAddresses[0]?.emailAddress || ""}
              disabled
              placeholder="Your email"
            />
            <p className="text-xs text-muted-foreground">
              Email is managed by Clerk. Update it in your Clerk account settings.
            </p>
          </div>
        </div>

        <Button onClick={handleUpdateProfile} disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>YouTube Integration</CardTitle>
          <CardDescription>Connect your YouTube account to upload videos and create live streams</CardDescription>
        </CardHeader>
        <CardContent>
          {youtubeConnected ? (
            <>
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>YouTube Account Connected</AlertTitle>
                <AlertDescription>
                  Your YouTube account is connected. You can now upload videos and create live streams.
                </AlertDescription>
              </Alert>

              <Button variant="destructive" onClick={handleDisconnectYouTube} disabled={isLoading}>
                {isLoading ? "Disconnecting..." : "Disconnect YouTube Account"}
              </Button>
            </>
          ) : (
            <>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>YouTube Account Not Connected</AlertTitle>
                <AlertDescription>
                  To upload videos and create live streams, you need to connect your YouTube account.
                </AlertDescription>
              </Alert>

              <Button onClick={handleConnectYouTube} disabled={isLoading}>
                <Youtube className="mr-2 h-4 w-4" />
                {isLoading ? "Connecting..." : "Connect YouTube Account"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

