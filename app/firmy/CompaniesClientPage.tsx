"use client"

import { CompanyCard } from "@/components/company-card"
import { PageLayout } from "@/components/page-layout"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Award, Building, ChevronRight, Filter, Grid, Loader2, MapIcon, MapPin, Star, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

// Dynamically import the map component with no SSR
const CompanyMap = dynamic(() => import("@/components/company-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

// Business categories with icons
const businessCategories = [
  { id: "Sklep detaliczny", name: "Sklep detaliczny", icon: "🛒", color: "bg-green-100 text-green-800" },
  { id: "Sklep internetowy", name: "Sklep internetowy", icon: "🛍️", color: "bg-blue-100 text-blue-800" },
  { id: "Supermarket", name: "Supermarket", icon: "🏬", color: "bg-red-100 text-red-800" },
  { id: "Hurtownia", name: "Hurtownia", icon: "📦", color: "bg-yellow-100 text-yellow-800" },
  { id: "Usługi", name: "Usługi", icon: "🧰", color: "bg-gray-100 text-gray-800" },
  { id: "Rozrywka", name: "Rozrywka", icon: "🎭", color: "bg-purple-100 text-purple-800" },
  { id: "Transport/Logistyka", name: "Transport/Logistyka", icon: "🚚", color: "bg-orange-100 text-orange-800" },
  { id: "Klub nocny", name: "Klub nocny", icon: "🎉", color: "bg-pink-100 text-pink-800" },
  { id: "Sanatorium", name: "Sanatorium", icon: "🏥", color: "bg-teal-100 text-teal-800" },
  { id: "Piekarnia", name: "Piekarnia", icon: "🥖", color: "bg-amber-100 text-amber-800" },
  { id: "Centrum zdrowia", name: "Centrum zdrowia", icon: "🩺", color: "bg-emerald-100 text-emerald-800" },
  { id: "Kino/Teatr", name: "Kino/Teatr", icon: "🎬", color: "bg-indigo-100 text-indigo-800" },
  { id: "Restauracja/Bar/Kawiarnia", name: "Restauracja/Bar/Kawiarnia", icon: "🍽️", color: "bg-rose-100 text-rose-800" },
  { id: "Finanse/Ubezpieczenia", name: "Finanse/Ubezpieczenia", icon: "💼", color: "bg-lime-100 text-lime-800" },
  { id: "Bank", name: "Bank", icon: "🏦", color: "bg-blue-100 text-blue-800" },
  { id: "Uroda/Zdrowie/Relaks", name: "Uroda/Zdrowie/Relaks", icon: "💆", color: "bg-pink-100 text-pink-800" },
  { id: "Nieruchomości", name: "Nieruchomości", icon: "🏠", color: "bg-yellow-100 text-yellow-800" },
  { id: "Reklama/Biznes", name: "Reklama/Biznes", icon: "📢", color: "bg-amber-100 text-amber-800" },
  { id: "Edukacja", name: "Edukacja", icon: "📚", color: "bg-indigo-100 text-indigo-800" },
  { id: "Turystyka/Rekreacja", name: "Turystyka/Rekreacja", icon: "🏖️", color: "bg-green-100 text-green-800" },
]

const allLocations = [
  "Warszawa",
  "Kraków",
  "Łódź",
  "Wrocław",
  "Poznań",
  "Gdańsk",
  "Szczecin",
  "Bydgoszcz",
  "Lublin",
  "Białystok",
  "Katowice",
  "Gdynia",
  "Częstochowa",
  "Radom",
  "Sosnowiec",
  "Toruń",
  "Kielce",
  "Rzeszów",
  "Gliwice",
  "Zabrze",
  "Olsztyn",
  "Bielsko-Biała",
  "Bytom",
  "Zielona Góra",
  "Rybnik",
  "Ruda Śląska",
  "Tychy",
  "Opole",
  "Elbląg",
  "Płock",
  "Wałbrzych",
  "Włocławek",
  "Tarnów",
  "Chorzów",
  "Koszalin",
  "Kalisz",
  "Legnica",
  "Grudziądz",
  "Słupsk",
  "Jaworzno",
  "Jelenia Góra",
  "Nowy Sącz",
  "Jastrzębie-Zdrój",
  "Siedlce",
  "Mysłowice",
  "Zamość",
  "Piotrków Trybunalski",
  "Konin",
  "Inowrocław",
  "Lubin",
  "Ostrowiec Świętokrzyski",
  "Gorzów Wielkopolski",
  "Suwałki",
  "Pabianice",
  "Przemyśl",
  "Łomża",
  "Stalowa Wola",
]

export default function CompaniesPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([])
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)
  const [category, setCategory] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { toast } = useToast()

  const loggedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null

  // Get search parameters from URL
  const query = searchParams?.get("q") || ""
  const sortBy = searchParams?.get("sortBy") || "rating"

  // Fetch companies and locations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setCompanies([])
      setPage(1)

      try {
        // Fetch featured companies
        const featuredResponse = await fetch("/api/companies?promoted=true&limit=3", {
          next: {
            revalidate: 172800, // 2 days
            tags: ["companies", "featured"],
          },
        })
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedCompanies(featuredData.companies || [])
        }

        // Build query URL for general companies
        const apiParams = new URLSearchParams()
        apiParams.append("page", "1")
        apiParams.append("limit", "12")
        apiParams.append("sortBy", sortBy)

        if (query) apiParams.append("q", query)

        // Fetch companies
        const response = await fetch(`/api/companies?${apiParams.toString()}`, {
          next: {
            revalidate: 172800, // 2 days
            tags: ["companies", "main-results"],
          },
        })

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
  }, [query, sortBy, toast])

  // Handle category change
  function handleCategoryChange(cat: string) {
    setCategory(cat)
  }

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setSearchQuery(searchQuery)
    const params = new URLSearchParams(searchParams?.toString())

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    router.push(`/firmy?${params.toString()}`)
  }

  // Handle city selection
  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity)
  }

  // Handle form submission with routing logic
  const handleSubmit = () => {
    let url = ""
    const params = new URLSearchParams()

    if (searchQuery) {
      params.set("q", searchQuery)
    }

    if (city && !category) {
      // Only city selected: navigate to /firmy/miasto directory
      url = `/firmy/miasto/${encodeURIComponent(city)}`
    } else if (category) {
      // Category selected: navigate to /firmy/szukaj directory
      url = `/firmy/szukaj/${encodeURIComponent(category)}`
      if (city) {
        params.set("city", city)
      }
    } else {
      // Default to main companies page
      url = "/firmy"
    }

    const queryString = params.toString()
    const finalUrl = queryString ? `${url}?${queryString}` : url

    router.push(finalUrl)
  }

  // Load more companies
  const loadMore = async () => {
    const nextPage = page + 1

    try {
      setIsLoading(true)

      const apiParams = new URLSearchParams()
      apiParams.append("page", nextPage.toString())
      apiParams.append("limit", "12")
      apiParams.append("sortBy", sortBy)

      if (query) apiParams.append("q", query)

      const response = await fetch(`/api/companies?${apiParams.toString()}`, {
        next: {
          revalidate: 172800, // 2 days
          tags: ["companies", "main-results"],
        },
      })

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

  // Scroll to filters
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
                    className={`text-sm py-1.5 px-3 cursor-pointer hover:bg-white/20 ${category === cat.name ? "bg-white/30" : "bg-white/10"
                      }`}
                    onClick={() => handleCategoryChange(cat.name)}
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

        {/* Featured companies */}
        {featuredCompanies.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Award className="h-5 w-5 mr-2 text-amber-500" /> Wyróżnione firmy
              </h2>
              <Button variant="link" className="text-primary" onClick={() => router.push("/promowanie/firma")}>
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
                    <CompanyCard company={company} featured={true} logged={loggedUser} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Extended filters */}
        {showFilters && (
          <div ref={filtersRef} className="mb-8 p-6 bg-muted/20 rounded-lg">
            <h3 className="font-medium mb-4">Wybierz kategorię i lokalizację</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Kategorie</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {businessCategories.map((cat) => (
                    <Badge
                      key={cat.id}
                      className={`flex items-center gap-1 py-1.5 px-3 cursor-pointer text-foreground ${category === cat.name ? cat.color : "bg-muted hover:bg-muted/80"
                        }`}
                      onClick={() => handleCategoryChange(cat.name)}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Lokalizacja</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allLocations.slice(0, 10).map((loc) => (
                    <Badge
                      key={loc}
                      className={`flex items-center gap-1 py-1.5 px-3 cursor-pointer text-foreground ${city === loc ? "bg-blue-100 text-blue-800" : "bg-muted hover:bg-muted/80"
                        }`}
                      onClick={() => handleCityChange(loc)}
                    >
                      <MapPin className="h-3 w-3" /> {loc}
                    </Badge>
                  ))}
                </div>

                {allLocations.length > 10 && (
                  <Select onValueChange={(value) => handleCityChange(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Więcej lokalizacji..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allLocations.slice(10).map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Submit button for filters */}
            <div className="mt-6 flex justify-center">
              <Button onClick={handleSubmit} className="px-8">
                Szukaj firm
              </Button>
            </div>
          </div>
        )}

        {/* Recent companies section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Najnowsze firmy</h2>
              {totalCompanies > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {totalCompanies} {totalCompanies === 1 ? "firma" : totalCompanies < 5 ? "firmy" : "firm"}
                </Badge>
              )}
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
                  router.push(`/firmy?${params.toString()}`)
                }}
              >
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
        </div>

        {/* Company view */}
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

                {/* Pagination buttons */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      className="min-w-[200px] bg-transparent"
                      disabled={isLoading}
                    >
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
                <Button className="mt-4" onClick={() => router.push("/promowanie/firma")}>
                  Promuj swoją firmę
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[500px] rounded-lg overflow-hidden">
              <CompanyMap companies={companies} isLoading={isLoading} center={{ lat: 52.2297, lng: 21.0122 }} />
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

        {/* Statistics section */}
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
              <CardContent className="pt-6">
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
            <Button size="lg" onClick={() => router.push("/promowanie/firma")}>
              Promuj swoją firmę
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
