import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface InstructorDashboardProps {
  userId: string
}

export default function InstructorDashboard({ userId }: InstructorDashboardProps) {
  // This would normally fetch from the database
  const stats = {
    totalCourses: 8,
    totalStudents: 245,
    pendingApprovals: 2,
    upcomingLiveSessions: 1,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <Button asChild variant="link" className="px-0">
              <Link href="/dashboard/courses">View All</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+18 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Courses awaiting admin approval</p>
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

      <div className="flex justify-end gap-2">
        <Button asChild>
          <Link href="/dashboard/courses/create">Create New Course</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/live/create">Schedule Live Session</Link>
        </Button>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
              <CardDescription>Your recently created courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 text-sm text-muted-foreground">
                  <div>Title</div>
                  <div>Status</div>
                  <div>Students</div>
                  <div>Created</div>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <div>Advanced JavaScript Concepts</div>
                  <div className="text-green-500">Approved</div>
                  <div>87</div>
                  <div>2 weeks ago</div>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <div>React State Management</div>
                  <div className="text-green-500">Approved</div>
                  <div>64</div>
                  <div>1 month ago</div>
                </div>
                <div className="grid grid-cols-4 items-center">
                  <div>Building APIs with Node.js</div>
                  <div className="text-amber-500">Pending</div>
                  <div>0</div>
                  <div>2 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
              <CardDescription>Students enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>Student data would appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Performance metrics for your courses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart className="h-5 w-5" />
                <span>Analytics visualization would appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

