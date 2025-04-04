"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Search, ExternalLink } from "lucide-react"

interface StudentCourseListProps {
  courses: any[]
}

export default function StudentCourseList({ courses }: StudentCourseListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()))

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-xl font-medium mb-2">No enrolled courses yet</h3>
          <p className="text-muted-foreground mb-4">
            Explore our course catalog and enroll in courses to start learning
          </p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
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
            placeholder="Search enrolled courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/courses">Browse More Courses</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No courses found matching your search</p>
          </div>
        ) : (
          filteredCourses.map((course) => <EnrolledCourseCard key={course.id} course={course} />)
        )}
      </div>
    </div>
  )
}

function EnrolledCourseCard({ course }: { course: any }) {
  // Mock progress data - in a real app, this would come from the database
  const progress = Math.floor(Math.random() * 101)

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
        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.instructor.name}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <Button asChild className="w-full">
          <Link href={`/courses/${course.id}/watch`}>
            <ExternalLink className="h-4 w-4 mr-2" /> Continue Learning
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

