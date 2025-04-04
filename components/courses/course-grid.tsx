import Link from "next/link"
import { getCourses } from "@/lib/course-service"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function CourseGrid() {
  const courses = await getCourses()

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-xl font-medium">No courses found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden flex flex-col">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
              alt={course.title}
              className="object-cover w-full h-full transition-transform hover:scale-105"
            />
          </div>
          <CardHeader>
            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-2">Instructor: {course.instructor.name}</p>
            <p className="text-sm line-clamp-3">{course.description}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/courses/${course.id}`}>View Course</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

