"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Circle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CourseSidebarProps {
  course: any
  currentLessonId: string
}

export default function CourseSidebar({ course, currentLessonId }: CourseSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Count total lessons
  const totalLessons = course.sections.reduce((total: number, section: any) => {
    return total + section.lessons.length
  }, 0)

  // Find current lesson index
  let currentLessonIndex = 0
  let lessonCounter = 0

  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      if (lesson.id === currentLessonId) {
        currentLessonIndex = lessonCounter
      }
      lessonCounter++
    }
  }

  // Calculate progress (for demo purposes - in a real app this would come from the database)
  const progress = Math.round(((currentLessonIndex + 1) / totalLessons) * 100)

  return (
    <div
      className={cn(
        "relative h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[300px]",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          {!isCollapsed && (
            <Link href={`/courses/${course.id}`} className="truncate font-medium">
              {course.title}
            </Link>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-20 h-8 w-8 rounded-full border bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {!isCollapsed && (
          <div className="px-4 py-3 border-b">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          {isCollapsed ? (
            <div className="py-2">
              {course.sections.map((section: any) => (
                <div key={section.id} className="py-1">
                  {section.lessons.map((lesson: any) => (
                    <Link
                      key={lesson.id}
                      href={`${pathname}?lessonId=${lesson.id}`}
                      className={cn(
                        "flex h-8 w-full items-center justify-center",
                        lesson.id === currentLessonId
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary/50",
                      )}
                    >
                      {lesson.id === currentLessonId ? <Play className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {course.sections.map((section: any, sectionIndex: number) => (
                <div key={section.id}>
                  <h3 className="font-medium mb-2">
                    {sectionIndex + 1}. {section.title}
                  </h3>
                  <div className="space-y-1 pl-2">
                    {section.lessons.map((lesson: any, lessonIndex: number) => (
                      <Link
                        key={lesson.id}
                        href={`${pathname}?lessonId=${lesson.id}`}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1 rounded-md text-sm",
                          lesson.id === currentLessonId
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary/50",
                        )}
                      >
                        <div className="flex-shrink-0">
                          {lesson.id === currentLessonId ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                        <span className="truncate">
                          {lessonIndex + 1}. {lesson.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

