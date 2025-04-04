"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BarChart,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
  Video,
  Youtube,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  userRole: string
}

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      roles: ["admin", "instructor", "student"],
    },
    {
      href: "/dashboard/instructor",
      label: "Instructor Tools",
      icon: Youtube,
      active: pathname === "/dashboard/instructor",
      roles: ["instructor", "admin"],
    },
    {
      href: "/dashboard/courses",
      label: userRole === "student" ? "My Courses" : "Manage Courses",
      icon: BookOpen,
      active: pathname === "/dashboard/courses" || pathname.startsWith("/dashboard/courses/"),
      roles: ["instructor", "student", "admin"],
    },
    {
      href: "/dashboard/live",
      label: "Live Sessions",
      icon: Video,
      active: pathname === "/dashboard/live" || pathname.startsWith("/dashboard/live/"),
      roles: ["instructor", "student", "admin"],
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart,
      active: pathname === "/dashboard/analytics",
      roles: ["instructor", "admin"],
    },
    {
      href: "/dashboard/admin/users",
      label: "User Management",
      icon: Users,
      active: pathname === "/dashboard/admin/users",
      roles: ["admin"],
    },
    {
      href: "/dashboard/admin/courses",
      label: "Course Approvals",
      icon: BookOpen,
      active: pathname === "/dashboard/admin/courses",
      roles: ["admin"],
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
      roles: ["admin", "instructor", "student"],
    },
  ]

  const filteredRoutes = routes.filter((route) => route.roles.includes(userRole))

  return (
    <div
      className={`relative h-screen border-r bg-background transition-all duration-300 ${
        isCollapsed ? "w-[70px]" : "w-[250px]"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-3">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold">LearnAnything</span>
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
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {filteredRoutes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant={route.active ? "secondary" : "ghost"}
                className={`justify-start ${isCollapsed ? "px-2" : ""}`}
                size={isCollapsed ? "icon" : "default"}
              >
                <Link href={route.href}>
                  <route.icon className={`h-4 w-4 ${!isCollapsed && "mr-2"}`} />
                  {!isCollapsed && <span>{route.label}</span>}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

