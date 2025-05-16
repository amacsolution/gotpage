"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

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
        router.push(`/wiadomosci/${data.conversationId}`)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Wiadomości</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Szukaj użytkowników..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isSearching ? (
            <div className="rounded-lg border">
              <h3 className="border-b p-3 font-medium">Wyniki wyszukiwania</h3>
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent"
                      onClick={() => startConversation(user.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">Nie znaleziono użytkowników</div>
              )}
              <div className="border-t p-2">
                <Button variant="outline" className="w-full" onClick={() => setIsSearching(false)}>
                  Wróć do wiadomości
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border">
              <h3 className="border-b p-3 font-medium">Konwersacje</h3>
              <ScrollArea className="h-[calc(100vh-250px)]">
                {conversations.length > 0 ? (
                  <div className="p-2">
                    {conversations.map((conv) => (
                      <Link
                        key={conv.id}
                        href={`/wiadomosci/${conv.id}`}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
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
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
                    <p>Brak wiadomości</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="hidden md:col-span-2 md:block">
          <div className="flex h-[calc(100vh-200px)] items-center justify-center rounded-lg border">
            <div className="text-center text-muted-foreground">
              <h3 className="mb-2 text-xl font-medium">Wybierz konwersację</h3>
              <p>Wybierz konwersację z listy lub wyszukaj użytkownika, aby rozpocząć czat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
