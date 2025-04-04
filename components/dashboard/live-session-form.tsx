"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  scheduledFor: z.date({
    required_error: "Please select a date and time.",
  }),
})

interface LiveSessionFormProps {
  userId: string
  courseId?: string
  onSuccess?: (liveSession: any) => void
}

export default function LiveSessionForm({ userId, courseId, onSuccess }: LiveSessionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Create live session on YouTube
      const youtubeResponse = await fetch("/api/youtube/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          scheduledStartTime: values.scheduledFor.toISOString(),
        }),
      })

      if (!youtubeResponse.ok) {
        const errorData = await youtubeResponse.json()
        throw new Error(errorData.error || "Failed to create YouTube live broadcast")
      }

      const { broadcastId, streamKey } = await youtubeResponse.json()

      // Create live session in database
      const response = await fetch("/api/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          scheduledFor: values.scheduledFor,
          youtubeLiveId: broadcastId,
          streamKey,
          ...(courseId && { courseId }),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create live session")
      }

      const liveSession = await response.json()

      toast({
        title: "Live session created successfully!",
        description: "Your live session has been scheduled.",
      })

      if (onSuccess) {
        onSuccess(liveSession)
      } else {
        router.push("/dashboard/live")
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to create live session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Live Q&A: JavaScript Fundamentals" {...field} />
                  </FormControl>
                  <FormDescription>Choose a clear, descriptive title for your live session.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you'll cover in this live session..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what students can expect from this live session.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date and Time</FormLabel>
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
                  <FormDescription>Select when your live session will take place.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Live Session
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

