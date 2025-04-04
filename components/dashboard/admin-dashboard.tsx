import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface AdminDashboardProps {
  userId: string
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  // This would normally fetch from the database
  const stats = {
    totalUsers: 120,
    totalCourses: 45,
    pendingApprovals: 8,
    liveSessionsToday: 3,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">+4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <Button asChild variant="link" className="px-0">
              <Link href="/dashboard/admin/courses">Review Now</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Sessions Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.liveSessionsToday}</div>
            <p className="text-xs text-muted-foreground">Across all instructors</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Summary</CardTitle>
              <CardDescription>Overview of platform activity and growth</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart className="h-5 w-5" />
                <span>Analytics visualization would appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>In-depth platform metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart className="h-5 w-5" />
                <span>Detailed analytics would appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Download and view platform reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart className="h-5 w-5" />
                <span>Reports would be listed here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Signups</CardTitle>
            <CardDescription>New users who joined in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-sm text-muted-foreground">
                <div>Name</div>
                <div>Role</div>
                <div>Date</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>Sarah Johnson</div>
                <div>Student</div>
                <div>Today</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>Michael Brown</div>
                <div>Instructor</div>
                <div>Yesterday</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>Emily Davis</div>
                <div>Student</div>
                <div>2 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Course Submissions</CardTitle>
            <CardDescription>Courses submitted for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-sm text-muted-foreground">
                <div>Course</div>
                <div>Instructor</div>
                <div>Date</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>Advanced React Patterns</div>
                <div>John Smith</div>
                <div>Today</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>Python for Data Science</div>
                <div>Lisa Wong</div>
                <div>Yesterday</div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <div>UI/UX Design Principles</div>
                <div>David Miller</div>
                <div>3 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

