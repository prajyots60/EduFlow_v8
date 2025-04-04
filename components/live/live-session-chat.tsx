"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

interface LiveSessionChatProps {
  sessionId: string
  userId?: string | null
  userName?: string
}

// Mock chat messages for demo purposes
const initialMessages = [
  {
    id: "1",
    userId: "instructor",
    userName: "Instructor",
    content: "Welcome everyone to today's live session! We'll be starting in a few minutes.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    userId: "user1",
    userName: "Sarah Johnson",
    content: "Looking forward to this session!",
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: "3",
    userId: "user2",
    userName: "Michael Brown",
    content: "Hi everyone! First time joining a live session here.",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "4",
    userId: "instructor",
    userName: "Instructor",
    content: "Feel free to ask questions in the chat, and I'll address them during the Q&A section.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
]

export default function LiveSessionChat({ sessionId, userId, userName = "Guest" }: LiveSessionChatProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Simulate receiving new messages periodically
  useEffect(() => {
    const simulatedMessages = [
      {
        id: "5",
        userId: "user3",
        userName: "Emily Davis",
        content: "This is really helpful, thanks for explaining that concept!",
        timestamp: new Date().toISOString(),
      },
      {
        id: "6",
        userId: "user4",
        userName: "Alex Wilson",
        content: "Could you go over that last point again?",
        timestamp: new Date().toISOString(),
      },
      {
        id: "7",
        userId: "instructor",
        userName: "Instructor",
        content: "Great question, Alex! Let me explain that in more detail...",
        timestamp: new Date().toISOString(),
      },
    ]

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * simulatedMessages.length)
      const message = simulatedMessages[randomIndex]

      setMessages((prev) => [
        ...prev,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
      ])
    }, 30000) // Add a new message every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      userId: userId || "guest",
      userName: userName,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Live Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-[400px] px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${message.userName.charAt(0)}`} />
                  <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {message.userName}
                      {message.userId === "instructor" && (
                        <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          Instructor
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-3">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

