"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
})

interface SectionCreationFormProps {
  courseId: string
}

export default function SectionCreationForm({ courseId }: SectionCreationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          courseId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create section")
      }

      const section = await response.json()

      toast({
        title: "Section created successfully!",
        description: "Now you can add lessons to this section.",
      })

      router.push(`/dashboard/courses/${courseId}/sections/${section.id}/lessons/create`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Failed to create section. Please try again.",
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
                  <FormLabel>Section Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction to the Course" {...field} />
                  </FormControl>
                  <FormDescription>Choose a clear title for this section of your course.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Section
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

