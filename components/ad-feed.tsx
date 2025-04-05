"use client"

import { useState, useEffect } from "react"
import { AdCard } from "@/components/ad-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Grid, List, Loader2 } from "lucide-react"

interface AdFeedProps {
  isUserProfile?: boolean
  userId?: number
  category?: string
  subcategory?: string
  location?: string
  searchQuery?: string
}

export function AdFeed({ isUserProfile = false, userId, category, subcategory, location, searchQuery }: AdFeedProps) {
  const [ads, setAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalAds, setTotalAds] = useState(0)
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { toast } = useToast()

  useEffect(() => {
    // Reset stanu przy zmianie filtrów
    setAds([])
    setPage(1)
    setHasMore(true)
    setIsLoading(true)
    fetchAds(1, sortBy)
  }, [userId, category, subcategory, location, searchQuery, sortBy])

  const fetchAds = async (pageNum: number, sort: string) => {
    try {
      setIsLoading(true)

      // Budowanie URL zapytania
      let url =
        isUserProfile && userId
          ? `/api/users/${userId}/ads?page=${pageNum}&limit=12&sortBy=${sort}`
          : `/api/ads?page=${pageNum}&limit=12&sortBy=${sort}`

      // Dodanie parametrów filtrowania
      if (!isUserProfile) {
        const params = new URLSearchParams()
        params.append("page", pageNum.toString())
        params.append("limit", "12")
        params.append("sortBy", sort)

        if (category) params.append("category", category)
        if (subcategory) params.append("subcategory", subcategory)
        if (location) params.append("location", location)
        if (searchQuery) params.append("q", searchQuery)

        url = `/api/ads?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()

      //console.log(data)

      if (data.error) {
        throw new Error(data.error)
      }

      if (pageNum === 1) {
        setAds(data.ads)
      } else {
        setAds((prev) => [...prev, ...data.ads])
      }

      setTotalAds(data.total)
      console.log("Liczba ogłoszeń:", data.ads)
      setHasMore(pageNum < data.totalPages)
    } catch (error) {
      //console.error("Błąd podczas pobierania ogłoszeń:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ogłoszeń. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchAds(nextPage, sortBy)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid")
  }

  // Skeleton loading dla ogłoszeń
  if (isLoading && ads.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Brak ogłoszeń
  if (ads.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Brak ogłoszeń</h3>
        <p className="text-muted-foreground">
          {isUserProfile
            ? "Ten użytkownik nie dodał jeszcze żadnych ogłoszeń."
            : "Nie znaleziono ogłoszeń spełniających podane kryteria."}
        </p>
      </div>
    )
  }
  


  return (
    <div>
      {/* Pasek narzędzi w stylu Amazona */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Znaleziono {totalAds} {totalAds === 1 ? "ogłoszenie" : totalAds < 5 ? "ogłoszenia" : "ogłoszeń"}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={toggleViewMode}
            title={viewMode === "grid" ? "Widok listy" : "Widok siatki"}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select defaultValue={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue placeholder="Sortuj według" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Najnowsze</SelectItem>
              <SelectItem value="oldest">Najstarsze</SelectItem>
              <SelectItem value="price_asc">Cena: rosnąco</SelectItem>
              <SelectItem value="price_desc">Cena: malejąco</SelectItem>
              <SelectItem value="popular">Najpopularniejsze</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filtry
          </Button>
        </div>
      </div>

      {/* Siatka ogłoszeń */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} image={ad.image[0]}/>
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
          Wyświetlono wszystkie ogłoszenia ({totalAds})
        </div>
      )}
    </div>
  )
}

