// This file defines the database schema types for TypeScript
// These types match our Prisma schema

export type User = {
  id: string
  clerkId: string
  name: string
  email?: string
  role: "admin" | "instructor" | "student"
  createdAt: Date
  updatedAt: Date
  youtubeAccessToken?: string
  youtubeRefreshToken?: string
  youtubeChannelId?: string
  youtubeTokenExpiry?: Date
}

export type Course = {
  id: string
  title: string
  description: string
  thumbnail?: string
  instructorId: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
  price: number
  category: string
  mode: "live" | "video" | "mixed"
  instructor?: User
  sections?: Section[]
  enrollments?: Enrollment[]
}

export type Section = {
  id: string
  title: string
  courseId: string
  order: number
  createdAt: Date
  updatedAt: Date
  course?: Course
  lessons?: Lesson[]
}

export type Lesson = {
  id: string
  title: string
  description?: string
  sectionId: string
  order: number
  youtubeVideoId: string
  duration?: number
  isLive: boolean
  scheduledFor?: Date
  createdAt: Date
  updatedAt: Date
  section?: Section
  notes?: Note[]
  questions?: Question[]
  progress?: Progress[]
}

export type Enrollment = {
  id: string
  userId: string
  courseId: string
  createdAt: Date
  updatedAt: Date
  user?: User
  course?: Course
  progress?: Progress[]
}

export type Progress = {
  id: string
  userId: string
  lessonId: string
  enrollmentId: string
  watchedSeconds: number
  completed: boolean
  lastWatched: Date
  createdAt: Date
  updatedAt: Date
  user?: User
  lesson?: Lesson
  enrollment?: Enrollment
}

export type Note = {
  id: string
  content: string
  userId: string
  lessonId: string
  createdAt: Date
  updatedAt: Date
  user?: User
  lesson?: Lesson
}

export type Question = {
  id: string
  content: string
  userId: string
  lessonId: string
  createdAt: Date
  updatedAt: Date
  user?: User
  lesson?: Lesson
  answers?: Answer[]
}

export type Answer = {
  id: string
  content: string
  userId: string
  questionId: string
  createdAt: Date
  updatedAt: Date
  user?: User
  question?: Question
}

export type LiveSession = {
  id: string
  title: string
  description?: string
  instructorId: string
  youtubeLiveId: string
  streamKey?: string
  scheduledFor: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
  instructor?: User
}

