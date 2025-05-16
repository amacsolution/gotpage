"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageCircle, X, Minimize2, Maximize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { MessagesLayout, type Conversation, type Message } from "@/components/chat/messages-layout"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function MessageBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeUser, setActiveUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

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

    if (isOpen) {
      fetchConversations()

      // Set up polling for new messages every 10 seconds
      const interval = setInterval(fetchConversations, 10000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  useEffect(() => {
    // Fetch messages for active conversation
    const fetchMessages = async () => {
      if (!activeConversation) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/messages/conversations/${activeConversation}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
          setActiveUser(data.user)

          // Mark as read
          fetch(`/api/messages/read/${activeConversation}`, { method: "POST" })
            .then(() => {
              // Update unread count in conversations list
              setConversations((prev) =>
                prev.map((conv) => (conv.id === activeConversation ? { ...conv, unread: 0 } : conv)),
              )

              // Recalculate total unread
              const total = conversations.reduce(
                (sum, conv) => sum + (conv.id === activeConversation ? 0 : conv.unread),
                0,
              )
              setUnreadCount(total)
            })
            .catch((error) => console.error("Error marking as read:", error))
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (activeConversation) {
      fetchMessages()

      // Set up polling for new messages in this conversation
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    } else {
      // Clear messages when no active conversation
      setMessages([])
      setActiveUser(null)
    }
  }, [activeConversation, conversations])

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

        // Update conversation in the list
        setConversations((prev) => {
          const updatedConversations = prev.map((conv) => {
            if (conv.id === activeConversation) {
              return {
                ...conv,
                lastMessage: newMessage,
                timestamp: "Teraz",
              }
            }
            return conv
          })

          // Sort conversations to put the active one at the top
          return [
            ...updatedConversations.filter((c) => c.id === activeConversation),
            ...updatedConversations.filter((c) => c.id !== activeConversation),
          ]
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
    setActiveConversation(null)
  }

  const openConversation = (id: string) => {
    setActiveConversation(id)
  }

  const closeConversation = () => {
    setActiveConversation(null)
  }

  const goToAllMessages = () => {
    router.push("/wiadomosci")
    setIsOpen(false)
  }

  const handleReport = () => {
    alert("Zgłoszenie zostało wysłane")
  }

  // For mobile view, show full screen conversation
  if (isMobile && activeConversation && isOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <MessagesLayout
          conversations={conversations}
          messages={messages}
          activeConversation={activeConversation}
          activeUser={activeUser}
          newMessage={newMessage}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onNewMessageChange={(e) => setNewMessage(e.target.value)}
          onConversationSelect={openConversation}
          onCloseConversation={closeConversation}
          onReport={handleReport}
          isMobileFullScreen={true}
        />
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && !isMinimized ? (
        <div className="mb-4 flex w-[640px] max-w-[calc(100vw-2rem)] rounded-lg border bg-card text-card-foreground shadow-lg animate-in slide-in-from-bottom-5">
          <div className="w-full">
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

            <div className="p-3">
              <MessagesLayout
                conversations={conversations}
                messages={messages}
                activeConversation={activeConversation}
                activeUser={activeUser}
                newMessage={newMessage}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onNewMessageChange={(e) => setNewMessage(e.target.value)}
                onConversationSelect={openConversation}
                onCloseConversation={closeConversation}
                onReport={handleReport}
              />

              <div className="mt-3 border-t pt-3">
                <Button variant="outline" className="w-full" onClick={goToAllMessages}>
                  Wszystkie wiadomości
                </Button>
              </div>
            </div>
          </div>
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
