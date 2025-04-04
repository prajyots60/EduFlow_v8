"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface EnrollButtonProps {
  courseId: string
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [isEnrolling, setIsEnrolling] = useState(false)

  const handleEnroll = async () => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push(`/sign-in?redirect=/courses/${courseId}`)
      return
    }

    try {
      setIsEnrolling(true)

      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to enroll in course")
      }

      toast({
        title: "Enrolled successfully!",
        description: "You can now access the course content.",
      })

      router.push(`/courses/${courseId}/watch`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-2xl font-bold">Free</p>
          <p className="text-muted-foreground mt-1">Enroll now to access this course</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isEnrolling}>
          {isEnrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Enroll Now
        </Button>
      </CardFooter>
    </Card>
  )
}

