"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MapPin } from "lucide-react"

// Mock data dla ogłoszeń
const mockAds = [
  {
    id: 1,
    title: "Mieszkanie na sprzedaż, 3 pokoje, 60m²",
    description: "Przestronne mieszkanie w centrum miasta z widokiem na park. Idealne dla rodziny lub pod inwestycję.",
    price: 450000,
    location: "Warszawa, Mokotów",
    category: "Nieruchomości",
    subcategory: "Mieszkania",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-15T12:00:00Z",
    views: 120,
    promoted: true,
    author_name: "Biuro Nieruchomości XYZ",
    author_type: "business",
    author_verified: true,
  },
  {
    id: 2,
    title: "Samochód osobowy Toyota Corolla 2019",
    description: "Toyota Corolla z 2019 roku, przebieg 45000 km, benzyna, stan idealny, pierwszy właściciel.",
    price: 65000,
    location: "Kraków, Małopolskie",
    category: "Motoryzacja",
    subcategory: "Samochody osobowe",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-14T10:30:00Z",
    views: 85,
    promoted: false,
    author_name: "Jan Kowalski",
    author_type: "individual",
    author_verified: false,
  },
  {
    id: 3,
    title: "iPhone 13 Pro, 256GB, gwarancja",
    description: "Sprzedam iPhone 13 Pro w idealnym stanie, 256GB pamięci, na gwarancji jeszcze przez rok.",
    price: 3800,
    location: "Wrocław, Dolnośląskie",
    category: "Elektronika",
    subcategory: "Telefony",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-13T15:45:00Z",
    views: 65,
    promoted: true,
    author_name: "Sklep iMobile",
    author_type: "business",
    author_verified: true,
  },
  {
    id: 4,
    title: "Rower górski Kross Level 5.0",
    description: "Rower górski Kross Level 5.0, rozmiar ramy L, koła 29 cali, hamulce tarczowe, stan bardzo dobry.",
    price: 2200,
    location: "Poznań, Wielkopolskie",
    category: "Sport i hobby",
    subcategory: "Rowery",
    image_url: "/placeholder.svg?height=200&width=300",
    created_at: "2023-09-12T09:15:00Z",
    views: 42,
    promoted: false,
    author_name: "Marek Nowak",
    author_type: "individual",
    author_verified: false,
  },
]

// Definicja typu dla ogłoszenia
interface Ad {
  id: number
  title: string
  description: string
  price: number
  location: string
  category: string
  subcategory: string
  image_url: string
  created_at: string
  views: number
  promoted: boolean
  author_name: string
  author_type: string
  author_verified: boolean
}

interface AdFeedProps {
  limit?: number
  showFilters?: boolean
  category?: string
  location?: string
  priceMin?: number
  priceMax?: number
  searchQuery?: string
  showLoadMore?: boolean
  isUserProfile?: boolean
}

export function AdFeed({
  limit = 8,
  showFilters = false,
  category,
  location,
  priceMin,
  priceMax,
  searchQuery,
  showLoadMore = true,
  isUserProfile = false,
}: AdFeedProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Funkcja do formatowania ceny
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Funkcja do formatowania daty
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Dzisiaj"
    } else if (diffDays === 1) {
      return "Wczoraj"
    } else if (diffDays < 7) {
      return `${diffDays} dni temu`
    } else {
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
      })
    }
  }

  // Pobieranie ogłoszeń
  const fetchAds = async () => {
    try {
      setLoading(true)

      // Używamy mock data zamiast próby pobierania z bazy danych po stronie klienta
      console.log("Używam mock data dla ogłoszeń")

      // Symulacja opóźnienia, aby pokazać loading state
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (page === 1) {
        setAds(mockAds)
      } else {
        setAds((prevAds) => [...prevAds, ...mockAds])
      }

      // Symulacja, że nie ma więcej danych po 2 stronach
      setHasMore(page < 2)
    } catch (error) {
      console.error("Błąd podczas pobierania ogłoszeń:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrowanie ogłoszeń
  const filteredAds = ads.filter((ad) => {
    let matches = true

    if (category && ad.category !== category) {
      matches = false
    }

    if (location && !ad.location.toLowerCase().includes(location.toLowerCase())) {
      matches = false
    }

    if (priceMin && ad.price < priceMin) {
      matches = false
    }

    if (priceMax && ad.price > priceMax) {
      matches = false
    }

    if (searchQuery && !ad.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      matches = false
    }

    return matches
  })

  // Podział na promowane i zwykłe ogłoszenia
  const promotedAds = filteredAds.filter((ad) => ad.promoted)
  const regularAds = filteredAds.filter((ad) => !ad.promoted)

  // Pobieranie ogłoszeń przy pierwszym renderowaniu i zmianie filtrów
  useEffect(() => {
    setPage(1)
    fetchAds()
  }, [category, location, priceMin, priceMax, searchQuery])

  // Pobieranie kolejnych ogłoszeń przy zmianie strony
  useEffect(() => {
    if (page > 1) {
      fetchAds()
    }
  }, [page])

  // Renderowanie skeletonów podczas ładowania
  if (loading && page === 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: limit }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Renderowanie komunikatu, gdy nie ma ogłoszeń
  if (!loading && filteredAds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nie znaleziono ogłoszeń spełniających kryteria</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sekcja promowanych ogłoszeń */}
      {promotedAds.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ogłoszenia promowane</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {promotedAds.map((ad) => (
              <Link href={`/ogloszenia/${ad.id}`} key={ad.id}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={ad.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={ad.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Promowane</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Dodaj do ulubionych</span>
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold line-clamp-2">{ad.title}</h3>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{ad.location}</span>
                    </div>
                    <p className="text-lg font-bold text-primary mb-2">{formatPrice(ad.price)}</p>
                    <p className="text-sm line-clamp-2 text-muted-foreground">{ad.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{formatDate(ad.created_at)}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-muted-foreground">{ad.views} wyświetleń</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sekcja zwykłych ogłoszeń */}
      <div className="space-y-4">
        {promotedAds.length > 0 && <h2 className="text-xl font-semibold">Pozostałe ogłoszenia</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {regularAds.map((ad) => (
            <Link href={`/ogloszenia/${ad.id}`} key={ad.id}>
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={ad.image_url || "/placeholder.svg?height=200&width=300"}
                    alt={ad.title}
                    fill
                    className="object-cover"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Dodaj do ulubionych</span>
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold line-clamp-2">{ad.title}</h3>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{ad.location}</span>
                  </div>
                  <p className="text-lg font-bold text-primary mb-2">{formatPrice(ad.price)}</p>
                  <p className="text-sm line-clamp-2 text-muted-foreground">{ad.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{formatDate(ad.created_at)}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="text-muted-foreground">{ad.views} wyświetleń</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {loading && page > 1 && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {showLoadMore && hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setPage((prev) => prev + 1)}>
            Załaduj więcej
          </Button>
        </div>
      )}
    </div>
  )
}

