import { notFound } from "next/navigation"
import { getCourseById } from "@/lib/course-service"
import CourseHeader from "@/components/courses/course-header"
import CourseContent from "@/components/courses/course-content"
import EnrollButton from "@/components/courses/enroll-button"
import { currentUser } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/user-service"
import { isUserEnrolled } from "@/lib/enrollment-service"

interface CoursePageProps {
  params: {
    courseId: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourseById(params.courseId)

  if (!course || !course.isApproved) {
    notFound()
  }

  // Check if user is logged in and enrolled
  const clerkUser = await currentUser()
  let isEnrolled = false
  let userId = null

  if (clerkUser) {
    const user = await getUserByClerkId(clerkUser.id)
    if (user) {
      userId = user.id
      isEnrolled = await isUserEnrolled(user.id, params.courseId)
    }
  }

  return (
    <div className="container py-10">
      <CourseHeader title={course.title} instructor={course.instructor} thumbnail={course.thumbnail} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <CourseContent description={course.description} sections={course.sections} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <EnrollButton courseId={course.id} isEnrolled={isEnrolled} userId={userId} />
          </div>
        </div>
      </div>
    </div>
  )
}

