"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CourseQAProps {
  courseId: string
  lessonId: string
}

export default function CourseQA({ courseId, lessonId }: CourseQAProps) {
  const { user, isLoaded } = useUser()
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // Fetch questions for this lesson
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/questions?lessonId=${lessonId}`)

        if (response.ok) {
          const data = await response.json()
          setQuestions(data)
        }
      } catch (error) {
        console.error("Error fetching questions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [lessonId])

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) return

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: question,
          lessonId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit question")
      }

      const newQuestion = await response.json()

      setQuestions((prev) => [newQuestion, ...prev])
      setQuestion("")

      toast({
        title: "Question submitted",
        description: "Your question has been submitted successfully.",
      })
    } catch (error) {
      console.error("Error submitting question:", error)
      toast({
        title: "Error submitting question",
        description: "There was a problem submitting your question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (questionId: string) => {
    if (!replyContent.trim()) return

    try {
      setIsSubmittingReply(true)

      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit reply")
      }

      const newAnswer = await response.json()

      // Update the questions array with the new answer
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q)))

      setReplyingTo(null)
      setReplyContent("")

      toast({
        title: "Reply submitted",
        description: "Your reply has been submitted successfully.",
      })
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast({
        title: "Error submitting reply",
        description: "There was a problem submitting your reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReply(false)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Questions & Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <Textarea
              placeholder="Ask a question about this lesson..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!isLoaded || !question.trim() || isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                Submit Question
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No questions yet</p>
                <p className="text-sm text-muted-foreground">Be the first to ask a question about this lesson</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${question.user.name.charAt(0)}`} />
                    <AvatarFallback>{question.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{question.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2">{question.content}</p>

                    {question.answers.length > 0 && (
                      <div className="mt-4 pl-6 border-l-2 space-y-4">
                        {question.answers.map((answer: any) => (
                          <div key={answer.id} className="flex gap-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=${answer.user.name.charAt(0)}`}
                              />
                              <AvatarFallback>{answer.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{answer.user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(answer.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="mt-1">{answer.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {replyingTo === question.id ? (
                      <div className="mt-4 pl-6">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[80px] text-sm"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(question.id)}
                            disabled={!replyContent.trim() || isSubmittingReply}
                          >
                            {isSubmittingReply ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-3 w-3" />
                            )}
                            Reply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(question.id)}>
                          Reply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

