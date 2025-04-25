"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

// Dodaj import LinkPreview
import LinkPreview from "@/components/link-preview"

interface NewsCommentsProps {
  postId: number
  user: {
    id: number
    name: string
    avatar: string
  } | null
}

interface Comment {
  id: number
  content: string
  createdAt: string
  author: {
    id: number
    name: string
    avatar: string
  }
}

// Funkcja do sprawdzania, czy tekst zawiera URL - taka sama jak w LinkPreview
const hasUrl = (text: string): boolean => {
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:\d+)?(\/[^\s]*)?)/gi
  return urlRegex.test(text)
}

export function NewsComments({ postId, user }: NewsCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [commentText, setCommentText] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/news/${postId}/comments`)

        if (!response.ok) {
          throw new Error("Nie udało się pobrać komentarzy")
        }

        const data = await response.json()
        setComments(data)
      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać komentarzy",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany, aby dodać komentarz",
        variant: "destructive",
      })
      return
    }

    if (!commentText.trim()) {
      toast({
        title: "Błąd",
        description: "Treść komentarza nie może być pusta",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      const response = await fetch(`/api/news/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas dodawania komentarza")
      }

      const newComment = await response.json()
      setComments((prev) => [newComment, ...prev])
      setCommentText("")
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas dodawania komentarza",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="w-full border-none">
      <CardContent className="p-4">
        {user ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Napisz komentarz..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="resize-none mb-2"
                  rows={2}
                  disabled={isSending}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isSending || !commentText.trim()}>
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Wysyłanie...
                      </>
                    ) : (
                      "Dodaj komentarz"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center mb-6 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Zaloguj się, aby dodać komentarz</p>
            <Link href="/login">
              <Button size="sm">Zaloguj się</Button>
            </Link>
          </div>
        )}

        <h3 className="text-lg font-medium mb-4">Komentarze</h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Link href={`/profil/${comment.author.id}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/profil/${comment.author.id}`} className="font-medium text-sm hover:underline">
                      {comment.author.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: pl,
                      })}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm">{comment.content}</p>
                    {/* Sprawdź, czy komentarz zawiera URL i wyświetl podgląd */}
                    {hasUrl(comment.content) && <LinkPreview text={comment.content} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Brak komentarzy. Bądź pierwszy!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

