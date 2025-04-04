"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Search } from "lucide-react"

interface InstructorCourseListProps {
  courses: any[]
}

export default function InstructorCourseList({ courses }: InstructorCourseListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const approvedCourses = courses.filter((course) => course.isApproved)
  const pendingCourses = courses.filter((course) => !course.isApproved)

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredApprovedCourses = approvedCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPendingCourses = pendingCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-xl font-medium mb-2">No courses created yet</h3>
          <p className="text-muted-foreground mb-4">Start by creating your first course to share your knowledge</p>
          <Button asChild>
            <Link href="/dashboard/courses/create">
              <Plus className="h-4 w-4 mr-2" /> Create Your First Course
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/dashboard/courses/create">
            <Plus className="h-4 w-4 mr-2" /> Create New Course
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filteredApprovedCourses.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({filteredPendingCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No courses found matching your search</p>
              </div>
            ) : (
              filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApprovedCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No approved courses found</p>
              </div>
            ) : (
              filteredApprovedCourses.map((course) => <CourseCard key={course.id} course={course} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPendingCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No pending courses found</p>
              </div>
            ) : (
              filteredPendingCourses.map((course) => <CourseCard key={course.id} course={course} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
          alt={course.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
          <Badge variant={course.isApproved ? "default" : "outline"}>
            {course.isApproved ? "Approved" : "Pending"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="flex justify-between text-sm">
          <span>
            {course._count?.sections || 0} {course._count?.sections === 1 ? "Section" : "Sections"}
          </span>
          <span>
            {course._count?.enrollments || 0} {course._count?.enrollments === 1 ? "Student" : "Students"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/dashboard/courses/${course.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" /> Manage Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

