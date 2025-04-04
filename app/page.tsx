import Link from "next/link"
import { ArrowRight, BookOpen, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeaturedCourses from "@/components/featured-courses"
import Testimonials from "@/components/testimonials"
import FAQSection from "@/components/faq-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Learn Anything, Teach Everything
                </h1>
                <p className="max-w-[600px] text-slate-500 md:text-xl dark:text-slate-400">
                  A zero-cost platform for instructors to create courses and host live classes using YouTube. Learn from
                  the best without breaking the bank.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/sign-up?role=student">
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sign-up?role=instructor">Become an Instructor</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/placeholder.svg?height=500&width=800"
                  alt="Platform preview"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 to-slate-900/0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-16 w-16 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    <Video className="h-8 w-8" />
                    <span className="sr-only">Play video</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Our Platform?</h2>
              <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-slate-400">
                We offer a unique learning experience with zero cost for both instructors and students.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <BookOpen className="h-6 w-6 text-slate-900 dark:text-slate-50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Unlimited Courses</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Access a wide range of courses from various disciplines, all hosted on YouTube.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Video className="h-6 w-6 text-slate-900 dark:text-slate-50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Live Classes</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Join interactive live sessions with instructors and fellow students.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Users className="h-6 w-6 text-slate-900 dark:text-slate-50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Community Learning</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Engage with a community of learners and instructors passionate about knowledge sharing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQSection />
    </div>
  )
}

