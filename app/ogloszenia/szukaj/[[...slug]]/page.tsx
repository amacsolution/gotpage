"use client"

import { AdCard } from "@/components/ad-card"
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
import { ChevronLeft, Grid, Loader2, MapIcon, MapPin, PlusCircle, Tag, TagsIcon, X } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useEffect, useState } from "react"

// Dynamiczny import komponentu mapy (bez SSR)
const AdsMap = dynamic(() => import("@/components/ads-map"), {
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

const finalCategories = [
  {
    name: "Motoryzacja",
    subcategories: [
      { name: "Samochody osobowe" },
      { name: "Motocykle" },
      { name: "Części" },
      { name: "Przyczepy" },
      { name: "Samochody Ciężarowe" },
      { name: "Inne pojazdy" },
    ],
  },
  {
    name: "RTV/AGD",
    subcategories: [
      { name: "Telewizory" },
      { name: "Kamery" },
      { name: "Pralki/Suszarki" },
      { name: "Zmywarki" },
      { name: "Kuchenki" },
      { name: "Piekarniki" },
      { name: "Lodówki" },
      { name: "Zamrażarki" },
      { name: "Pozostałe" },
    ],
  },
  {
    name: "Elektronika",
    subcategories: [
      {
        name: "Telefony i Akcesoria",
        subsubcategories: ["Smartfony", "Urządzenia Stacjonarne", "Akcesoria"],
      },
      {
        name: "Komputery i Akcesoria",
        subsubcategories: [
          "Komputery Stacjonarne",
          "Laptopy/Netbooki",
          "Tablety/Palmtopy",
          "Monitory/Projektory",
          "Drukarki/Skanery",
          "Akcesoria",
          "Internet i Sieci",
          "Oprogramowanie",
        ],
      },
    ],
  },
  {
    name: "Moda",
    subcategories: [
      {
        name: "Kobiety",
        subsubcategories: [
          "Sukienki",
          "Spódnice",
          "Bluzki i Koszule",
          "Swetry i Bluzy",
          "T-shirty i Toppi",
          "Marynarki i Żakiety",
          "Kurtki i Płaszcze",
          "Spodnie i Legginsy",
          "Buty",
          "Torebki",
          "Bielizna",
          "Stroje Kąpielowe",
          "Biżuteria",
          "Akcesoria (czapki, szaliki, rękawiczki)",
          "Pozostałe",
        ],
      },
      {
        name: "Mężczyźni",
        subsubcategories: [
          "Koszule",
          "T-shirty i Polówki",
          "Swetry i Bluzy",
          "Marynarki i Garnitury",
          "Kurtki i Płaszcze",
          "Spodnie i Jeansy",
          "Buty",
          "Bielizna",
          "Zegarki",
          "Paski i Portfele",
          "Akcesoria (czapki, szaliki, rękawiczki)",
          "Pozostałe",
        ],
      },
    ],
  },
  // Add more categories as needed
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [ads, setAds] = useState<any[]>([])
  const [totalAds, setTotalAds] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [category, setCategory] = useState<string>("")
  const [subcategory, setSubcategory] = useState<string>("")
  const [finalcategory, setFinalcategory] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [subcategories, setSubcategories] = useState<{ name: string; subsubcategories?: string[] }[]>([])
  const [finalcategories, setFinalCategories] = useState<string[]>([])
  const { toast } = useToast()

  // Parse URL parameters
  useEffect(() => {
    const slug = (params?.slug as string[]) || []
    const query = searchParams?.get("q") || ""

    setSearchQuery(query)

    // Parse URL pattern: /szukaj/[category]/[subcategory?]/[finalcategory?]/[city?]
    if (slug.length > 0) {
      if (slug[0]) setCategory(decodeURIComponent(slug[0]))
      if (slug[1]) setSubcategory(decodeURIComponent(slug[1]))
      if (slug[2]) setFinalcategory(decodeURIComponent(slug[2]))
      if (slug[3]) setCity(decodeURIComponent(slug[3]))
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

      try {
        // Build query URL
        const apiParams = new URLSearchParams()
        apiParams.append("page", "1")
        apiParams.append("limit", "12")
        apiParams.append("sortBy", sortBy)

        if (category) apiParams.append("category", category)
        if (subcategory) apiParams.append("subcategory", subcategory)
        if (finalcategory) apiParams.append("finalcategory", finalcategory)
        if (city) apiParams.append("location", city)
        if (searchQuery) apiParams.append("q", searchQuery)

        // Fetch ads
        const response = await fetch(`/api/ogloszenia?${apiParams.toString()}`)

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
  }, [category, subcategory, finalcategory, city, searchQuery, sortBy, toast])

  // Update subcategories when category changes
  useEffect(() => {
    if (category) {
      const fcategory = finalCategories.find((c) => c.name === category)
      if (fcategory) {
        setSubcategories(fcategory.subcategories || [])
      }
    }
  }, [category])

  // Update final categories when subcategory changes
  useEffect(() => {
    if (subcategory) {
      const fcategory = finalCategories.find((c) =>
        (c.subcategories || []).some((subcat) => subcat.name === subcategory),
      )
      if (fcategory) {
        const fsubcategory = (fcategory.subcategories || []).find((subcat) => subcat.name === subcategory)
        if (fsubcategory && "subsubcategories" in fsubcategory && Array.isArray(fsubcategory.subsubcategories)) {
          setFinalCategories(fsubcategory.subsubcategories)
        }
      }
    }
  }, [subcategory])

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setSearchQuery(searchQuery)
    updateURL({ q: searchQuery })
  }

  // Update URL with new parameters
  const updateURL = (newParams: Record<string, string>) => {
    const urlParts = ["ogloszenia/szukaj"]

    if (category) urlParts.push(encodeURIComponent(category))
    if (subcategory) urlParts.push(encodeURIComponent(subcategory))
    if (finalcategory) urlParts.push(encodeURIComponent(finalcategory))
    if (city) urlParts.push(encodeURIComponent(city))

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

  // Handle filter changes
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setSubcategory("")
    setFinalcategory("")

    const urlParts = ["ogloszenia/szukaj", encodeURIComponent(newCategory)]
    const params = new URLSearchParams(searchParams?.toString())
    const queryString = params.toString()
    const finalUrl = queryString ? `${urlParts.join("/")}?${queryString}` : urlParts.join("/")

    router.push(finalUrl)
  }

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
    setFinalcategory("")

    const urlParts = ["ogloszenia/szukaj", encodeURIComponent(category), encodeURIComponent(newSubcategory)]
    const params = new URLSearchParams(searchParams?.toString())
    const queryString = params.toString()
    const finalUrl = queryString ? `${urlParts.join("/")}?${queryString}` : urlParts.join("/")

    router.push(finalUrl)
  }

  const handleFinalCategoryChange = (newFinalCategory: string) => {
    setFinalcategory(newFinalCategory)

    const urlParts = [
      "ogloszenia/szukaj",
      encodeURIComponent(category),
      encodeURIComponent(subcategory),
      encodeURIComponent(newFinalCategory),
    ]
    if (city) urlParts.push(encodeURIComponent(city))

    const params = new URLSearchParams(searchParams?.toString())
    const queryString = params.toString()
    const finalUrl = queryString ? `${urlParts.join("/")}?${queryString}` : urlParts.join("/")

    router.push(finalUrl)
  }

  const handleCityChange = (newCity: string) => {
    setCity(newCity)

    const urlParts = ["/ogloszenia/szukaj"]
    if (category) urlParts.push(encodeURIComponent(category))
    if (subcategory) urlParts.push(encodeURIComponent(subcategory))
    if (finalcategory) urlParts.push(encodeURIComponent(finalcategory))
    urlParts.push(encodeURIComponent(newCity))

    const params = new URLSearchParams(searchParams?.toString())
    const queryString = params.toString()
    const finalUrl = queryString ? `${urlParts.join("/")}?${queryString}` : urlParts.join("/")

    router.push(finalUrl)
  }

  // Remove filter
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "category":
        setCategory("")
        setSubcategory("")
        setFinalcategory("")
        router.push("/ogloszenia/szukaj")
        break
      case "subcategory":
        setSubcategory("")
        setFinalcategory("")
        router.push(`/ogloszenia/szukaj/${encodeURIComponent(category)}`)
        break
      case "finalcategory":
        setFinalcategory("")
        router.push(`/ogloszenia/szukaj/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`)
        break
      case "city":
        setCity("")
        const urlParts = ["/ogloszenia/szukaj"]
        if (category) urlParts.push(encodeURIComponent(category))
        if (subcategory) urlParts.push(encodeURIComponent(subcategory))
        if (finalcategory) urlParts.push(encodeURIComponent(finalcategory))
        router.push(urlParts.join("/"))
        break
    }
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

      if (category) apiParams.append("category", category)
      if (subcategory) apiParams.append("subcategory", subcategory)
      if (finalcategory) apiParams.append("finalcategory", finalcategory)
      if (city) apiParams.append("location", city)
      if (searchQuery) apiParams.append("q", searchQuery)

      const response = await fetch(`/api/ogloszenia?${apiParams.toString()}`)

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
          <span className="text-sm text-muted-foreground">Szukaj</span>
          {category && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">{category}</span>
            </>
          )}
          {subcategory && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">{subcategory}</span>
            </>
          )}
          {finalcategory && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">{finalcategory}</span>
            </>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <SearchAutocomplete
            type="ads"
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
                {/* Active filters */}
                {(category || subcategory || finalcategory || city) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Aktywne filtry</h4>
                    <div className="space-y-2">
                      {category && (
                        <Badge variant="secondary" className="flex items-center justify-between w-full">
                          <span className="truncate">{category}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-2 hover:bg-transparent"
                            onClick={() => removeFilter("category")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {subcategory && (
                        <Badge variant="secondary" className="flex items-center justify-between w-full">
                          <span className="truncate">{subcategory}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-2 hover:bg-transparent"
                            onClick={() => removeFilter("subcategory")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {finalcategory && (
                        <Badge variant="secondary" className="flex items-center justify-between w-full">
                          <span className="truncate">{finalcategory}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-2 hover:bg-transparent"
                            onClick={() => removeFilter("finalcategory")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {city && (
                        <Badge variant="secondary" className="flex items-center justify-between w-full">
                          <span className="truncate">{city}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-2 hover:bg-transparent"
                            onClick={() => removeFilter("city")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                    </div>
                    <Separator className="my-4" />
                  </div>
                )}

                {/* Category selection */}
                {!category && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Kategoria</h4>
                    <div className="space-y-2">
                      {finalCategories.map((cat) => (
                        <Button
                          key={cat.name}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto p-2"
                          onClick={() => handleCategoryChange(cat.name)}
                        >
                          <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subcategory selection */}
                {category && subcategories.length > 0 && !subcategory && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Podkategoria</h4>
                    <div className="space-y-2">
                      {subcategories.map((subcat) => (
                        <Button
                          key={subcat.name}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto p-2"
                          onClick={() => handleSubcategoryChange(subcat.name)}
                        >
                          <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{subcat.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final category selection */}
                {subcategory && finalcategories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Szczegółowa kategoria</h4>
                    <div className="space-y-2">
                      {finalcategories.map((finalcat) => (
                        <Button
                          key={finalcat}
                          variant={finalcategory === finalcat ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto p-2"
                          onClick={() => handleFinalCategoryChange(finalcat)}
                        >
                          <TagsIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{finalcat}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Location selection */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Lokalizacja</h4>
                  <Select onValueChange={handleCityChange} value={city}>
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
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Ads */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {category
                    ? `${category}${subcategory ? ` - ${subcategory}` : ""}${finalcategory ? ` - ${finalcategory}` : ""}`
                    : "Szukaj ogłoszeń"}
                </h1>
                {totalAds > 0 && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {totalAds} {totalAds === 1 ? "ogłoszenie" : totalAds < 5 ? "ogłoszenia" : "ogłoszeń"}
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

                <Select value={sortBy} onValueChange={(value) => updateURL({ sortBy: value })}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-48 w-full rounded-lg" />
                    ))}
                  </div>
                ) : ads.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {ads.map((ad) => (
                        <AdCard key={ad.id} ad={ad} />
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
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Brak ogłoszeń</h3>
                    <p className="text-muted-foreground">
                      Nie znaleziono ogłoszeń w wybranej kategorii{city && ` w lokalizacji ${city}`}.
                    </p>
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
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
