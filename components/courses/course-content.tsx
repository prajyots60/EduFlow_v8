import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface CourseContentProps {
  description: string
}

export default function CourseContent({ description }: CourseContentProps) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        <TabsTrigger value="instructor">Instructor</TabsTrigger>
      </TabsList>
      <TabsContent value="about">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">About This Course</h3>
            <p className="text-muted-foreground whitespace-pre-line">{description}</p>

            <h3 className="text-lg font-medium mt-6 mb-2">What You'll Learn</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Comprehensive understanding of the subject matter</li>
              <li>Practical skills that you can apply immediately</li>
              <li>Industry best practices and techniques</li>
              <li>How to solve common problems in this field</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="curriculum">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Course Curriculum</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Section 1: Introduction</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex justify-between items-center text-sm p-2 border rounded-md">
                    <span>1. Welcome to the Course</span>
                    <span className="text-muted-foreground">5:30</span>
                  </li>
                  <li className="flex justify-between items-center text-sm p-2 border rounded-md">
                    <span>2. Course Overview</span>
                    <span className="text-muted-foreground">10:15</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Section 2: Getting Started</h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex justify-between items-center text-sm p-2 border rounded-md">
                    <span>3. Setting Up Your Environment</span>
                    <span className="text-muted-foreground">15:45</span>
                  </li>
                  <li className="flex justify-between items-center text-sm p-2 border rounded-md">
                    <span>4. Basic Concepts</span>
                    <span className="text-muted-foreground">20:30</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="instructor">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src="/placeholder.svg?height=96&width=96"
                  alt="Instructor"
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium">About the Instructor</h3>
                <p className="text-muted-foreground mt-2">
                  Our instructor is an expert in this field with years of practical experience. They have worked with
                  leading companies and have a passion for teaching and sharing their knowledge with students around the
                  world.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

