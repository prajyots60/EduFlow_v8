"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const { isSignedIn, isLoaded } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hideNavigation, setHideNavigation] = useState(false)

  // Hide navigation on dashboard and authenticated pages
  useEffect(() => {
    if (isLoaded) {
      const shouldHideNav =
        isSignedIn &&
        (pathname === "/" ||
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/courses") ||
          pathname.startsWith("/live"))
      setHideNavigation(shouldHideNav)
    }
  }, [isSignedIn, pathname, isLoaded])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
      showWhenLoggedIn: false,
    },
    {
      href: "/courses",
      label: "Courses",
      active: pathname === "/courses",
      showWhenLoggedIn: true,
    },
    {
      href: "/live",
      label: "Live Classes",
      active: pathname === "/live",
      showWhenLoggedIn: true,
    },
  ]

  const filteredRoutes = routes.filter((route) => !isSignedIn || route.showWhenLoggedIn)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={isSignedIn ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <span className="font-bold text-xl">LearnAnything</span>
          </Link>
          {!hideNavigation && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              {filteredRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    route.active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isSignedIn ? (
            <>
              <Button asChild variant="ghost" size="sm" className="mr-2">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </div>
          )}
          <button className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col space-y-3 p-4">
            {filteredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  route.active ? "text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

