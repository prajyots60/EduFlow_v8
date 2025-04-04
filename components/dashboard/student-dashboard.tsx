import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StudentDashboardProps {
  userId: string
}

export default function StudentDashboard({ userId }: StudentDashboardProps) {
  // This would normally fetch from the database
  const stats = {
    enrolledCourses: 5,
    completedCourses: 2,
    upcomingLiveSessions: 3,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
            <Button asChild variant="link" className="px-0">
              <Link href="/dashboard/courses">View All</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">40% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Live Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingLiveSessions}</div>
            <Button asChild variant="link" className="px-0">
              <Link href="/dashboard/live">View Schedule</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/courses">Explore More Courses</Link>
        </Button>
      </div>

      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="live">Live Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courses In Progress</CardTitle>
              <CardDescription>Continue where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 text-sm text-muted-foreground">
                  <div>Course</div>
                  <div>Instructor</div>
                  <div>Progress</div>
                  <div>Last Accessed</div>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <div>Web Development Fundamentals</div>
                  <div>John Doe</div>
                  <div>75%</div>
                  <div>Yesterday</div>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <div>Advanced JavaScript Concepts</div>
                  <div>Jane Smith</div>
                  <div>30%</div>
                  <div>3 days ago</div>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <div>Mobile App Development</div>
                  <div>Mike Johnson</div>
                  <div>10%</div>
                  <div>1 week ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Courses</CardTitle>
              <CardDescription>Courses you've successfully completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 text-sm text-muted-foreground">
                  <div>Course</div>
                  <div>Instructor</div>
                  <div>Completed On</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div>HTML & CSS Basics</div>
                  <div>Sarah Williams</div>
                  <div>2 months ago</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div>Introduction to JavaScript</div>
                  <div>John Doe</div>
                  <div>1 month ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Live Sessions</CardTitle>
              <CardDescription>Live classes you're registered for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 text-sm text-muted-foreground">
                  <div>Session</div>
                  <div>Instructor</div>
                  <div>Date & Time</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div>React Performance Optimization</div>
                  <div>Jane Smith</div>
                  <div>Tomorrow, 2:00 PM</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div>Building APIs with Node.js</div>
                  <div>Mike Johnson</div>
                  <div>Apr 5, 10:00 AM</div>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <div>Advanced CSS Techniques</div>
                  <div>Sarah Williams</div>
                  <div>Apr 8, 3:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

