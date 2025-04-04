"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Video, Check, Copy, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  scheduledFor: z.date({
    required_error: "Please select a date and time.",
  }),
})

interface InstructorLiveStreamProps {
  isYouTubeConnected: boolean
  userId: string
}

export default function InstructorLiveStream({ isYouTubeConnected, userId }: InstructorLiveStreamProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [liveStreamData, setLiveStreamData] = useState<{
    broadcastId: string
    streamId: string
    streamKey: string
  } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  })

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
      setIsCreating(true)
      setLiveStreamData(null)

      // Create live stream on YouTube
      const response = await fetch("/api/youtube/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description || "",
          scheduledStartTime: values.scheduledFor.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create live stream")
      }

      const data = await response.json()
      setLiveStreamData(data)

      toast({
        title: "Live stream created successfully!",
        description: "Your live stream has been created on YouTube.",
      })

      // Don't reset the form so user can see what they entered
    } catch (error) {
      console.error(error)
      toast({
        title: "Failed to create live stream",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to clipboard.`,
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Create YouTube Live Stream</CardTitle>
        <CardDescription>Schedule and create live streams directly on your YouTube channel</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Stream Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Live Q&A Session" {...field} />
                  </FormControl>
                  <FormDescription>Choose a clear title for your live stream.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you'll cover in this live stream..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Provide details about your live stream.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled Date and Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":")
                            const newDate = new Date(field.value)
                            newDate.setHours(Number.parseInt(hours, 10))
                            newDate.setMinutes(Number.parseInt(minutes, 10))
                            field.onChange(newDate)
                          }}
                          defaultValue={format(field.value, "HH:mm")}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select when your live stream will start.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {liveStreamData && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-400">Live Stream Created</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <span>
                        Broadcast ID: <span className="font-mono">{liveStreamData.broadcastId}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(liveStreamData.broadcastId, "Broadcast ID")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        Stream Key: <span className="font-mono">{liveStreamData.streamKey}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(liveStreamData.streamKey, "Stream Key")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        RTMP URL: <span className="font-mono">rtmp://a.rtmp.youtube.com/live2</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard("rtmp://a.rtmp.youtube.com/live2", "RTMP URL")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isCreating || !isYouTubeConnected} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Live Stream...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Create Live Stream
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

