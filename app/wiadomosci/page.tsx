"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { MessagesLayout, type Conversation, type Message } from "@/components/chat/messages-layout"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { useSocket } from "@/hooks/use-socket"

export default function MessagesPage() {
  // Stan komponentu
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
  const [isTyping, setIsTyping] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userLoaded, setUserLoaded] = useState(false)
  const [usePolling, setUsePolling] = useState(false)

  // Referencje
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeConversationIdRef = useRef<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageTimestampRef = useRef<string | null>(null)

  // Hooki
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Pobierz dane o zalogowanym użytkowniku
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setAuthLoading(true)
        const response = await fetch("/api/auth/me")

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setAuthLoading(false)
        setUserLoaded(true)
      }
    }

    fetchUser()
  }, [])

  // Inicjalizacja Socket.IO
  const {
    isConnected,
    error: socketError,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingStatus,
    on,
  } = useSocket(user?.id)

  // Ustaw fallback na polling, jeśli Socket.IO nie działa
  useEffect(() => {
    if (socketError) {
      console.log("Socket.IO error, switching to polling:", socketError)
      setUsePolling(true)
    } else if (isConnected) {
      setUsePolling(false)
    }
  }, [socketError, isConnected])

  // Nasłuchuj zdarzeń Socket.IO
  useEffect(() => {
    if (!isConnected) return

    // Nasłuchuj nowych wiadomości
    const unsubscribeNewMessage = on("new_message", (message: any) => {
      handleNewMessage(message)
    })

    // Nasłuchuj statusu pisania
    const unsubscribeTyping = on("typing", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      handleTypingStatus(userId, isTyping)
    })

    // Nasłuchuj statusu użytkownika
    const unsubscribeUserStatus = on("user_status", ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      handleUserStatus(userId, isOnline)
    })

    // Nasłuchuj potwierdzenia wysłania wiadomości
    const unsubscribeMessageSent = on(
      "message_sent",
      ({ messageId, timestamp }: { messageId: string; timestamp: string }) => {
        console.log(`Message ${messageId} sent at ${timestamp}`)
      },
    )

    return () => {
      unsubscribeNewMessage?.()
      unsubscribeTyping?.()
      unsubscribeUserStatus?.()
      unsubscribeMessageSent?.()
    }
  }, [isConnected, on])

  // Pobierz konwersacje
  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch("/api/messages/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }, [user])

  useEffect(() => {
    if (userLoaded && user) {
      fetchConversations()
    }
  }, [userLoaded, user, fetchConversations])

  // Polling jako fallback, gdy Socket.IO nie działa
  useEffect(() => {
    if (!usePolling || !activeConversation || !user) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    console.log("Starting polling for new messages")

    // Funkcja do pobierania nowych wiadomości
    const pollNewMessages = async () => {
      try {
        const url = `/api/messages/conversations/${activeConversation}/new${
          lastMessageTimestampRef.current ? `?after=${encodeURIComponent(lastMessageTimestampRef.current)}` : ""
        }`

        const response = await fetch(url)
        if (!response.ok) return

        const data = await response.json()

        if (data.messages && data.messages.length > 0) {
          // Dodaj nowe wiadomości do listy
          setMessages((prev) => [...prev, ...data.messages])

          // Aktualizuj timestamp ostatniej wiadomości
          const lastMessage = data.messages[data.messages.length - 1]
          lastMessageTimestampRef.current = lastMessage.timestamp

          // Jeśli są nowe wiadomości od innych użytkowników, oznacz je jako przeczytane
          const hasNewMessagesFromOthers = data.messages.some((msg: any) => !msg.isMine)
          if (hasNewMessagesFromOthers) {
            fetch(`/api/messages/read/${activeConversation}`, { method: "POST" }).catch((error) =>
              console.error("Error marking as read:", error),
            )
          }

          // Odśwież listę konwersacji
          fetchConversations()
        }
      } catch (error) {
        console.error("Error polling for new messages:", error)
      }
    }

    // Ustaw interwał pollingu
    pollingIntervalRef.current = setInterval(pollNewMessages, 3000) // Poll co 3 sekundy

    // Wykonaj pierwsze zapytanie od razu
    pollNewMessages()

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [usePolling, activeConversation, user, fetchConversations])

  // Funkcje obsługi wiadomości
  const handleNewMessage = useCallback(
    (message: any) => {
      // Dodaj nową wiadomość do listy
      if (message.conversationId === activeConversationIdRef.current) {
        setMessages((prev) => [...prev, message])

        // Aktualizuj timestamp ostatniej wiadomości
        lastMessageTimestampRef.current = message.timestamp

        // Jeśli wiadomość nie jest moja, oznacz ją jako przeczytaną
        if (!message.isMine) {
          fetch(`/api/messages/read/${activeConversationIdRef.current}`, { method: "POST" }).catch((error) =>
            console.error("Error marking as read:", error),
          )
        }

        // Odśwież listę konwersacji
        fetchConversations()
      } else {
        // Jeśli wiadomość jest z innej konwersacji, zaktualizuj licznik nieprzeczytanych
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === message.conversationId
              ? { ...conv, unread: (conv.unread || 0) + 1, lastMessage: message.content, timestamp: "Teraz" }
              : conv,
          ),
        )
      }
    },
    [fetchConversations],
  )

  const handleTypingStatus = useCallback(
    (userId: string, isTyping: boolean) => {
      if (activeUser && activeUser.id === userId) {
        setIsTyping(isTyping)

        // Automatycznie wyłącz wskaźnik pisania po 3 sekundach
        if (isTyping && typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        if (isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
          }, 3000)
        }
      }
    },
    [activeUser],
  )

  const handleUserStatus = useCallback(
    (userId: string, isOnline: boolean) => {
      // Aktualizuj status użytkownika, jeśli jest aktywny
      if (activeUser && activeUser.id === userId) {
        setActiveUser((prev: any) => ({
          ...prev,
          isOnline,
          lastSeen: isOnline ? "Online" : "Przed chwilą",
        }))
      }

      // Aktualizuj status w liście konwersacji
      setConversations((prev) =>
        prev.map((conv) => (conv.user.id === userId ? { ...conv, user: { ...conv.user, isOnline } } : conv)),
      )
    },
    [activeUser],
  )

  // Funkcja do wysyłania wiadomości przez Socket.IO lub API
  const handleSendMessageViaSocketOrApi = useCallback(
    (messageData: any) => {
      // Jeśli używamy pollingu lub Socket.IO nie jest połączony, użyj API REST
      if (usePolling || !isConnected) {
        fetch("/api/messages/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: messageData.conversationId,
            content: messageData.content,
            messageId: messageData.id,
          }),
        }).catch((error) => console.error("Error sending message via API:", error))
        return true
      }

      // Wyślij wiadomość przez Socket.IO
      return sendMessage(messageData)
    },
    [usePolling, isConnected, sendMessage],
  )

  // Obsługa zmiany aktywnej konwersacji
  useEffect(() => {
    if (activeConversation) {
      activeConversationIdRef.current = activeConversation
      lastMessageTimestampRef.current = null

      // Dołącz do konwersacji przez Socket.IO, jeśli jest połączony
      if (isConnected && !usePolling) {
        joinConversation(activeConversation)
      }

      setInitialLoad(true)
      setIsLoading(true)

      // Pobierz wiadomości dla aktywnej konwersacji
      fetch(`/api/messages/conversations/${activeConversation}`)
        .then((response) => {
          if (response.ok) return response.json()
          throw new Error("Failed to fetch conversation")
        })
        .then((data) => {
          setMessages(data.messages)
          setActiveUser(data.user)
          setInitialLoad(false)

          // Ustaw timestamp ostatniej wiadomości
          if (data.messages && data.messages.length > 0) {
            lastMessageTimestampRef.current = data.messages[data.messages.length - 1].timestamp
          }

          // Oznacz wiadomości jako przeczytane
          fetch(`/api/messages/read/${activeConversation}`, { method: "POST" })
            .then(() => {
              // Aktualizuj nieprzeczytane w liście konwersacji
              setConversations((prev) =>
                prev.map((conv) => (conv.id === activeConversation ? { ...conv, unread: 0 } : conv)),
              )
            })
            .catch((error) => console.error("Error marking as read:", error))
        })
        .catch((error) => {
          console.error("Error fetching messages:", error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      // Opuść konwersację przez Socket.IO, jeśli jest połączony
      if (activeConversationIdRef.current && isConnected && !usePolling) {
        leaveConversation(activeConversationIdRef.current)
      }

      activeConversationIdRef.current = null
      lastMessageTimestampRef.current = null

      // Wyczyść wiadomości gdy nie ma aktywnej konwersacji
      setMessages([])
      setActiveUser(null)
    }

    return () => {
      // Opuść konwersację przy odmontowaniu
      if (activeConversationIdRef.current && isConnected && !usePolling) {
        leaveConversation(activeConversationIdRef.current)
      }
    }
  }, [activeConversation, isConnected, usePolling, joinConversation, leaveConversation])

  // Obsługa pisania
  useEffect(() => {
    if (activeConversation && newMessage && isConnected && !usePolling) {
      sendTypingStatus(activeConversation, true)

      // Wyczyść poprzedni timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Ustaw nowy timeout, aby przestać pokazywać "pisanie" po 2 sekundach bezczynności
      typingTimeoutRef.current = setTimeout(() => {
        if (isConnected && !usePolling) {
          sendTypingStatus(activeConversation, false)
        }
      }, 2000)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [newMessage, activeConversation, isConnected, usePolling, sendTypingStatus])

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

        // Odśwież listę konwersacji
        fetchConversations()
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || !user?.id) return

    const messageId = uuidv4()
    const messageContent = newMessage

    // Wyczyść pole wiadomości od razu dla lepszego UX
    setNewMessage("")

    // Przygotuj dane wiadomości
    const messageData = {
      id: messageId,
      conversationId: activeConversation,
      content: messageContent,
      timestamp: new Date().toISOString(),
      senderId: user.id,
      isMine: true,
      isRead: false,
    }

    // Optymistycznie dodaj wiadomość do UI
    setMessages((prev) => [...prev, messageData])

    // Aktualizuj timestamp ostatniej wiadomości
    lastMessageTimestampRef.current = messageData.timestamp

    // Wyślij wiadomość przez Socket.IO lub API
    handleSendMessageViaSocketOrApi(messageData)

    // Aktualizuj konwersację na liście
    setConversations((prev) => {
      const updatedConversations = prev.map((conv) => {
        if (conv.id === activeConversation) {
          return {
            ...conv,
            lastMessage: messageContent,
            timestamp: "Teraz",
          }
        }
        return conv
      })

      // Sortuj konwersacje, aby aktywna była na górze
      return [
        ...updatedConversations.filter((c) => c.id === activeConversation),
        ...updatedConversations.filter((c) => c.id !== activeConversation),
      ]
    })
  }

  const handleReport = () => {
    alert("Zgłoszenie zostało wysłane")
  }

  // Sprawdź, czy użytkownik jest zalogowany
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex flex-col gap-5 h-screen items-center justify-center">
          <p className="text-center text-muted-foreground">
            Nie jesteś zalogowany. Zaloguj się, aby korzystać z wiadomości.
          </p>
          <Button>
            <Link href="/login">Zaloguj się</Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <div className="md:container mx-auto h-dvh md:py-8 pt-2">
      <h1 className="md:mb-6 hidden md:block text-3xl font-bold">Wiadomości</h1>

      {socketError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <p>{socketError}</p>
          <p className="text-sm">
            {usePolling
              ? "Używam alternatywnej metody komunikacji. Niektóre funkcje mogą działać wolniej."
              : "Próbuję ponownie nawiązać połączenie..."}
          </p>
        </div>
      )}

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
        initialLoad={initialLoad}
        socketConnected={isConnected && !usePolling}
        isTyping={isTyping}
      />
    </div>
  )
}
