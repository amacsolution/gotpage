"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { AdCard } from "@/components/ad-card"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Tag,
  MapPin,
  Filter,
  Grid,
  MapIcon,
  TrendingUp,
  Star,
  Award,
  Loader2,
  ChevronRight,
  PlusCircle,
} from "lucide-react"
import dynamic from "next/dynamic"

// Dynamiczny import komponentu mapy (bez SSR)
const AdsMap = dynamic(() => import("@/components/ads-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

// Kategorie ogłoszeń z ikonami
const adCategories = [
  { id: "Motoryzacja", name: "Motoryzacja", icon: "🚗", color: "bg-red-100 text-red-800" },
  { id: "Nieruchomości", name: "Nieruchomości", icon: "🏠", color: "bg-blue-100 text-blue-800" },
  { id: "Elektronika", name: "Elektronika", icon: "💻", color: "bg-purple-100 text-purple-800" },
  { id: "Moda", name: "Moda", icon: "👕", color: "bg-pink-100 text-pink-800" },
  { id: "Usługi", name: "Usługi", icon: "🔧", color: "bg-yellow-100 text-yellow-800" },
  { id: "Dom i ogród", name: "Dom i ogród", icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
  { id: "Sport i hobby", name: "Sport i hobby", icon: "⚽", color: "bg-orange-100 text-orange-800" },
  { id: "Edukacja", name: "Edukacja", icon: "📚", color: "bg-indigo-100 text-indigo-800" },
  { id: "Zdrowie i uroda", name: "Zdrowie i uroda", icon: "💆", color: "bg-rose-100 text-rose-800" },
  { id: "Praca", name: "Praca", icon: "💼", color: "bg-amber-100 text-amber-800" },
  { id: "Zwierzęta", name: "Zwierzęta", icon: "🐾", color: "bg-lime-100 text-lime-800" },
  { id: "Dla dzieci", name: "Dla dzieci", icon: "🧸", color: "bg-cyan-100 text-cyan-800" },
  { id: "Inne", name: "Inne", icon: "🔍", color: "bg-gray-100 text-gray-800" },
]

export default function AdsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [ads, setAds] = useState<any[]>([])
  const [featuredAds, setFeaturedAds] = useState<any[]>([])
  const [totalAds, setTotalAds] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [locations, setLocations] = useState<string[]>([])
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Get search parameters from URL
  const query = searchParams?.get("q") || ""
  const category = searchParams?.get("category") || ""
  const subcategory = searchParams?.get("subcategory") || ""
  const location = searchParams?.get("location") || ""
  const sortBy = searchParams?.get("sortBy") || "newest"

  // Fetch ads and locations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setAds([])
      setPage(1)

      try {
        // Fetch locations
        const locResponse = await fetch("/api/locations")
        if (locResponse.ok) {
          const locData = await locResponse.json()
          setLocations(locData.locations || [])
        }

        // Fetch featured ads
        const featuredResponse = await fetch("/api/ads?promoted=true&limit=3")
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedAds(featuredData.ads || [])
        }

        // Fetch subcategories if category is selected
        if (category) {
          const subcatResponse = await fetch(`/api/categories/${category}/subcategories`)
          if (subcatResponse.ok) {
            const subcatData = await subcatResponse.json()
            setSubcategories(subcatData.subcategories || [])
          }
        } else {
          setSubcategories([])
        }

        // Build query URL
        const params = new URLSearchParams()
        params.append("page", "1")
        params.append("limit", "12")
        params.append("sortBy", sortBy)

        if (category) params.append("category", category)
        if (subcategory) params.append("subcategory", subcategory)
        if (location) params.append("location", location)
        if (query) params.append("q", query)

        // Fetch ads
        const response = await fetch(`/api/ads?${params.toString()}`)

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

    fetchData()

    // Ustaw aktywne filtry na podstawie URL
    const newActiveFilters = []
    if (category) newActiveFilters.push(category)
    if (subcategory) newActiveFilters.push(subcategory)
    if (location) newActiveFilters.push(location)
    setActiveFilters(newActiveFilters)
  }, [category, subcategory, location, query, sortBy, toast])

  // Handle search
  const handleSearch = (searchQuery: string) => {
    const params = new URLSearchParams(searchParams?.toString())

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    router.push(`/ogloszenia?${params.toString()}`)
  }

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString())

    if (value && value !== "all") {
      params.set(type, value)
      if (!activeFilters.includes(value)) {
        setActiveFilters([...activeFilters, value])
      }
    } else {
      params.delete(type)
      setActiveFilters(activeFilters.filter((filter) => filter !== value))
    }

    // Jeśli zmieniamy kategorię, usuń podkategorię
    if (type === "category") {
      params.delete("subcategory")
    }

    router.push(`/ogloszenia?${params.toString()}`)
  }

  // Remove filter
  const removeFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams?.toString())

    if (category === filter) params.delete("category")
    if (subcategory === filter) params.delete("subcategory")
    if (location === filter) params.delete("location")

    setActiveFilters(activeFilters.filter((f) => f !== filter))
    router.push(`/ogloszenia?${params.toString()}`)
  }

  // Load more ads
  const loadMore = async () => {
    const nextPage = page + 1

    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      params.append("page", nextPage.toString())
      params.append("limit", "12")
      params.append("sortBy", sortBy)

      if (category) params.append("category", category)
      if (subcategory) params.append("subcategory", subcategory)
      if (location) params.append("location", location)
      if (query) params.append("q", query)

      const response = await fetch(`/api/ads?${params.toString()}`)

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

  // Scroll do filtrów
  useEffect(() => {
    if (showFilters && filtersRef.current) {
      filtersRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [showFilters])

  return (
    <PageLayout>
      <div className="container py-6">
        {/* Hero section */}
        <div className="relative mb-12 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-purple-700 opacity-90"></div>
          <div className="relative z-10 py-12 px-6 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Ogłoszenia</h1>
              <p className="text-xl mb-8 text-white/90">
                Znajdź idealne ogłoszenie w Twojej okolicy. Przeglądaj, kontaktuj się i znajdź to, czego szukasz.
              </p>

              <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm p-1 rounded-lg">
                <SearchAutocomplete
                  type="ads"
                  placeholder="Szukaj ogłoszeń, produktów, usług..."
                  onSearch={handleSearch}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {adCategories.slice(0, 6).map((cat) => (
                  <Badge
                    key={cat.id}
                    className={`text-sm py-1.5 px-3 cursor-pointer hover:bg-white/20 ${
                      category === cat.id ? "bg-white/30" : "bg-white/10"
                    }`}
                    onClick={() => handleFilterChange("category", cat.id)}
                  >
                    <span className="mr-1">{cat.icon}</span> {cat.name}
                  </Badge>
                ))}
                <Badge
                  className="text-sm py-1.5 px-3 cursor-pointer hover:bg-white/20 bg-white/10"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-3 w-3 mr-1" /> Więcej filtrów
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Wyróżnione ogłoszenia */}
        {featuredAds.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Award className="h-5 w-5 mr-2 text-amber-500" /> Wyróżnione ogłoszenia
              </h2>
              <Button variant="link" className="text-primary" onClick={() => router.push("/dodaj")}>
                Dodaj swoje ogłoszenie <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-48 w-full rounded-lg" />
                  ))
                : featuredAds.map((ad) => (
                    <div key={ad.id} className="relative">
                      {/* <Badge className="absolute top-2 right-2 z-10 bg-amber-500">Wyróżnione</Badge> */}
                      <AdCard ad={ad} />
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Filtry */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Ogłoszenia</h2>
              {totalAds > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {totalAds} {totalAds === 1 ? "ogłoszenie" : totalAds < 5 ? "ogłoszenia" : "ogłoszeń"}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtry
                {activeFilters.length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground">{activeFilters.length}</Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
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

          {/* Aktywne filtry */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => removeFilter(filter)}
                  >
                    <span className="sr-only">Usuń filtr</span>
                    &times;
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveFilters([])
                  router.push("/ogloszenia")
                }}
              >
                Wyczyść wszystkie
              </Button>
            </div>
          )}
        </div>

        {/* Rozszerzone filtry */}
        {showFilters && (
          <div ref={filtersRef} className="mb-8 p-6 bg-muted/20 rounded-lg">
            <h3 className="font-medium mb-4">Filtry zaawansowane</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Kategorie</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {adCategories.map((cat) => (
                    <Badge
                      key={cat.id}
                      className={`flex items-center gap-1 py-1.5 px-3 cursor-pointer ${
                        category === cat.id ? cat.color : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => handleFilterChange("category", cat.id)}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Lokalizacja</h4>
                <div className="grid grid-cols-2 gap-2">
                  {locations.slice(0, 10).map((loc) => (
                    <Badge
                      key={loc}
                      className={`flex items-center gap-1 py-1.5 px-3 cursor-pointer ${
                        location === loc ? "bg-blue-100 text-blue-800" : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => handleFilterChange("location", loc)}
                    >
                      <MapPin className="h-3 w-3" /> {loc}
                    </Badge>
                  ))}
                </div>

                {locations.length > 10 && (
                  <Select onValueChange={(value) => handleFilterChange("location", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Więcej lokalizacji..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.slice(10).map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Podkategorie - pokazuj tylko jeśli wybrano kategorię */}
            {category && subcategories.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-3">Podkategorie dla {category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {subcategories.map((subcat) => (
                    <Badge
                      key={subcat}
                      className={`flex items-center gap-1 py-1.5 px-3 cursor-pointer ${
                        subcategory === subcat ? "bg-purple-100 text-purple-800" : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => handleFilterChange("subcategory", subcat)}
                    >
                      <Tag className="h-3 w-3" /> {subcat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Widok ogłoszeń */}
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
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>

                {/* Przyciski paginacji */}
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
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Brak ogłoszeń</h3>
                <p className="text-muted-foreground">Nie znaleziono ogłoszeń spełniających podane kryteria.</p>
                <Button className="mt-4" onClick={() => router.push("/dodaj-ogloszenie")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Dodaj ogłoszenie
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[500px] rounded-lg overflow-hidden">
              <AdsMap
                ads={ads}
                isLoading={isLoading}
                center={location ? undefined : { lat: 52.2297, lng: 21.0122 }} // Warszawa jako domyślne centrum
              />
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-4">Ogłoszenia w wybranym obszarze</h3>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : ads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ads.slice(0, 6).map((ad) => (
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
                            <a href={`/ogloszenia/${ad.id}`}>Szczegóły</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Brak ogłoszeń w wybranym obszarze</p>
                </div>
              )}
            </div>
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
              <CardContent className="pt-6 hover:shadow-lg transition-all">
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

