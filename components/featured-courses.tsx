import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturedCourses() {
  // This would normally fetch from the database
  const featuredCourses = [
    {
      id: "1",
      title: "Web Development Fundamentals",
      instructor: "John Doe",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "2",
      title: "Advanced JavaScript Concepts",
      instructor: "Jane Smith",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "3",
      title: "Mobile App Development with React Native",
      instructor: "Mike Johnson",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Courses</h2>
            <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-slate-400">
              Explore our most popular courses and start learning today.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">Instructor: {course.instructor}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/courses" className="flex items-center">
              View All Courses <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

