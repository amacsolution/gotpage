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
  const [initialLoad, setInitialLoad] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await fetch("/api/auth/me")
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchUser()
    setUser(user)
  }, [])

  
  // if (!user) {
  //   return (
  //     <PageLayout>
  //       <div className="flex flex-col gap-5 h-screen items-center justify-center">
  //         <p className="text-center text-muted-foreground">
  //           Nie jesteś zalogowany. 
  //         </p>
  //         <Button><Link href="/login">Zaloguj się</Link></Button>
  //         <Button className="bg-background/50 border-foreground border-1" onClick={() => window.location.reload()}>Odśwież stronę</Button>
  //       </div>
  //     </PageLayout>
  //   )
  // }

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
    // const interval = setInterval(fetchConversations, 10000)
    // return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Reset state when changing conversations
    if (activeConversation) {
      setInitialLoad(true)
      setLastMessageTimestamp(null)
    }
  }, [activeConversation])

  useEffect(() => {
    // Fetch messages for active conversation
    const fetchMessages = async () => {
      if (!activeConversation) return

      setIsLoading(true)
      try {
        // For initial load, get all messages
        if (initialLoad) {
          const response = await fetch(`/api/messages/conversations/${activeConversation}`)
          if (response.ok) {
            const data = await response.json()
            setMessages(data.messages)
            setActiveUser(data.user)

            // Set the timestamp of the last message for future polling
            if (data.messages.length > 0) {
              setLastMessageTimestamp(data.messages[data.messages.length - 1].timestamp)
            }

            setInitialLoad(false)

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
        }
        // For subsequent polls, only get new messages
        else if (lastMessageTimestamp) {
          const response = await fetch(
            `/api/messages/conversation/${activeConversation}?after=${encodeURIComponent(lastMessageTimestamp)}`,
          )

          if (response.ok) {
            const data = await response.json()

            if (data.newMessages && data.newMessages.length > 0) {
              setMessages((prev) => [...prev, ...data.newMessages])
              setLastMessageTimestamp(data.newMessages[data.newMessages.length - 1].timestamp)

              // Mark new messages as read
              fetch(`/api/messages/read/${activeConversation}`, { method: "POST" }).catch((error) =>
                console.error("Error marking as read:", error),
              )
            }

            // Update user status if provided
            if (data.userStatus) {
              setActiveUser((prev : any) => ({
                ...prev,
                isOnline: data.userStatus.isOnline,
                lastSeen: data.userStatus.lastSeen,
              }))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (activeConversation) {
      fetchMessages()

      // Set up polling for new messages - only if we have an active conversation
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    } else {
      // Clear messages when no active conversation
      setMessages([])
      setActiveUser(null)
      setLastMessageTimestamp(null)
      setInitialLoad(true)
    }
  }, [activeConversation, initialLoad, lastMessageTimestamp])

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
        const newMsg = data.message
        setMessages((prev) => [...prev, newMsg])
        setNewMessage("")

        // Update the last message timestamp
        setLastMessageTimestamp(newMsg.timestamp)

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
     <div className="md:container mx-auto h-dvh md:py-8 pt-2">
      <h1 className="md:mb-6 hidden md:block text-3xl font-bold">Wiadomości</h1>

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
