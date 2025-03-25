"use client"

import { useState, JSX } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, MessageSquare, Share2, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LinkPreview from "@/components/link-preview"
import { NewsComments } from "@/components/news-comments"
import { useUser } from "@/lib/user-context"

interface NewsPostProps {
  post: {
    id: number
    content: string
    hasLink: boolean
    linkUrl?: string
    likes: number
    comments: number
    createdAt: string
    isLiked: boolean
    author: {
      id: number
      name: string
      avatar: string
      type: string
      verified: boolean
    }
  }
}

// Funkcja do sprawdzania, czy tekst zawiera URL - taka sama jak w LinkPreview
const hasUrl = (text: string): boolean => {
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:\d+)?(\/[^\s]*)?)/gi
  return urlRegex.test(text)
}

// Funkcja do formatowania tekstu z pogrubieniem linków - zaktualizowana
const formatTextWithBoldLinks = (text: string) => {
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:\d+)?(\/[^\s]*)?)/gi

  // Podziel tekst na części - tekst i linki
  const parts = text.split(urlRegex)
  const matches = text.match(urlRegex) || []

  // Złóż tekst z powrotem, owijając linki w <strong>
  return parts.reduce(
    (acc, part, i) => {
      // Dodaj część tekstu
      if (part) acc.push(part)

      // Jeśli jest odpowiadający link, dodaj go jako <strong>
      if (matches[i]) {
        acc.push(
          <strong key={i} className="text-primary">
            {matches[i]}
          </strong>,
        )
      }

      return acc
    },
    [] as (string | JSX.Element)[],
  )
}

export function NewsPost({ post }: NewsPostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  const handleLike = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/news/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas przetwarzania polubienia")
      }

      const data = await response.json()

      // Aktualizacja stanu
      setIsLiked(data.liked)
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1))
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas przetwarzania polubienia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post od ${post.author.name} na Gotpage`,
          text: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
          url: `${window.location.origin}/aktualnosci/post/${post.id}`,
        })
      } catch (error) {
        console.error("Błąd podczas udostępniania:", error)
      }
    } else {
      // Fallback dla przeglądarek bez API Web Share
      const url = `${window.location.origin}/aktualnosci/post/${post.id}`
      navigator.clipboard.writeText(url)
      toast({
        title: "Link skopiowany",
        description: "Link do wpisu został skopiowany do schowka",
      })
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <div className="mb-6">
      <Card className="mb-0" itemScope itemType="https://schema.org/SocialMediaPosting">
        <meta itemProp="datePublished" content={new Date(post.createdAt).toISOString()} />
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-3">
            <Link href={`/profil/${post.author.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <Link
                  href={`/profil/${post.author.id}`}
                  className="font-medium hover:underline"
                  itemProp="author"
                  itemScope
                  itemType="https://schema.org/Person"
                >
                  <span itemProp="name">{post.author.name}</span>
                </Link>
                {post.author.verified && (
                  <span className="text-primary text-xs" title="Zweryfikowany">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: pl,
                })}
              </div>
            </div>
          </div>

          <div className="whitespace-pre-wrap mb-3" itemProp="text">
            {formatTextWithBoldLinks(post.content)}
          </div>

          {/* Sprawdź, czy post zawiera URL i wyświetl podgląd */}
          {hasUrl(post.content) && <LinkPreview text={post.content} />}
        </CardContent>

        <CardFooter className="flex-col border-t pt-3 pb-3">
          <div className="inline-flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={toggleComments}>
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments}</span>
              {showComments ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center gap-1 ml-auto" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span>Udostępnij</span>
            </Button>
          </div>
          {showComments && (
        <div className="w-full mt-2">
          <NewsComments
            postId={post.id}
            user={
              user
                ? {
                    id: user.id,
                    name: user.name,
                    avatar:
                      user.avatar ||
                      `/placeholder.svg?height=40&width=40&text=${user.name.substring(0, 2).toUpperCase()}`,
                  }
                : null
            }
          />
        </div>
      )}
        </CardFooter>
      </Card>

      {/* Komentarze wyświetlane bezpośrednio pod postem */}
      
    </div>
  )
}

