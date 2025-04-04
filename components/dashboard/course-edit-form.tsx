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
import { Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
})

interface CourseEditFormProps {
  course: any
  userId: string
}

export default function CourseEditForm({ course, userId }: CourseEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to update course")
      }

      toast({
        title: "Course updated successfully!",
        description: "Your changes have been saved.",
      })

      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteCourse() {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      toast({
        title: "Course deleted successfully!",
        description: "Your course has been permanently deleted.",
      })

      router.push("/dashboard/courses")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
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

              <div className="flex justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Course
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your course and all associated
                        sections, lessons, and student enrollments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteCourse}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Course"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Course Status</h3>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.isApproved
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                }`}
              >
                {course.isApproved ? "Approved" : "Pending Approval"}
              </div>
            </div>

            {!course.isApproved && (
              <p className="text-sm text-muted-foreground">
                Your course is currently pending approval by an administrator. You can continue to edit and add content
                while waiting for approval.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">{new Date(course.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sections</p>
                <p className="text-sm text-muted-foreground">{course.sections.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Enrollments</p>
                <p className="text-sm text-muted-foreground">{course._count?.enrollments || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

