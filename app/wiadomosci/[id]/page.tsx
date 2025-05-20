"use client"

import type React from "react"

import { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea, ScrollAreaMessages } from "@/components/ui/scroll-area"
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

export default function ConversationPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
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

      // // Set up polling for new messages
      // const interval = setInterval(() => {
      //   fetchConversation()
      // }, 5000)

      // return () => clearInterval(interval)
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
    <div className="md:container h-dvh mx-auto md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/wiadomosci">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Konwersacja z {user?.name}</h1>
      </div>

      <div className="rounded-lg border h-full flex flex-col">
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

        <ScrollAreaMessages className="flex-1 flex flex-col-reverse overflow-y-auto p-2 justyfy-end" style={{ minHeight: 0 }}>
          <div className="flex flex-col-reverse justify-end">
        {messages.length > 0 ? (
          messages
            .slice()
            .reverse()
            .map((message, idx, arr) => {
          const nextMessage = arr[idx - 1]
          const isFirst = idx === arr.length - 1
          const showTimestamp =
            isFirst ||
            !nextMessage ||
            new Date(nextMessage.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) !==
              new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
              })

          return (
            <div
              key={message.id}
              className={`flex items-center ${message.isMine ? "justify-end" : "justify-start"} ${
            showTimestamp ? "mb-2" : "mb-[1px]"
              }`}
            >
              {showTimestamp && (
            <div className="mr-2 text-xs text-muted-foreground opacity-70 min-w-[44px] text-right">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
              )}
              <div className="flex items-center max-w-[70%]">
            <div
              className={`rounded-lg px-3 py-1 ${
                message.isMine ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <p className="mb-0">{message.content}</p>
            </div>
            {message.isMine && showTimestamp ? (
              <span className="ml-2 text-xs opacity-70">
                {message.isRead ? "✓✓" : "✓"}
              </span>
            ) : (
              <span className="ml-2 text-xs opacity-0">
                {message.isRead ? "✓✓" : "✓"}
              </span>
            )}
              </div>
            </div>
          )
            })
        ) : (
          <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
            <p>Rozpocznij konwersację</p>
          </div>
        )}
        <div ref={messagesEndRef} />
          </div>
        </ScrollAreaMessages>

        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 border-t p-4 bg-background sticky bottom-0"
          style={{
        zIndex: 10,
        // For mobile keyboard handling
        position: "sticky",
        bottom: 0,
          }}
        >
          <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Napisz wiadomość..."
        className="flex-1"
        autoComplete="off"
        inputMode="text"
          />
          <Button type="submit">Wyślij</Button>
        </form>
      </div>
    </div>
  )
}
