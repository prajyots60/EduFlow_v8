"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, BookOpen, Calendar, TrendingUp } from "lucide-react"

interface AnalyticsDashboardProps {
  courses: any[]
  liveSessions: any[]
}

export default function AnalyticsDashboard({ courses, liveSessions }: AnalyticsDashboardProps) {
  // Calculate total enrollments across all courses
  const totalEnrollments = courses.reduce((total, course) => {
    return total + (course._count?.enrollments || 0)
  }, 0)

  // Calculate total sections across all courses
  const totalSections = courses.reduce((total, course) => {
    return total + (course._count?.sections || 0)
  }, 0)

  // Get upcoming live sessions
  const upcomingLiveSessions = liveSessions.filter((session) => {
    return new Date(session.scheduledFor) > new Date()
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter((c) => c.isApproved).length} approved, {courses.filter((c) => !c.isApproved).length}{" "}
              pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Across all your courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSections}</div>
            <p className="text-xs text-muted-foreground">Across all your courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Live Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingLiveSessions.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled live sessions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>Enrollment statistics for your courses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col">
              {courses.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-muted-foreground mb-2">No course data available</p>
                    <p className="text-sm text-muted-foreground">Create courses to see analytics</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Course</span>
                      <span>Enrollments</span>
                    </div>
                    <div className="space-y-2">
                      {courses
                        .sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0))
                        .slice(0, 5)
                        .map((course) => (
                          <div key={course.id} className="flex items-center justify-between">
                            <div className="flex-1 truncate mr-4">
                              <span className="font-medium">{course.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{
                                    width: `${Math.min(100, ((course._count?.enrollments || 0) / Math.max(1, totalEnrollments)) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">{course._count?.enrollments || 0}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart className="h-5 w-5" />
                      <span>Detailed analytics visualization would appear here</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
              <CardDescription>How students are interacting with your content</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>Student engagement analytics would appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>Enrollment and engagement growth over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-5 w-5" />
                <span>Growth trend visualization would appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Live Session Performance</CardTitle>
          <CardDescription>Attendance and engagement for your live sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {liveSessions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center">
              <div>
                <p className="text-muted-foreground mb-2">No live session data available</p>
                <p className="text-sm text-muted-foreground">Schedule live sessions to see analytics</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-sm text-muted-foreground">
                <div>Session</div>
                <div>Date</div>
                <div>Status</div>
                <div>Attendees</div>
              </div>
              {liveSessions.slice(0, 5).map((session) => {
                const sessionDate = new Date(session.scheduledFor)
                const isUpcoming = sessionDate > new Date()
                const isPast = sessionDate < new Date()

                return (
                  <div key={session.id} className="grid grid-cols-4 items-center">
                    <div className="font-medium truncate">{session.title}</div>
                    <div>{sessionDate.toLocaleDateString()}</div>
                    <div>
                      {isUpcoming && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-700/30">
                          Upcoming
                        </span>
                      )}
                      {isPast && (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-700/30">
                          Completed
                        </span>
                      )}
                    </div>
                    <div>
                      {isPast
                        ? // Mock data for completed sessions
                          `${Math.floor(Math.random() * 50) + 10} attendees`
                        : "—"}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

