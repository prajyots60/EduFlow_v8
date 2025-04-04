"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.enum(["student", "instructor"], {
    required_error: "Please select a role.",
  }),
})

interface OnboardingFormProps {
  clerkId: string
  email: string
  name: string
}

export default function OnboardingForm({ clerkId, email, name }: OnboardingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || "",
      role: "student",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          role: values.role,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create user profile")
      }

      toast({
        title: "Profile created successfully!",
        description: "You can now access the platform.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Failed to create profile. Please try again.",
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>This is how you'll appear on the platform.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I want to join as a:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student">Student - I want to learn</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instructor" id="instructor" />
                        <Label htmlFor="instructor">Instructor - I want to teach</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {field.value === "instructor"
                      ? "As an instructor, you'll be able to create courses and host live sessions."
                      : "As a student, you'll be able to enroll in courses and join live sessions."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

