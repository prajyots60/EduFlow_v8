import { Suspense } from "react"
import CourseFilters from "@/components/courses/course-filters"
import CourseGrid from "@/components/courses/course-grid"
import CourseListSkeleton from "@/components/courses/course-list-skeleton"

export default function CoursesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Explore Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <CourseFilters />
        </div>
        <div className="md:col-span-3">
          <Suspense fallback={<CourseListSkeleton />}>
            <CourseGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

