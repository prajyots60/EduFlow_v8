"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import Link from "next/link"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface SectionManagerProps {
  courseId: string
  sections: any[]
}

export default function SectionManager({ courseId, sections }: SectionManagerProps) {
  const router = useRouter()
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null)

  const handleEditSection = (section: any) => {
    setEditingSectionId(section.id)
    setEditingSectionTitle(section.title)
  }

  const handleCancelEdit = () => {
    setEditingSectionId(null)
    setEditingSectionTitle("")
  }

  const handleUpdateSection = async (sectionId: string) => {
    if (!editingSectionTitle.trim()) {
      toast({
        title: "Error",
        description: "Section title cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdating(true)

      const response = await fetch(`/api/sections/${sectionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingSectionTitle,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update section")
      }

      toast({
        title: "Section updated",
        description: "Section title has been updated successfully",
      })

      setEditingSectionId(null)
      setEditingSectionTitle("")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      setIsDeleting(true)
      setDeletingSectionId(sectionId)

      const response = await fetch(`/api/sections/${sectionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete section")
      }

      toast({
        title: "Section deleted",
        description: "Section and all its lessons have been deleted",
      })

      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingSectionId(null)
    }
  }

  if (sections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-xl font-medium mb-2">No sections yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first section to organize your course content
          </p>
          <Button asChild>
            <Link href={`/dashboard/courses/${courseId}/sections/create`}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Section
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader className="pb-3">
            {editingSectionId === section.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editingSectionTitle}
                  onChange={(e) => setEditingSectionTitle(e.target.value)}
                  placeholder="Section title"
                  className="flex-1"
                />
                <Button size="sm" onClick={() => handleUpdateSection(section.id)} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <CardTitle>{section.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditSection(section)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this section and all its lessons. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSection(section.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting && deletingSectionId === section.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">
                  {section.lessons.length} {section.lessons.length === 1 ? "Lesson" : "Lessons"}
                </h4>
                <Button asChild size="sm">
                  <Link href={`/dashboard/courses/${courseId}/sections/${section.id}/lessons/create`}>
                    <Plus className="h-4 w-4 mr-2" /> Add Lesson
                  </Link>
                </Button>
              </div>

              {section.lessons.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="lessons">
                    <AccordionTrigger>View Lessons</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        {section.lessons.map((lesson: any, index: number) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 rounded-md border">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                              <span className="text-sm font-medium">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" asChild>
                                <Link
                                  href={`/dashboard/courses/${courseId}/sections/${section.id}/lessons/${lesson.id}/edit`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <p className="text-sm text-muted-foreground italic">No lessons in this section yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

