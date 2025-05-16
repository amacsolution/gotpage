"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { MessagesLayout, type Conversation, type Message } from "@/components/chat/messages-layout"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeUser, setActiveUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    // Fetch conversations
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages/conversations")
        if (response.ok) {
          const data = await response.json()
          setConversations(data.conversations)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      }
    }

    fetchConversations()

    // Set up polling for new messages
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [])

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

          // Mark messages as read
          fetch(`/api/messages/read/${activeConversation}`, { method: "POST" })
            .then(() => {
              // Update unread count in conversations list
              setConversations((prev) =>
                prev.map((conv) => (conv.id === activeConversation ? { ...conv, unread: 0 } : conv)),
              )
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

      // Set up polling for new messages
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    } else {
      // Clear messages when no active conversation
      setMessages([])
      setActiveUser(null)
    }
  }, [activeConversation])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const startConversation = async (userId: string) => {
    try {
      const response = await fetch("/api/messages/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setActiveConversation(data.conversationId)
        setIsSearching(false)

        // Refresh conversations list to include the new one
        fetch("/api/messages/conversations")
          .then((res) => res.json())
          .then((data) => setConversations(data.conversations))
          .catch((error) => console.error("Error refreshing conversations:", error))
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

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

  const handleReport = () => {
    alert("Zgłoszenie zostało wysłane")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Wiadomości</h1>

      <MessagesLayout
        conversations={conversations}
        messages={messages}
        activeConversation={activeConversation}
        activeUser={activeUser}
        newMessage={newMessage}
        isLoading={isLoading}
        isSearching={isSearching}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSendMessage={handleSendMessage}
        onNewMessageChange={(e) => setNewMessage(e.target.value)}
        onConversationSelect={setActiveConversation}
        onCloseConversation={() => setActiveConversation(null)}
        onSearch={handleSearch}
        onSearchQueryChange={(e) => setSearchQuery(e.target.value)}
        onStartConversation={startConversation}
        onCancelSearch={() => setIsSearching(false)}
        onReport={handleReport}
        isMobileFullScreen={true}
      />
    </div>
  )
}
