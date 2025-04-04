import { notFound, redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { getCourseWithSectionsAndLessons } from "@/lib/course-service"
import { getUserByClerkId } from "@/lib/user-service"
import { isUserEnrolled } from "@/lib/enrollment-service"
import VideoPlayer from "@/components/courses/video-player"
import CourseNotes from "@/components/courses/course-notes"
import CourseQA from "@/components/courses/course-qa"
import CourseSidebar from "@/components/courses/course-sidebar"

interface WatchPageProps {
  params: {
    courseId: string
  }
  searchParams: {
    lessonId?: string
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect(`/sign-in?redirect=/courses/${params.courseId}/watch`)
  }

  const user = await getUserByClerkId(clerkUser.id)

  if (!user) {
    redirect("/onboarding")
  }

  const course = await getCourseWithSectionsAndLessons(params.courseId)

  if (!course || !course.isApproved) {
    notFound()
  }

  const enrolled = await isUserEnrolled(user.id, params.courseId)

  if (!enrolled && user.role !== "admin") {
    redirect(`/courses/${params.courseId}`)
  }

  // Find the current lesson or default to the first one
  let currentLesson = null
  let firstLesson = null

  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      if (!firstLesson) {
        firstLesson = lesson
      }

      if (lesson.id === searchParams.lessonId) {
        currentLesson = lesson
        break
      }
    }

    if (currentLesson) break
  }

  // If no lesson is specified or found, use the first one
  if (!currentLesson && firstLesson) {
    redirect(`/courses/${params.courseId}/watch?lessonId=${firstLesson.id}`)
  }

  if (!currentLesson) {
    notFound()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <CourseSidebar course={course} currentLessonId={currentLesson.id} />

      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
          <p className="text-muted-foreground mb-6">
            {course.title} • {course.instructor.name}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <VideoPlayer youtubeVideoId={currentLesson.youtubeVideoId} />
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Lesson Description</h2>
                <p className="text-muted-foreground whitespace-pre-line">{currentLesson.description}</p>
              </div>
              <CourseQA courseId={course.id} lessonId={currentLesson.id} />
            </div>
            <div className="lg:col-span-1">
              <CourseNotes courseId={course.id} lessonId={currentLesson.id} userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

