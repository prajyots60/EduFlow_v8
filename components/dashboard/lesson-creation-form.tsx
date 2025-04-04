"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileVideo, LinkIcon, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface LessonCreationFormProps {
  sectionId: string
  courseId: string
}

export default function LessonCreationForm({ sectionId, courseId }: LessonCreationFormProps) {
  const [activeTab, setActiveTab] = useState("link")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a lesson title",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      if (activeTab === "link") {
        // Create lesson with existing YouTube video ID
        if (!videoUrl) {
          toast({
            title: "Error",
            description: "Please enter a YouTube video URL or ID",
            variant: "destructive",
          })
          return
        }

        // Extract video ID if full URL is provided
        const videoId = extractYouTubeVideoId(videoUrl)

        if (!videoId) {
          toast({
            title: "Error",
            description: "Invalid YouTube video URL or ID",
            variant: "destructive",
          })
          return
        }

        const response = await fetch("/api/lessons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            videoId,
            sectionId,
            type: "video",
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create lesson")
        }

        toast({
          title: "Success",
          description: "Lesson created successfully",
        })

        // Ask if they want to add another lesson or go back to course edit
        handleLessonCreated()
      } else if (activeTab === "upload" && videoFile) {
        // Upload progress simulation
        const uploadInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(uploadInterval)
              return 95
            }
            return prev + 5
          })
        }, 500)

        // Create FormData for file upload
        const formData = new FormData()
        formData.append("file", videoFile)
        formData.append("title", title)
        formData.append("description", description)

        // Upload to YouTube
        const uploadResponse = await fetch("/api/youtube/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          clearInterval(uploadInterval)
          throw new Error("Failed to upload video to YouTube")
        }

        const uploadData = await uploadResponse.json()
        setUploadProgress(100)

        // Create lesson with the uploaded video ID
        const lessonResponse = await fetch("/api/lessons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            videoId: uploadData.videoId,
            sectionId,
            type: "video",
          }),
        })

        if (!lessonResponse.ok) {
          throw new Error("Failed to create lesson")
        }

        toast({
          title: "Success",
          description: "Video uploaded and lesson created successfully",
        })

        // Ask if they want to add another lesson or go back to course edit
        handleLessonCreated()
      }
    } catch (error) {
      console.error("Error creating lesson:", error)
      toast({
        title: "Error",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleLessonCreated = () => {
    // Reset form
    setTitle("")
    setDescription("")
    setVideoUrl("")
    setVideoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // Ask if they want to add another lesson
    const addAnother = window.confirm(
      "Lesson created successfully! Would you like to add another lesson to this section?",
    )

    if (!addAnother) {
      // Redirect back to course edit page
      router.push(`/dashboard/courses/${courseId}/edit/sections`)
    }
  }

  const extractYouTubeVideoId = (url: string) => {
    // If it's already just an ID (11 characters)
    if (url.length === 11) {
      return url
    }

    // Try to extract from URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter lesson description"
              disabled={isLoading}
              rows={4}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" disabled={isLoading}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Link Existing Video
              </TabsTrigger>
              <TabsTrigger value="upload" disabled={isLoading}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Video
              </TabsTrigger>
            </TabsList>
            <TabsContent value="link">
              <Card>
                <CardHeader>
                  <CardTitle>Link to Existing YouTube Video</CardTitle>
                  <CardDescription>Enter a YouTube video URL or video ID to link to this lesson</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">YouTube Video URL or ID</Label>
                    <Input
                      id="videoUrl"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=xxxxx or xxxxx"
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter either the full YouTube URL or just the video ID (11 characters)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Video to YouTube</CardTitle>
                  <CardDescription>Upload a video file to your connected YouTube account</CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadProgress > 0 && (
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="videoFile">Video File</Label>
                      <Input
                        id="videoFile"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        ref={fileInputRef}
                      />
                      <p className="text-sm text-muted-foreground">
                        Select a video file to upload (MP4, MOV, AVI, etc.)
                      </p>
                    </div>

                    {videoFile && (
                      <Alert>
                        <FileVideo className="h-4 w-4" />
                        <AlertTitle>Selected File</AlertTitle>
                        <AlertDescription>
                          {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating Lesson..." : "Create Lesson"}
          </Button>
        </div>
      </form>
    </div>
  )
}

