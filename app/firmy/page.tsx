"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { CompanyCard } from "@/components/company-card"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Building, MapPin, Filter, Grid, MapIcon, Star, TrendingUp, Award, Loader2, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamiczny import komponentu mapy (bez SSR)
const CompanyMap = dynamic(() => import("@/components/company-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

// Kategorie biznesowe z ikonami
const businessCategories = [
  { id: "Motoryzacja", name: "Motoryzacja", icon: "🚗", color: "bg-red-100 text-red-800" },
  { id: "Nieruchomości", name: "Nieruchomości", icon: "🏠", color: "bg-blue-100 text-blue-800" },
  { id: "Elektronika", name: "Elektronika", icon: "💻", color: "bg-purple-100 text-purple-800" },
  { id: "Moda", name: "Moda", icon: "👕", color: "bg-pink-100 text-pink-800" },
  { id: "Usługi", name: "Usługi", icon: "🔧", color: "bg-yellow-100 text-yellow-800" },
  { id: "Gastronomia", name: "Gastronomia", icon: "🍽️", color: "bg-green-100 text-green-800" },
  { id: "Dom i ogród", name: "Dom i ogród", icon: "🌱", color: "bg-emerald-100 text-emerald-800" },
  { id: "Sport i hobby", name: "Sport i hobby", icon: "⚽", color: "bg-orange-100 text-orange-800" },
  { id: "Edukacja", name: "Edukacja", icon: "📚", color: "bg-indigo-100 text-indigo-800" },
  { id: "Zdrowie i uroda", name: "Zdrowie i uroda", icon: "💆", color: "bg-rose-100 text-rose-800" },
  { id: "Transport", name: "Transport", icon: "🚚", color: "bg-amber-100 text-amber-800" },
  { id: "Budownictwo", name: "Budownictwo", icon: "🏗️", color: "bg-slate-100 text-slate-800" },
  { id: "IT", name: "IT", icon: "🖥️", color: "bg-cyan-100 text-cyan-800" },
  { id: "Finanse", name: "Finanse", icon: "💰", color: "bg-lime-100 text-lime-800" },
  { id: "Inne", name: "Inne", icon: "🔍", color: "bg-gray-100 text-gray-800" },
]

export default function CompaniesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([])
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [locations, setLocations] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Get search parameters from URL
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const location = searchParams.get("location") || ""
  const sortBy = searchParams.get("sortBy") || "rating"

  // Fetch companies and locations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setCompanies([])
      setPage(1)

      try {
        // Fetch locations
        const locResponse = await fetch("/api/locations")
        if (locResponse.ok) {
          const locData = await locResponse.json()
          setLocations(locData.locations || [])
        }

        // Fetch featured companies
        const featuredResponse = await fetch("/api/companies?promoted=true&limit=3")
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedCompanies(featuredData.companies || [])
        }

        // Build query URL
        const params = new URLSearchParams()
        params.append("page", "1")
        params.append("limit", "12")
        params.append("sortBy", sortBy)

        if (category) params.append("category", category)
        if (location) params.append("location", location)
        if (query) params.append("q", query)

        // Fetch companies
        const response = await fetch(`/api/companies?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Nie udało się pobrać firm")
        }

        const data = await response.json()

        setCompanies(data.companies || [])
        setTotalCompanies(data.total || 0)
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
    if (location) newActiveFilters.push(location)
    setActiveFilters(newActiveFilters)
  }, [category, location, query, sortBy, toast])

  // Handle search
  const handleSearch = (searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    router.push(`/firmy?${params.toString()}`)
  }

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "all") {
      params.set(type, value)
      if (!activeFilters.includes(value)) {
        setActiveFilters([...activeFilters, value])
      }
    } else {
      params.delete(type)
      setActiveFilters(activeFilters.filter((filter) => filter !== value))
    }

    router.push(`/firmy?${params.toString()}`)
  }

  // Remove filter
  const removeFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category === filter) params.delete("category")
    if (location === filter) params.delete("location")

    setActiveFilters(activeFilters.filter((f) => f !== filter))
    router.push(`/firmy?${params.toString()}`)
  }

  // Load more companies
  const loadMore = async () => {
    const nextPage = page + 1

    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      params.append("page", nextPage.toString())
      params.append("limit", "12")
      params.append("sortBy", sortBy)

      if (category) params.append("category", category)
      if (location) params.append("location", location)
      if (query) params.append("q", query)

      const response = await fetch(`/api/companies?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać firm")
      }

      const data = await response.json()

      setCompanies([...companies, ...(data.companies || [])])
      setHasMore(data.page < data.totalPages)
      setPage(nextPage)
    } catch (error) {
      console.error("Błąd podczas pobierania firm:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać więcej firm. Spróbuj ponownie później.",
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
          <div className="relative z-10 py-12 px-6 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Katalog Firm</h1>
              <p className="text-xl mb-8 text-white/90">
                Znajdź zaufane firmy i usługodawców w Twojej okolicy. Przeglądaj opinie, sprawdź oceny i nawiąż kontakt.
              </p>

              <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm p-1 rounded-lg">
                <SearchAutocomplete
                  type="companies"
                  placeholder="Szukaj firm, usług, lokalizacji..."
                  onSearch={handleSearch}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {businessCategories.slice(0, 6).map((cat) => (
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

        {/* Wyróżnione firmy */}
        {featuredCompanies.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Award className="h-5 w-5 mr-2 text-amber-500" /> Wyróżnione firmy
              </h2>
              <Button variant="link" className="text-primary" onClick={() => router.push("/promocja/firmy")}>
                Promuj swoją firmę <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-48 w-full rounded-lg" />
                  ))
                : featuredCompanies.map((company) => (
                    <div key={company.id} className="relative">
                      <Badge className="absolute top-2 right-2 z-10 bg-amber-500">Wyróżniona</Badge>
                      <CompanyCard company={company} featured={true} />
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Filtry */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Katalog firm</h2>
              {totalCompanies > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {totalCompanies} {totalCompanies === 1 ? "firma" : totalCompanies < 5 ? "firmy" : "firm"}
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
                  <SelectItem value="rating">Najwyżej oceniane</SelectItem>
                  <SelectItem value="newest">Najnowsze</SelectItem>
                  <SelectItem value="popular">Najpopularniejsze</SelectItem>
                  <SelectItem value="name_asc">Nazwa: A-Z</SelectItem>
                  <SelectItem value="name_desc">Nazwa: Z-A</SelectItem>
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
                  router.push("/firmy")
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
                  {businessCategories.map((cat) => (
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
          </div>
        )}

        {/* Widok firm */}
        <Tabs value={viewMode} className="mt-6">
          <TabsContent value="grid" className="mt-0">
            {isLoading && companies.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : companies.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
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
                        "Załaduj więcej firm"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Brak firm</h3>
                <p className="text-muted-foreground">Nie znaleziono firm spełniających podane kryteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[500px] rounded-lg overflow-hidden">
              <CompanyMap
                companies={companies}
                isLoading={isLoading}
                center={location ? undefined : { lat: 52.2297, lng: 21.0122 }} // Warszawa jako domyślne centrum
              />
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-4">Firmy w wybranym obszarze</h3>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : companies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies.slice(0, 6).map((company) => (
                    <Card key={company.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              {company.logo ? (
                                <img
                                  src={company.logo || "/placeholder.svg"}
                                  alt={company.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <Building className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{company.name}</h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{company.location}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3"
                                  fill={i < Math.floor(company.rating) ? "currentColor" : "none"}
                                  color={i < Math.floor(company.rating) ? "#FFB800" : "#D1D5DB"}
                                />
                              ))}
                              <span className="text-xs ml-1">
                                {Number(company.rating).toFixed(1)} ({company.reviewCount})
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/profil/${company.id}`}>Szczegóły</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Brak firm w wybranym obszarze</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Sekcja statystyk */}
        <div className="mt-16 py-12 px-6 bg-muted/20 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Dlaczego warto dołączyć do katalogu?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dołącz do tysięcy firm, które już korzystają z naszego katalogu i zwiększ swoją widoczność online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg hover:-translate-y-2 hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Zwiększ widoczność</h3>
                  <p className="text-sm text-muted-foreground">
                    Docieraj do tysięcy potencjalnych klientów poszukujących Twoich usług w Twojej okolicy.
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
                  <h3 className="font-medium mb-2">Buduj zaufanie</h3>
                  <p className="text-sm text-muted-foreground">
                    Zbieraj opinie i oceny od zadowolonych klientów, budując wiarygodność swojej firmy.
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
                    Skorzystaj z opcji promowania, aby wyróżnić swoją firmę na tle konkurencji.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => router.push("/promocja/firmy")}>
              Promuj swoją firmę
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

