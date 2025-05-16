"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageCircle, X, Minimize2, Maximize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

type Conversation = {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage: string
  timestamp: string
  unread: number
}

export default function MessageBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Fetch conversations from API
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages/conversations")
        if (response.ok) {
          const data = await response.json()
          setConversations(data.conversations)

          // Calculate total unread messages
          const total = data.conversations.reduce((sum: number, conv: Conversation) => sum + conv.unread, 0)
          setUnreadCount(total)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      }
    }

    fetchConversations()

    // Set up polling for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Fetch messages for active conversation
    const fetchMessages = async () => {
      if (!activeConversation) return

      try {
        const response = await fetch(`/api/messages/conversation/${activeConversation}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    if (activeConversation) {
      fetchMessages()

      // Set up polling for new messages in this conversation
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [activeConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: activeConversation,
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

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const openConversation = (id: string) => {
    setActiveConversation(id)

    // Mark conversation as read
    fetch(`/api/messages/read/${id}`, { method: "POST" })
      .then(() => {
        // Update unread count
        setConversations((prev) => prev.map((conv) => (conv.id === id ? { ...conv, unread: 0 } : conv)))

        // Recalculate total unread
        const total = conversations.reduce((sum, conv) => sum + (conv.id === id ? 0 : conv.unread), 0)
        setUnreadCount(total)
      })
      .catch((error) => console.error("Error marking as read:", error))
  }

  const goToAllMessages = () => {
    router.push("/wiadomosci")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && !isMinimized ? (
        <div className="mb-4 w-80 rounded-lg border bg-card text-card-foreground shadow-lg animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="font-semibold">Wiadomości</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {activeConversation ? (
            // Active conversation view
            <div className="flex h-96 flex-col">
              <div className="flex items-center justify-between border-b p-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveConversation(null)}>
                  &larr; Wróć
                </Button>
                <span className="text-sm font-medium">
                  {conversations.find((c) => c.id === activeConversation)?.user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/wiadomosci/${activeConversation}`)}>
                  Rozwiń
                </Button>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="flex flex-col gap-2">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-2 text-sm ${
                          msg.isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {msg.content}
                        <div className="mt-1 text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  Wyślij
                </Button>
              </form>
            </div>
          ) : (
            // Conversations list view
            <>
              <ScrollArea className="h-80 p-2">
                {conversations.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => openConversation(conv.id)}
                        className={`flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent ${
                          conv.unread > 0 ? "bg-accent/50" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            {conv.user.name.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{conv.user.name}</span>
                            <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm text-muted-foreground">{conv.lastMessage}</p>
                            {conv.unread > 0 && (
                              <Badge variant="default" className="ml-1">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                    <p>Brak wiadomości</p>
                  </div>
                )}
              </ScrollArea>
              <div className="border-t p-2">
                <Button variant="outline" className="w-full" onClick={goToAllMessages}>
                  Wszystkie wiadomości
                </Button>
              </div>
            </>
          )}
        </div>
      ) : isOpen && isMinimized ? (
        <div
          className="mb-4 flex cursor-pointer items-center rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg"
          onClick={() => setIsMinimized(false)}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          <span className="font-medium">Wiadomości</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
          <Maximize2 className="ml-2 h-4 w-4" />
        </div>
      ) : (
        <Button onClick={toggleChat} size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  )
}
