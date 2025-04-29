"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"

interface UserReviewsProps {
  userId: string
  showAddReview?: boolean
}

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  reviewer: {
    id: string
    name: string
    avatar: string
  }
}

export function UserReviews({ userId, showAddReview = true }: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalReviews, setTotalReviews] = useState(0)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    fetchReviews(1)
  }, [userId])

  const fetchReviews = async (pageNum: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/companies/${userId}/reviews?page=${pageNum}&limit=10`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać opinii")
      }

      const data = await response.json()

      if (pageNum === 1) {
        setReviews(data.reviews)
      } else {
        setReviews((prev) => [...prev, ...data.reviews])
      }

      setTotalReviews(data.total)
      setHasMore(pageNum < data.totalPages)
      setPage(pageNum)
    } catch (error) {
      console.error("Błąd podczas pobierania opinii:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać opinii. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany, aby dodać opinię",
        variant: "destructive",
      })
      return
    }

    if (content.trim() === "") {
      toast({
        title: "Błąd",
        description: "Treść opinii nie może być pusta",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/users/${userId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas dodawania opinii")
      }

      const newReview = await response.json()

      // Dodanie nowej opinii na początek listy
      setReviews((prev) => [newReview, ...prev])
      setTotalReviews((prev) => prev + 1)

      // Resetowanie formularza
      setRating(5)
      setContent("")

      toast({
        title: "Sukces",
        description: "Twoja opinia została dodana pomyślnie",
      })
    } catch (error) {
      console.error("Błąd podczas dodawania opinii:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas dodawania opinii",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    fetchReviews(nextPage)
  }

  return (
    <div className="space-y-6">
      {/* Formularz dodawania opinii */}
      {showAddReview && user && user.id !== userId && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="font-medium mb-4">Dodaj opinię</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Ocena</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" className="p-1" onClick={() => setRating(star)}>
                    <Star className="h-6 w-6 text-yellow-500" fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Treść opinii</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Podziel się swoją opinią..."
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                "Dodaj opinię"
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Lista opinii */}
      {isLoading && reviews.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.reviewer.avatar} alt={review.reviewer.name} />
                    <AvatarFallback>{review.reviewer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.reviewer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                        locale: pl,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 text-yellow-500"
                      fill={star <= review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
              <p>{review.content}</p>
            </div>
          ))}

          {/* Przycisk "Załaduj więcej" */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ładowanie...
                  </>
                ) : (
                  "Załaduj więcej opinii"
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Brak opinii</p>
        </div>
      )}
    </div>
  )
}

