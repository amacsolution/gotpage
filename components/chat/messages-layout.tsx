"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollAreaMessages } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Flag,
  MoreVertical,
  Search,
  User,
  LogOut,
  Home,
  Settings,
  ImageIcon,
  X,
  Loader2,
} from "lucide-react"
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
  imageUrl?: string
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
  onImageUpload?: (file: File) => Promise<void>
  className?: string
  isMobileFullScreen?: boolean
  initialLoad?: boolean
  socketConnected?: boolean
  isTyping?: boolean
  currentUser?: any
  uploadingImage?: boolean
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
  onImageUpload,
  className = "",
  isMobileFullScreen = false,
  initialLoad = false,
  socketConnected = false,
  isTyping = false,
  currentUser = null,
  uploadingImage = false,
}: MessagesLayoutProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [messages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Sprawdź typ pliku
      if (!file.type.startsWith("image/")) {
        alert("Tylko pliki obrazów są dozwolone")
        return
      }

      // Sprawdź rozmiar pliku (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        alert("Rozmiar pliku przekracza limit 5MB")
        return
      }

      setSelectedImage(file)

      // Utwórz URL podglądu
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Wyczyść pole pliku
      e.target.value = ""
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancelImage = () => {
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleSubmitWithImage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedImage && onImageUpload) {
      await onImageUpload(selectedImage)
      handleCancelImage()
    } else {
      onSendMessage(e)
    }
  }

  // For mobile view with active conversation in full screen mode
  if (isMobile && activeConversation && isMobileFullScreen) {
    return (
      <div className={`flex h-dvh flex-col ${className}`}>
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
        <ScrollArea className="flex-1 flex flex-col-reverse overflow-y-auto p-2 justyfy-end" style={{ minHeight: 0 }}>
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
                      key={message.id + (message.content || message.imageUrl || "")}
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
                          {message.imageUrl ? (
                            <div className="my-1">
                              <a href={message.imageUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={message.imageUrl || "/placeholder.svg"}
                                  alt="Załącznik"
                                  className="max-w-full rounded-md max-h-[200px] object-contain"
                                />
                              </a>
                              {message.content && <p className="mt-1 mb-0">{message.content}</p>}
                            </div>
                          ) : (
                            <p className="mb-0">{message.content}</p>
                          )}
                        </div>
                        {message.isMine && showTimestamp ? (
                          <span className="ml-2 text-xs opacity-70">{message.isRead ? "✓✓" : "✓"}</span>
                        ) : (
                          <span className="ml-2 text-xs opacity-0">{message.isRead ? "✓✓" : "✓"}</span>
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
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmitWithImage} className="flex flex-col border-t">
          {/* Podgląd wybranego obrazu */}
          {previewUrl && (
            <div className="p-2 border-b relative">
              <div className="relative w-24 h-24">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Podgląd"
                  className="w-full h-full object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleCancelImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-4">
            <Button type="button" variant="outline" size="icon" onClick={handleUploadClick} disabled={uploadingImage}>
              <ImageIcon className="h-5 w-5" />
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Input
              value={newMessage}
              onChange={onNewMessageChange}
              placeholder="Napisz wiadomość..."
              className="flex-1"
              disabled={uploadingImage}
            />
            <Button type="submit" disabled={uploadingImage}>
              {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wyślij"}
            </Button>
          </div>
        </form>

        {/* Dodaj panel użytkownika na dole dla wersji mobilnej */}
        {currentUser && (
          <div className="border-t p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                ) : (
                  <div className="bg-muted flex h-full w-full items-center justify-center">
                    {currentUser.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{currentUser.name}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/profil/${currentUser.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  Mój profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/ogloszenia")}>
                  <Home className="mr-2 h-4 w-4" />
                  Ogłoszenia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/logout")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    )
  }

  // Desktop or mobile without full screen
  return (
    <div className={`grid grid-cols-1 gap-0 md:grid-cols-3 h-full ${className}`}>
      <div className="md:col-span-1 flex flex-col h-full">
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

        {/* Główna zawartość (konwersacje lub wyniki wyszukiwania) */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isSearching && onStartConversation && onCancelSearch ? (
            <div className="rounded-lg border flex-1 flex flex-col">
              <h3 className="border-b p-3 font-medium">Wyniki wyszukiwania</h3>
              <div className="flex-1 overflow-y-auto">
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
              </div>
              <div className="border-t p-2">
                <Button variant="outline" className="w-full" onClick={onCancelSearch}>
                  Wróć do wiadomości
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border flex-1 flex flex-col">
              <h3 className="border-b p-3 font-medium">Konwersacje</h3>
              <div className="flex-1 overflow-y-auto">
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
              </div>
            </div>
          )}

          {/* Panel użytkownika na dole */}
          {currentUser && (
            <div className="border-t border-l border-r rounded-b-lg p-3 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      {currentUser.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/profil/${currentUser.id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    Mój profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/ogloszenia")}>
                    <Home className="mr-2 h-4 w-4" />
                    Ogłoszenia
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/logout")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <div
        className={`${isMobile ? (activeConversation ? "block" : "hidden") : "hidden md:block md:col-span-2"} h-full`}
      >
        {activeConversation ? (
          <div className="flex h-full flex-col rounded-lg border">
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
            <ScrollAreaMessages
              className="flex-1 flex flex-col-reverse overflow-y-auto px-2 justify-end"
              style={{ minHeight: 0 }}
            >
              <div className="flex flex-col-reverse justify-end">
                {messages.length > 0 ? (
                  [...new Set(messages.map((m) => m.id))] // deduplicate by id
                    .map((id) => messages.find((m) => m.id === id)!)
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
                              {message.imageUrl ? (
                                <div className="my-1">
                                  <a href={message.imageUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={message.imageUrl || "/placeholder.svg"}
                                      alt="Załącznik"
                                      className="max-w-full rounded-md max-h-[200px] object-contain"
                                    />
                                  </a>
                                  {message.content && <p className="mt-1 mb-0">{message.content}</p>}
                                </div>
                              ) : (
                                <p className="mb-0">{message.content}</p>
                              )}
                            </div>
                            {message.isMine && showTimestamp ? (
                              <span className="ml-2 text-xs opacity-70">{message.isRead ? "✓✓" : "✓"}</span>
                            ) : (
                              <span className="ml-2 text-xs opacity-0">{message.isRead ? "✓✓" : "✓"}</span>
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

            {/* Typing indicator */}
            {isTyping && (
              <div className="px-4 py-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmitWithImage} className="flex flex-col border-t">
              {/* Podgląd wybranego obrazu */}
              {previewUrl && (
                <div className="p-2 border-b relative">
                  <div className="relative w-24 h-24">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Podgląd"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleCancelImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleUploadClick}
                  disabled={uploadingImage}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <Input
                  value={newMessage}
                  onChange={onNewMessageChange}
                  placeholder="Napisz wiadomość..."
                  className="flex-1"
                  disabled={uploadingImage}
                />
                <Button type="submit" disabled={uploadingImage}>
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wyślij"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border">
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
