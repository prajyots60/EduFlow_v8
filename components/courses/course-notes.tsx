"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

interface CourseNotesProps {
  courseId: string
  lessonId: string
  userId: string
}

export default function CourseNotes({ courseId, lessonId, userId }: CourseNotesProps) {
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch notes for this lesson
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/notes?lessonId=${lessonId}`)

        if (response.ok) {
          const data = await response.json()
          setNotes(data.content || "")
        }
      } catch (error) {
        console.error("Error fetching notes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [lessonId])

  const saveNotes = async () => {
    try {
      setIsSaving(true)

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: notes,
          lessonId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save notes")
      }

      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error saving notes",
        description: "There was a problem saving your notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Textarea
              placeholder="Take notes while watching the course..."
              className="min-h-[200px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={saveNotes} className="mt-4 w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Notes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

