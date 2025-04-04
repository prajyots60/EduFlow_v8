"use client"

import type React from "react"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Video, Check, Copy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  video: z
    .instanceof(File, {
      message: "Video file is required.",
    })
    .refine(
      (file) => file.size <= 2 * 1024 * 1024 * 1024, // 2GB
      {
        message: "Video file must be less than 2GB.",
      },
    ),
})

interface InstructorVideoUploadProps {
  isYouTubeConnected: boolean
  userId: string
}

export default function InstructorVideoUpload({ isYouTubeConnected, userId }: InstructorVideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("video", file)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isYouTubeConnected) {
      toast({
        title: "YouTube account not connected",
        description: "Please connect your YouTube account in settings first.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadedVideoId(null)

      // Create FormData
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("description", values.description || "")
      formData.append("video", values.video)

      // Set up progress tracking with XMLHttpRequest
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/youtube/upload", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress > 95 ? 95 : progress) // Cap at 95% until complete
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setUploadProgress(100)
          setUploadedVideoId(response.youtubeVideoId)

          toast({
            title: "Video uploaded successfully!",
            description: "Your video has been uploaded to YouTube.",
          })

          // Reset form but keep the success message
          form.reset({
            title: "",
            description: "",
          })
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        } else {
          let errorMessage = "Failed to upload video"
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error || errorMessage
          } catch (e) {
            // Use default error message
          }
          throw new Error(errorMessage)
        }
      }

      xhr.onerror = () => {
        throw new Error("Network error occurred while uploading")
      }

      xhr.send(formData)
    } catch (error) {
      console.error(error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video. Please try again.",
        variant: "destructive",
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const copyVideoId = () => {
    if (uploadedVideoId) {
      navigator.clipboard.writeText(uploadedVideoId)
      toast({
        title: "Copied to clipboard",
        description: "YouTube Video ID has been copied to clipboard.",
      })
    }
  }

  const selectedFile = form.watch("video")

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upload Video to YouTube</CardTitle>
        <CardDescription>Upload videos directly to your YouTube account as unlisted videos</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction to JavaScript" {...field} />
                  </FormControl>
                  <FormDescription>Choose a clear title for this video.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this video covers..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormDescription>Provide additional details about this video.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Video File</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center w-full">
                      <label
                        htmlFor="video-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Video className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">MP4, MOV, or AVI (MAX. 2GB)</p>
                        </div>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              onChange(file)
                            }
                          }}
                          disabled={isUploading}
                          ref={fileInputRef}
                          {...rest}
                        />
                      </label>
                    </div>
                  </FormControl>
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Selected file: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading to YouTube...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadedVideoId && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-400">Upload Successful</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  <div className="flex items-center gap-2 mt-1">
                    <span>
                      YouTube Video ID: <span className="font-mono">{uploadedVideoId}</span>
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyVideoId}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isUploading || !selectedFile || !isYouTubeConnected} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to YouTube
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

