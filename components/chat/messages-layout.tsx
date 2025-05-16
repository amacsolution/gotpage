"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Flag, MoreVertical, Search, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"

export type Conversation = {
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

export type Message = {
  id: string
  content: string
  timestamp: string
  isMine: boolean
  isRead?: boolean
}

type MessagesLayoutProps = {
  conversations: Conversation[]
  messages: Message[]
  activeConversation: string | null
  activeUser: any
  newMessage: string
  isLoading: boolean
  isSearching?: boolean
  searchQuery?: string
  searchResults?: any[]
  onSendMessage: (e: React.FormEvent) => void
  onNewMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onConversationSelect: (id: string) => void
  onCloseConversation: () => void
  onSearch?: () => void
  onSearchQueryChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStartConversation?: (userId: string) => void
  onCancelSearch?: () => void
  onReport?: () => void
  className?: string
  isMobileFullScreen?: boolean
}

export function MessagesLayout({
  conversations,
  messages,
  activeConversation,
  activeUser,
  newMessage,
  isLoading,
  isSearching = false,
  searchQuery = "",
  searchResults = [],
  onSendMessage,
  onNewMessageChange,
  onConversationSelect,
  onCloseConversation,
  onSearch,
  onSearchQueryChange,
  onStartConversation,
  onCancelSearch,
  onReport = () => alert("Zgłoszenie zostało wysłane"),
  className = "",
  isMobileFullScreen = false,
}: MessagesLayoutProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [messages])

  // For mobile view with active conversation in full screen mode
  if (isMobile && activeConversation && isMobileFullScreen) {
    return (
      <div className={`flex h-screen flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onCloseConversation}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              {activeUser?.avatar ? (
                <img src={activeUser.avatar || "/placeholder.svg"} alt={activeUser?.name} />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  {activeUser?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </Avatar>
            <div>
              <p className="font-medium">{activeUser?.name}</p>
              {activeUser?.isOnline ? (
                <p className="text-sm text-green-500">Online</p>
              ) : (
                <p className="text-sm text-muted-foreground">Ostatnio online: {activeUser?.lastSeen}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/profil/${activeUser?.id}`)}>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReport}>
                <Flag className="mr-2 h-4 w-4" />
                Zgłoś
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
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
          )}
        </div>

        {/* Input */}
        <form onSubmit={onSendMessage} className="flex items-center gap-2 border-t p-4">
          <Input
            value={newMessage}
            onChange={onNewMessageChange}
            placeholder="Napisz wiadomość..."
            className="flex-1"
          />
          <Button type="submit">Wyślij</Button>
        </form>
      </div>
    )
  }

  // Desktop or mobile without full screen
  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-3 ${className}`}>
      <div className="md:col-span-1">
        {onSearch && onSearchQueryChange && (
          <div className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Szukaj użytkowników..."
                value={searchQuery}
                onChange={onSearchQueryChange}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
              />
              <Button onClick={onSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {isSearching && onStartConversation && onCancelSearch ? (
          <div className="rounded-lg border">
            <h3 className="border-b p-3 font-medium">Wyniki wyszukiwania</h3>
            {searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent"
                    onClick={() => onStartConversation(user.id)}
                  >
                    <Avatar className="h-10 w-10">
                      {user.avatar ? (
                        <img src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
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
              <Button variant="outline" className="w-full" onClick={onCancelSearch}>
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
                    <div
                      key={conv.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent ${
                        conv.id === activeConversation
                          ? "bg-accent/80 ring-1 ring-accent-foreground/10"
                          : conv.unread > 0
                            ? "bg-accent/30"
                            : ""
                      }`}
                      onClick={() => onConversationSelect(conv.id)}
                    >
                      <Avatar className="h-10 w-10">
                        {conv.user.avatar ? (
                          <img src={conv.user.avatar || "/placeholder.svg"} alt={conv.user.name} />
                        ) : (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            {conv.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className={`${conv.id === activeConversation ? "font-semibold" : "font-medium"}`}>
                            {conv.user.name}
                          </span>
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
                <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
                  <p>Brak wiadomości</p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      <div className={`${isMobile ? (activeConversation ? "block" : "hidden") : "hidden md:block md:col-span-2"}`}>
        {activeConversation ? (
          <div className="flex h-[calc(100vh-200px)] flex-col rounded-lg border">
            {/* Conversation header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={onCloseConversation} className="md:hidden">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  {activeUser?.avatar ? (
                    <img src={activeUser.avatar || "/placeholder.svg"} alt={activeUser?.name} />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      {activeUser?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{activeUser?.name}</p>
                  {activeUser?.isOnline ? (
                    <p className="text-sm text-green-500">Online</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Ostatnio online: {activeUser?.lastSeen}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/profil/${activeUser?.id}`)}>
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onReport}>
                      <Flag className="mr-2 h-4 w-4" />
                      Zgłoś
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {!isMobile && (
                  <Button variant="ghost" size="icon" onClick={onCloseConversation} className="hidden md:flex">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
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
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={onSendMessage} className="flex items-center gap-2 border-t p-4">
              <Input
                value={newMessage}
                onChange={onNewMessageChange}
                placeholder="Napisz wiadomość..."
                className="flex-1"
              />
              <Button type="submit">Wyślij</Button>
            </form>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-200px)] items-center justify-center rounded-lg border">
            <div className="text-center text-muted-foreground">
              <h3 className="mb-2 text-xl font-medium">Wybierz konwersację</h3>
              <p>Wybierz konwersację z listy lub wyszukaj użytkownika, aby rozpocząć czat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
