"use client"

import { useState, useEffect } from "react"
import { AdCard } from "@/components/ad-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Heart, Loader2 } from "lucide-react"

interface LikedAdsFeedProps {
  userId: number
}

export function LikedAdsFeed({ userId }: LikedAdsFeedProps) {
  const [ads, setAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalAds, setTotalAds] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchLikedAds(1)
  }, [userId])

  const fetchLikedAds = async (pageNum: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}/liked?page=${pageNum}&limit=12`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać polubionych ogłoszeń")
      }

      const data = await response.json()

      if (pageNum === 1) {
        setAds(data.ads)
      } else {
        setAds((prev) => [...prev, ...data.ads])
      }

      setTotalAds(data.total)
      setHasMore(pageNum < data.totalPages)
      setPage(pageNum)
    } catch (error) {
      console.error("Błąd podczas pobierania polubionych ogłoszeń:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać polubionych ogłoszeń. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    fetchLikedAds(nextPage)
  }

  // Skeleton loading dla ogłoszeń
  if (isLoading && ads.length === 0) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Brak polubionych ogłoszeń
  if (ads.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Brak polubionych ogłoszeń</h3>
        <p className="text-muted-foreground">
          Nie masz jeszcze żadnych polubionych ogłoszeń. Przeglądaj ogłoszenia i klikaj serduszko, aby dodać je do
          ulubionych.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Liczba polubionych ogłoszeń */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mt-3">
          Znaleziono {totalAds}{" "}
          {totalAds === 1 ? "polubione ogłoszenie" : totalAds < 5 ? "polubione ogłoszenia" : "polubionych ogłoszeń"}
        </p>
      </div>

      {/* Siatka ogłoszeń */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} image={ad.images[0]} />
        ))}
      </div>

      {/* Loader podczas ładowania kolejnych stron */}
      {isLoading && ads.length > 0 && (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Przycisk "Załaduj więcej" */}
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} variant="outline" className="min-w-[200px]">
            Załaduj więcej ogłoszeń
          </Button>
        </div>
      )}

      {/* Informacja o wyświetleniu wszystkich ogłoszeń */}
      {!hasMore && ads.length > 0 && (
        <div className="text-center text-muted-foreground mt-8 py-2 border-t">
          Wyświetlono wszystkie polubione ogłoszenia ({totalAds})
        </div>
      )}
    </div>
  )
}

