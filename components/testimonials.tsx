import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Student",
      content:
        "This platform has completely transformed my learning experience. The courses are well-structured and the YouTube integration makes it so easy to follow along.",
      avatar: "AJ",
    },
    {
      name: "Sarah Williams",
      role: "Instructor",
      content:
        "As an instructor, I love how simple it is to create and share my courses. The zero-cost model means I can focus on teaching without worrying about platform fees.",
      avatar: "SW",
    },
    {
      name: "Michael Brown",
      role: "Student",
      content:
        "The live classes feature is amazing! Being able to interact with instructors in real-time has helped me grasp complex concepts much faster.",
      avatar: "MB",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
            <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-slate-400">
              Hear from our community of students and instructors.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-6 py-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/placeholder.svg?height=64&width=64&text=${testimonial.avatar}`} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-bold">{testimonial.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 dark:text-slate-400">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

