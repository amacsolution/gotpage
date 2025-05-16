"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

type Message = {
  id: string
  content: string
  timestamp: string
  isMine: boolean
  isRead: boolean
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const conversationId = params.id

  useEffect(() => {
    // Fetch conversation details and messages
    const fetchConversation = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/messages/conversations/${conversationId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
          setUser(data.user)

          // Mark messages as read
          fetch(`/api/messages/read/${conversationId}`, { method: "POST" }).catch((error) =>
            console.error("Error marking as read:", error),
          )
        } else {
          // Handle error - conversation not found or not authorized
          router.push("/wiadomosci")
        }
      } catch (error) {
        console.error("Error fetching conversation:", error)
      } finally {
        setLoading(false)
      }
    }

    if (conversationId) {
      fetchConversation()

      // Set up polling for new messages
      const interval = setInterval(() => {
        fetchConversation()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [conversationId, router])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage,
          messageId: uuidv4(),
        }),
      })

      if (response.ok) {
        // Add message to the list
        const data = await response.json()
        setMessages((prev) => [...prev, data.message])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] items-center justify-center py-8">
        <p>Ładowanie konwersacji...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/wiadomosci">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Konwersacja z {user?.name}</h1>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center gap-3 border-b p-4">
          <Avatar className="h-10 w-10">
            <div className="bg-muted flex h-full w-full items-center justify-center">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            {user?.isOnline ? (
              <p className="text-sm text-green-500">Online</p>
            ) : (
              <p className="text-sm text-muted-foreground">Ostatnio online: {user?.lastSeen}</p>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-350px)] p-4">
          <div className="flex flex-col gap-3">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-70">
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.isMine && message.isRead && <span>✓✓</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
                <p>Rozpocznij konwersację</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napisz wiadomość..."
            className="flex-1"
          />
          <Button type="submit">Wyślij</Button>
        </form>
      </div>
    </div>
  )
}
