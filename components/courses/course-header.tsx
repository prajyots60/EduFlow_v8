import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface CourseHeaderProps {
  title: string
  instructor: {
    id: string
    name: string
  }
  thumbnail?: string
}

export default function CourseHeader({ title, instructor, thumbnail }: CourseHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${instructor.name.charAt(0)}`} />
                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{instructor.name}</span>
            </div>
            <Badge variant="outline">YouTube Course</Badge>
          </div>
        </div>
        <div className="md:w-1/3">
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={thumbnail || "/placeholder.svg?height=200&width=300"}
              alt={title}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

