"use client"

import { AdCard } from "@/components/ad-card"
import { PageLayout } from "@/components/page-layout"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Award, ChevronLeft, Grid, Loader2, MapIcon, MapPin, PlusCircle, Star, Tag, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import slugify from "slugify"

// Dynamiczny import komponentu mapy (bez SSR)
const AdsMap = dynamic(() => import("@/components/ads-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

export default function CityPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [ads, setAds] = useState<any[]>([])
  const [totalAds, setTotalAds] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [city, setCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { toast } = useToast()

  const loggedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null

  // Parse URL parameters
  useEffect(() => {
    const slug = (params?.slug as string[]) || []
    const query = searchParams?.get("q") || ""

    setSearchQuery(query)

    // Parse URL pattern: /miasto/[city]
    if (slug.length > 0 && slug[0]) {
      setCity(decodeURIComponent(slug[0]))
    }
  }, [params, searchParams])

  // Get search parameters from URL
  const sortBy = searchParams?.get("sortBy") || "newest"

  // Fetch ads
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setAds([])
      setPage(1)

      if (!city) return

      try {
        // Build query URL
        const apiParams = new URLSearchParams()
        apiParams.append("page", "1")
        apiParams.append("limit", "12")
        apiParams.append("sortBy", sortBy)

        if (city) apiParams.append("location", city)
        if (searchQuery) apiParams.append("q", searchQuery)

        // Fetch ads
        const response = await fetch(`/api/ogloszenia?${apiParams.toString()}`, {
          next: {
            revalidate: 172800, // 2 days
            tags: ["ads", "city-results"],
          },
        })

        if (!response.ok) {
          throw new Error("Nie udało się pobrać ogłoszeń")
        }

        const data = await response.json()

        setAds(data.ads || [])
        setTotalAds(data.total || 0)
        setHasMore(data.page < data.totalPages)
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error)
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych. Spróbuj ponownie później.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (city) {
      fetchData()
    }
  }, [city, searchQuery, sortBy, toast])

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setSearchQuery(searchQuery)
    const params = new URLSearchParams(searchParams?.toString())

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    const queryString = params.toString()
    const finalUrl = queryString
      ? `/ogloszenia/miasto/${encodeURIComponent(city)}?${queryString}`
      : `/ogloszenia/miasto/${encodeURIComponent(city)}`

    router.push(finalUrl)
  }

  // Load more ads
  const loadMore = async () => {
    const nextPage = page + 1

    try {
      setIsLoading(true)

      const apiParams = new URLSearchParams()
      apiParams.append("page", nextPage.toString())
      apiParams.append("limit", "12")
      apiParams.append("sortBy", sortBy)

      if (city) apiParams.append("location", city)
      if (searchQuery) apiParams.append("q", searchQuery)

      const response = await fetch(`/api/ogloszenia?${apiParams.toString()}`, {
        next: {
          revalidate: 172800, // 2 days
          tags: ["ads", "city-results"],
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się pobrać ogłoszeń")
      }

      const data = await response.json()

      setAds([...ads, ...(data.ads || [])])
      setHasMore(data.page < data.totalPages)
      setPage(nextPage)
    } catch (error) {
      console.error("Błąd podczas pobierania ogłoszeń:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać więcej ogłoszeń. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!city) {
    return (
      <PageLayout>
        <div className="container py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Nie wybrano miasta</h1>
            <Button onClick={() => router.push("/ogloszenia")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Powrót do ogłoszeń
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/ogloszenia")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Powrót do ogłoszeń
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-md text-muted-foreground">Miasto</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-md font-medium">{city}</span>
        </div>

        {/* Header */}
        <div className=" flex flex-col mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Ogłoszenia w {city}</h1>
              <p className="text-muted-foreground">Znajdź najlepsze oferty w Twojej okolicy</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="max-w-md">
            <SearchAutocomplete
              type="ads"
              placeholder={`Szukaj ogłoszeń w ${city}...`}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Ogłoszenia</h2>
            {/* {totalAds > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                {totalAds} {totalAds === 1 ? "ogłoszenie" : totalAds < 5 ? "ogłoszenia" : "ogłoszeń"}
              </Badge>
            )} */}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "map")}>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid className="h-4 w-4 mr-1" /> Lista
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapIcon className="h-4 w-4 mr-1" /> Mapa
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select
              value={sortBy}
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams?.toString())
                params.set("sortBy", value)
                const queryString = params.toString()
                const finalUrl = queryString
                  ? `/ogloszenia/miasto/${encodeURIComponent(city)}?${queryString}`
                  : `/ogloszenia/miasto/${encodeURIComponent(city)}`
                router.push(finalUrl)
              }}
            >
              <SelectTrigger className="w-[180px]">
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
          </div>
        </div>

        {/* Ads Content */}
        <Tabs value={viewMode} className="mt-6">
          <TabsContent value="grid" className="mt-0">
            {isLoading && ads.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : ads.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.map((ad) => (
                    <AdCard key={ad.id} ad={ad} logged={loggedUser} />
                  ))}
                </div>

                {/* Load more button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMore} variant="outline" className="min-w-[200px]" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ładowanie...
                        </>
                      ) : (
                        "Załaduj więcej ogłoszeń"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Brak ogłoszeń</h3>
                <p className="text-muted-foreground">Nie znaleziono ogłoszeń w {city}.</p>
                <Button className="mt-4" onClick={() => router.push("/dodaj-ogloszenie")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Dodaj ogłoszenie
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[500px] rounded-lg overflow-hidden mb-6">
              <AdsMap ads={ads} isLoading={isLoading} center={{ lat: 52.2297, lng: 21.0122 }} />
            </div>

            {ads.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.map((ad) => (

                  <Card key={ad.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            {ad.images && ad.images.length > 0 ? (
                              <img
                                src={ad.images[0] || "/placeholder.svg"}
                                alt={ad.title}
                                className="w-12 h-12 object-cover"
                              />
                            ) : (
                              <Tag className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{ad.title}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{ad.location}</span>
                          </div>
                          <div className="mt-1 font-medium text-sm">
                            {ad.price ? `${ad.price} zł` : "Cena do negocjacji"}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/ogloszenia/${ad.id}-${slugify(ad.title, { lower: true, strict: true })}`}>Szczegóły</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        {/* Sekcja statystyk */}
        <div className="mt-16 py-12 px-6 bg-muted/20 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Dlaczego warto dodać ogłoszenie?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dołącz do tysięcy użytkowników, którzy już korzystają z naszego serwisu i znajdź kupców na swoje produkty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg hover:-translate-y-2 hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Szeroki zasięg</h3>
                  <p className="text-sm text-muted-foreground">
                    Docieraj do tysięcy potencjalnych kupujących poszukujących Twoich produktów w Twojej okolicy.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-2 hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Łatwa sprzedaż</h3>
                  <p className="text-sm text-muted-foreground">
                    Prosty proces dodawania ogłoszeń i kontaktu z kupującymi sprawia, że sprzedaż jest szybka i wygodna.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-2 hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Wyróżnij się</h3>
                  <p className="text-sm text-muted-foreground">
                    Skorzystaj z opcji promowania, aby wyróżnić swoje ogłoszenie na tle konkurencji.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => router.push("/dodaj-ogloszenie")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj ogłoszenie
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
