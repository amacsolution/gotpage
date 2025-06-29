"use client"

import { CompanyCard } from "@/components/company-card"
import { PageLayout } from "@/components/page-layout"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Award, Building, ChevronLeft, Grid, Loader2, MapIcon, MapPin, Search, Star, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useEffect, useState } from "react"

// Dynamically import the map component with no SSR
const CompanyMap = dynamic(() => import("@/components/company-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

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

const businessCategories = [
  "Sklep detaliczny",
  "Sklep internetowy",
  "Supermarket",
  "Hurtownia",
  "Usługi",
  "Rozrywka",
  "Transport/Logistyka",
  "Klub nocny",
  "Sanatorium",
  "Piekarnia",
  "Centrum zdrowia",
  "Kino/Teatr",
  "Restauracja/Bar/Kawiarnia",
  "Finanse/Ubezpieczenia",
  "Bank",
  "Uroda/Zdrowie/Relaks",
  "Nieruchomości",
  "Reklama/Biznes",
  "Edukacja",
  "Turystyka/Rekreacja",
]

export default function CompanySearchPageClient() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

  // Active filters (from URL)
  const [category, setCategory] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Temporary filters (before applying)
  const [tempCity, setTempCity] = useState<string>("")

  const { toast } = useToast()


  const loggedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null

  // Parse URL parameters
  useEffect(() => {
    const slug = (params?.slug as string[]) || []
    const query = searchParams?.get("q") || ""
    const cityParam = searchParams?.get("city") || ""

    setSearchQuery(query)
    setCity(cityParam)

    // Parse URL pattern: /firmy/szukaj/[category]?city=[city]
    if (slug.length > 0) {
      if (slug[0]) setCategory(decodeURIComponent(slug[0]))
    }
  }, [params, searchParams])

  // Sync temp values with actual values when they change
  useEffect(() => {
    setTempCity(city)
  }, [city])

  // Get search parameters from URL
  const sortBy = searchParams?.get("sortBy") || "rating"

  // Fetch companies
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setCompanies([])
      setPage(1)

      if (!category) return

      try {
        // Build query URL
        const apiParams = new URLSearchParams()
        apiParams.append("page", "1")
        apiParams.append("limit", "12")
        apiParams.append("sortBy", sortBy)

        if (category) apiParams.append("category", category)
        if (city) apiParams.append("location", city)
        if (searchQuery) apiParams.append("q", searchQuery)

        // Fetch companies
        const response = await fetch(`/api/companies?${apiParams.toString()}`, {
          next: {
            revalidate: 172800, // 2 days
            tags: ["companies", "search-results"],
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
  }, [category, city, searchQuery, sortBy, toast])

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setSearchQuery(searchQuery)
    updateURL({ q: searchQuery })
  }

  // Update URL with new parameters
  const updateURL = (newParams: Record<string, string>) => {
    const urlParts = ["/firmy/szukaj"]

    if (category) urlParts.push(encodeURIComponent(category))

    const params = new URLSearchParams(searchParams?.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    const queryString = params.toString()
    const finalUrl = queryString ? `${urlParts.join("/")}?${queryString}` : urlParts.join("/")

    router.push(finalUrl)
  }

  // Apply all filters function
  const applyAllFilters = () => {
    const urlParts = ["/firmy/szukaj"]

    if (category) urlParts.push(encodeURIComponent(category))

    const params = new URLSearchParams()

    // Add query params
    if (tempCity) params.set("city", tempCity)
    if (searchQuery) params.set("q", searchQuery)
    if (sortBy !== "rating") params.set("sortBy", sortBy)

    const queryString = params.toString()
    const finalUrl = queryString ? `${urlParts.join("/")}?${queryString}` : urlParts.join("/")

    router.push(finalUrl)
  }

  // Handle temp filter changes (no URL update)
  const handleTempCityChange = (newCity: string) => {
    setTempCity(newCity)
  }

  // Remove filter
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "category":
        setCategory("")
        router.push("/firmy/szukaj")
        break
      case "city":
        setCity("")
        setTempCity("")
        const params = new URLSearchParams(searchParams?.toString())
        params.delete("city")
        const urlParts = ["/firmy/szukaj"]
        if (category) urlParts.push(encodeURIComponent(category))
        const queryString = params.toString()
        const finalUrl = queryString ? `${urlParts.join("/")}?${queryString}` : urlParts.join("/")
        router.push(finalUrl)
        break
    }
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

      if (category) apiParams.append("category", category)
      if (city) apiParams.append("location", city)
      if (searchQuery) apiParams.append("q", searchQuery)

      const response = await fetch(`/api/companies?${apiParams.toString()}`, {
        next: {
          revalidate: 172800, // 2 days
          tags: ["companies", "search-results"],
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

  return (
    <PageLayout>
      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/firmy")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Powrót do firm
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Szukaj</span>
          {category && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">{category}</span>
            </>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <SearchAutocomplete
            type="companies"
            placeholder="Szukaj w wybranej kategorii..."
            onSearch={handleSearch}
            className="max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Filtry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category selection */}
                {category ?
                  (<Button
                    key={category}
                    variant="default"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => {
                      router.push(`/firmy/szukaj${city ? `?city=${city}` : ""}`)
                    }}
                  >
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{category}</span>
                  </Button>)
                  : (<div>
                    <h4 className="text-sm font-medium mb-3">Kategoria</h4>
                    <div className="space-y-2">
                      {businessCategories.map((cat) => (
                        <Button
                          key={cat}
                          variant={category === cat ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto p-2"
                          onClick={() => {
                            router.push(`/firmy/szukaj/${encodeURIComponent(cat)}${city ? `?city=${city}` : ""}`)
                          }}
                        >
                          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{cat}</span>
                        </Button>
                      ))}
                    </div>
                  </div>)
                }
                <Separator />
                {/* Location filters section */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Lokalizacja</h4>
                  <Select onValueChange={handleTempCityChange} value={tempCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz miasto" />
                    </SelectTrigger>
                    <SelectContent>
                      {allLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-2" />
                            {loc}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />

                {/* Apply filters button */}
                <div className="pt-4">
                  <Button onClick={applyAllFilters} className="w-full" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Szukam...
                      </>
                    ) : (
                      "Szukaj"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Companies */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{category ? `${category} - Firmy ${city ? `w mieście ${city}` : ""}` : `Szukaj firm ${city ? `w mieście ${city}` : ""}`}</h1>
                {totalCompanies > 0 && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {totalCompanies} {totalCompanies === 1 ? "firma" : totalCompanies < 5 ? "firmy" : "firm"}
                  </Badge>
                )}
              </div>

              <div className="flex justify-between w-full items-center gap-2 flex-wrap">
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

                <Select value={sortBy} onValueChange={(value) => updateURL({ sortBy: value })}>
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

            {/* Companies Content */}
            <Tabs value={viewMode} className="mt-6">
              <TabsContent value="grid" className="mt-0">
                {isLoading && companies.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                ) : companies.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {companies.map((company) => (
                        <CompanyCard key={company.id} company={company} logged={loggedUser} />
                      ))}
                    </div>

                    {/* Load more button */}
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
                    <p className="text-muted-foreground">
                      Nie znaleziono firm w wybranej kategorii{city && ` w lokalizacji ${city}`}.
                    </p>
                    <Button className="mt-4" onClick={() => router.push("/promowanie/firma")}>
                      Promuj swoją firmę
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="map" className="mt-0">
                <div className="h-[500px] rounded-lg overflow-hidden mb-6">
                  <CompanyMap companies={companies} isLoading={isLoading} center={{ lat: 52.2297, lng: 21.0122 }} />
                </div>

                {companies.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companies.slice(0, 6).map((company) => (
                      <Card key={company.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
                              <div className="mt-1 font-medium text-sm">{company.category}</div>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/profil/${company.id}`}>Szczegóły</a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
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
