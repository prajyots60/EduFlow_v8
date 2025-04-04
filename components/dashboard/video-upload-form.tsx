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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Video } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  video: z.instanceof(File, {
    message: "Video file is required.",
  }),
})

interface VideoUploadFormProps {
  onUploadComplete: (youtubeVideoId: string) => void
  sectionId?: string
}

export default function VideoUploadForm({ onUploadComplete, sectionId }: VideoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Create FormData
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("description", values.description || "")
      formData.append("video", values.video)
      if (sectionId) {
        formData.append("sectionId", sectionId)
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 500)

      // Upload to YouTube
      const response = await fetch("/api/youtube/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload video")
      }

      setUploadProgress(100)

      const { youtubeVideoId } = await response.json()

      toast({
        title: "Video uploaded successfully!",
        description: "Your video has been uploaded to YouTube.",
      })

      // Reset form
      form.reset()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Call callback with YouTube video ID
      onUploadComplete(youtubeVideoId)
    } catch (error) {
      console.error(error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const selectedFile = form.watch("video")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
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
              render={() => (
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
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          disabled={isUploading}
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
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button type="submit" disabled={isUploading || !selectedFile}>
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

