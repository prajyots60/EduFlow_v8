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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  thumbnail: z
    .string()
    .url({
      message: "Please enter a valid URL for the thumbnail.",
    })
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  mode: z.enum(["live", "video", "mixed"], {
    required_error: "Please select a course mode.",
  }),
})

interface CourseCreationFormProps {
  userId: string
}

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Other",
]

export default function CourseCreationForm({ userId }: CourseCreationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      price: 0,
      category: "Web Development",
      mode: "video",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          instructorId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      const course = await response.json()

      toast({
        title: "Course created successfully!",
        description: "Now you can add sections and lessons to your course.",
      })

      router.push(`/dashboard/courses/${course.id}/sections/create`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Failed to create course. Please try again.",
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
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Web Development Fundamentals" {...field} />
                  </FormControl>
                  <FormDescription>Choose a clear, descriptive title for your course.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what students will learn in this course..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of your course content and learning outcomes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Set the price for your course (0 for free).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose the category that best fits your course.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Course Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video" />
                        <Label htmlFor="video">Video Only - Pre-recorded video lectures</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="live" id="live" />
                        <Label htmlFor="live">Live Only - Live streaming sessions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mixed" id="mixed" />
                        <Label htmlFor="mixed">Mixed Mode - Both pre-recorded videos and live sessions</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>Select how you want to deliver your course content.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                  </FormControl>
                  <FormDescription>Provide a URL for your course thumbnail image.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

