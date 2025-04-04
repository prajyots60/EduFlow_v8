"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Check, RefreshCw, Search, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  instructor: {
    id: string
    name: string
  }
  isApproved: boolean
  createdAt: string
  thumbnail?: string
}

export default function CourseApprovals() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [approvingCourseId, setApprovingCourseId] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/courses?pending=true")

      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const approveCourse = async (courseId: string) => {
    try {
      setApprovingCourseId(courseId)

      const response = await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to approve course")
      }

      setCourses(courses.filter((course) => course.id !== courseId))

      toast({
        title: "Success",
        description: "Course approved successfully",
      })

      if (isDialogOpen) {
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to approve course",
        variant: "destructive",
      })
    } finally {
      setApprovingCourseId(null)
    }
  }

  const viewCourseDetails = (course: Course) => {
    setSelectedCourse(course)
    setIsDialogOpen(true)
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={fetchCourses} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No pending courses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.instructor.name}</TableCell>
                    <TableCell>
                      <Badge variant={course.isApproved ? "default" : "outline"}>
                        {course.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewCourseDetails(course)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        {!course.isApproved && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => approveCourse(course.id)}
                            disabled={approvingCourseId === course.id}
                          >
                            {approvingCourseId === course.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCourse.title}</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedCourse.instructor.name} on{" "}
                  {new Date(selectedCourse.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {selectedCourse.thumbnail && (
                  <div className="aspect-video w-full overflow-hidden rounded-md">
                    <img
                      src={selectedCourse.thumbnail || "/placeholder.svg"}
                      alt={selectedCourse.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40&text=${selectedCourse.instructor.name.charAt(0)}`}
                    />
                    <AvatarFallback>{selectedCourse.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">Instructor</h3>
                    <p className="text-sm text-muted-foreground">{selectedCourse.instructor.name}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{selectedCourse.description}</p>
                </div>

                {!selectedCourse.isApproved && (
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => approveCourse(selectedCourse.id)}
                      disabled={approvingCourseId === selectedCourse.id}
                    >
                      {approvingCourseId === selectedCourse.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve Course
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

