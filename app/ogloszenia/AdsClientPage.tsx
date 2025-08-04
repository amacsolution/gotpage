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
import {
  Award,
  ChevronRight,
  Filter,
  Grid,
  Loader2,
  MapIcon,
  MapPin,
  PlusCircle,
  Star,
  Tag,
  TagsIcon,
  TrendingUp,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
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

// Kategorie ogłoszeń z ikonami
const adCategories = [
  { id: "Motoryzacja", name: "Motoryzacja", icon: "🚗", color: "bg-red-100 text-red-800" },
  { id: "RTV/AGD", name: "RTV/AGD", icon: "📺", color: "bg-indigo-100 text-indigo-800" },
  { id: "Elektronika", name: "Elektronika", icon: "💻", color: "bg-purple-100 text-purple-800" },
  { id: "Moda", name: "Moda", icon: "👗", color: "bg-pink-100 text-pink-800" },
  { id: "Dom i ogród", name: "Dom i ogród", icon: "🏡", color: "bg-green-100 text-green-800" },
  { id: "Nieruchomości", name: "Nieruchomości", icon: "🏠", color: "bg-blue-100 text-blue-800" },
  { id: "Dla dzieci", name: "Dla dzieci", icon: "🧸", color: "bg-cyan-100 text-cyan-800" },
  { id: "Zdrowie i Uroda", name: "Zdrowie i Uroda", icon: "💆‍♀️", color: "bg-rose-100 text-rose-800" },
  { id: "Zwierzęta i Akcesoria", name: "Zwierzęta i Akcesoria", icon: "🐾", color: "bg-lime-100 text-lime-800" },
  { id: "Praca", name: "Praca", icon: "💼", color: "bg-amber-100 text-amber-800" },
  { id: "Sport/Turystyka", name: "Sport/Turystyka", icon: "🏕️", color: "bg-orange-100 text-orange-800" },
  { id: "Bilety/e-Bilety", name: "Bilety/e-Bilety", icon: "🎫", color: "bg-yellow-100 text-yellow-800" },
  { id: "Usługi", name: "Usługi", icon: "🔧", color: "bg-yellow-200 text-yellow-900" },
  { id: "Przemysł", name: "Przemysł", icon: "🏭", color: "bg-stone-100 text-stone-800" },
  { id: "Rozrywka", name: "Rozrywka", icon: "🎮", color: "bg-fuchsia-100 text-fuchsia-800" },
  { id: "Antyki/Kolekcje/Sztuka", name: "Antyki/Kolekcje/Sztuka", icon: "🖼️", color: "bg-gray-100 text-gray-800" },
  { id: "Wycieczki/Podróże", name: "Wycieczki/Podróże", icon: "✈️", color: "bg-teal-100 text-teal-800" },
];

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
  "Stalowa Wola"
];

const finalCategories = [
  {
    name: "Motoryzacja",
    subcategories: [
      { name: "Samochody osobowe" },
      { name: "Motocykle" },
      { name: "Części" },
      { name: "Przyczepy" },
      { name: "Samochody Ciężarowe" },
      { name: "Inne pojazdy" }
    ]
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
      { name: "Pozostałe" }
    ]
  },
  {
    name: "Elektronika",
    subcategories: [
      {
        name: "Telefony i Akcesoria",
        subsubcategories: [
          "Smartfony",
          "Urządzenia Stacjonarne",
          "Akcesoria"
        ]
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
          "Oprogramowanie"
        ]
      }
    ]
  },
  {
    name: "Moda",
    subcategories: [
      {
        name: "Kobiety",
        subsubcategories: [
          "Sukienki", "Spódnice", "Bluzki i Koszule", "Swetry i Bluzy",
          "T-shirty i Toppi", "Marynarki i Żakiety", "Kurtki i Płaszcze",
          "Spodnie i Legginsy", "Buty", "Torebki", "Bielizna",
          "Stroje Kąpielowe", "Biżuteria", "Akcesoria (czapki, szaliki, rękawiczki)",
          "Pozostałe"
        ]
      },
      {
        name: "Mężczyźni",
        subsubcategories: [
          "Koszule", "T-shirty i Polówki", "Swetry i Bluzy", "Marynarki i Garnitury",
          "Kurtki i Płaszcze", "Spodnie i Jeansy", "Buty", "Bielizna",
          "Zegarki", "Paski i Portfele", "Akcesoria (czapki, szaliki, rękawiczki)",
          "Pozostałe"
        ]
      }
    ]
  },
  {
    name: "Dom i ogród",
    subcategories: [
      { name: "Meble do domu" },
      { name: "Wyposażenie domu" },
      { name: "Narzędzia" },
      { name: "Budownictwo" },
      { name: "Wyposażenie Ogrodu" },
      { name: "Inne" }
    ]
  },
  {
    name: "Nieruchomości",
    subcategories: [
      {
        name: "Na sprzedaż",
        subsubcategories: ["Domy", "Mieszkania", "Działki", "Lokale", "Garaże/Magazyny"]
      },
      {
        name: "Wynajem",
        subsubcategories: ["Domy", "Mieszkania", "Działki", "Lokale", "Garaże/Magazyny"]
      },
      {
        name: "Wynajem krótkoterminowy",
        subsubcategories: ["Domy", "Mieszkania", "Działki", "Lokale", "Garaże/Magazyny"]
      }
    ]
  },
  {
    name: "Dla dzieci",
    subcategories: [
      { name: "Ubranka" },
      { name: "Zabawki" },
      { name: "Zdrowie i Higiena" },
      { name: "Akcesoria" },
      { name: "Artykuły Szkolne" },
      { name: "Inne" }
    ]
  },
  {
    name: "Zdrowie i Uroda",
    subcategories: [
      { name: "Perfumy" },
      { name: "Kosmetyki" },
      { name: "Makijaż" },
      { name: "Apteczka" },
      { name: "Akcesoria" },
      { name: "Pielęgnacja" },
      { name: "Usługi Kosmetyczne" },
      { name: "Usługi Fryzjerskie" },
      { name: "Pozostałe" }
    ]
  },
  {
    name: "Zwierzęta i Akcesoria",
    subcategories: [
      { name: "Etaty" },
      { name: "Freelance" },
      { name: "Zdalna" },
      { name: "Dorywcza" },
      { name: "Sezonowa" }
    ]
  },
  {
    name: "Praca",
    subcategories: [
      {
        name: "Zdalna",
        subsubcategories: [
          "Umowa o Pracę", "B2B", "Umowa Zlecenie", "Umowa o dzieło", "Freelance"
        ]
      },
      {
        name: "Stacjonarnie",
        subsubcategories: [
          "Umowa o Pracę", "B2B", "Umowa Zlecenie", "Umowa o dzieło", "Staż/Praktyki"
        ]
      }
    ]
  },
  {
    name: "Sport/Turystyka",
    subcategories: [
      { name: "Rowery i Akcesoria" },
      { name: "Turystyka" },
      { name: "Siłownia/Fitnes" },
      { name: "Wedkarstwo" },
      { name: "Bieganie" },
      { name: "Militaria" },
      { name: "Pozostałe" }
    ]
  },
  {
    name: "Bilety/e-Bilety",
    subcategories: []
  },
  {
    name: "Usługi",
    subcategories: [
      {
        name: "Lokalne",
        subsubcategories: [
          "Dolnośląskie", "Kujawsko-Pomorskie", "Lubelskie", "Lubuskie", "Łódzkie",
          "Małopolskie", "Mazowieckie", "Opolskie", "Podkarpackie", "Podlaskie",
          "Pomorskie", "Śląskie", "Świętokrzyskie", "Warmińsko-Mazurskie",
          "Wielkopolskie", "Zachodniopomorskie"
        ]
      },
      {
        name: "Internetowe",
        subsubcategories: ["Freelance"]
      }
    ]
  },
  {
    name: "Przemysł",
    subcategories: [
      { name: "Gastronomia" },
      { name: "Hotelarstwo" },
      { name: "Fryzjerstwo/Kosmetyka" },
      { name: "Biuro i Reklama" },
      { name: "Pozostałe" }
    ]
  },
  {
    name: "Rozrywka",
    subcategories: [
      { name: "Filmy" },
      { name: "Muzyka" },
      { name: "Książki/Komiksy" },
      { name: "Gry" },
      { name: "Instrumenty" },
      { name: "Pozostałe" }
    ]
  },
  {
    name: "Antyki/Kolekcje/Sztuka",
    subcategories: [
      { name: "Design/Antyki" },
      { name: "Kolekcje" },
      { name: "Hobby" },
      { name: "Pozostałe" }
    ]
  },
  {
    name: "Wycieczki/Podróże",
    subcategories: [
      {
        name: "Krajowe",
        subsubcategories: ["Morze", "Góry", "Mazury", "Pozostałe Regiony"]
      },
      {
        name: "Zagraniczne",
        subsubcategories: ["Morze", "Góry"]
      }
    ]
  }
];


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
  const [subcategories, setSubcategories] = useState<{ name: string; subsubcategories?: string[] }[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)
  const [category, setCategory] = useState<string>("")
  const [subcategory, setSubcategory] = useState<string>("")
  const [finalcategory, setFinalcategory] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [finalcategories, setFinalCategories] = useState<string[]>([])
  const [showsub, setShowsub] = useState(false)
  const [showfin, setShowfin] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { toast } = useToast()

  // Get search parameters from URL
  const query = searchParams?.get("q") || ""
  const sortBy = searchParams?.get("sortBy") || "newest"

  const loggedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null

  // Fetch ads and locations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setAds([])
      setPage(1)

      try {
        setLocations(allLocations)

        // Fetch featured ads
        const featuredResponse = await fetch("/api/ogloszenia?promoted=true&limit=3")
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedAds(featuredData.ads || [])
        }

        // Build query URL for general ads
        const apiParams = new URLSearchParams()
        apiParams.append("page", "1")
        apiParams.append("limit", "12")
        apiParams.append("sortBy", sortBy)

        if (query) apiParams.append("q", query)

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
  }, [query, sortBy, toast])

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    const fcategory = finalCategories.find((c) => c.name === cat)
    setSubcategory("")
    setShowsub(false)
    setShowfin(false)
    setFinalcategory("")
    if (fcategory) {
      setSubcategories(fcategory.subcategories || [])
      setShowsub(true)
    } else {
      setSubcategories([])
    }
  }

  // Set final-categories when subcategory is selected
  function handleSubcategoryChange(sub: string) {
    setSubcategory(sub)
    setShowfin(false)
    const fcategory = finalCategories.find((c) => (c.subcategories || []).some((subcat) => subcat.name === sub))
    setFinalcategory("")
    if (fcategory) {
      // Find the selected subcategory
      const fsubcategory = (fcategory.subcategories || []).find((subcat) => subcat.name === sub)
      if (fsubcategory && "subsubcategories" in fsubcategory && Array.isArray(fsubcategory.subsubcategories)) {
        setFinalCategories(fsubcategory.subsubcategories)
        setShowfin(true)
      } else {
        setFinalCategories([])
      }
    } else {
      setFinalCategories([])
    }
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

    router.push(`/ogloszenia?${params.toString()}`)
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
      // Only city selected: navigate to /miasto directory
      url = `ogloszenia/miasto/${encodeURIComponent(city)}`
    } else if (category) {
      // Category selected: navigate to /ogloszenia/szukaj directory

      const sanitize = (str: string) => str.replace(/\//g, '--');

      const urlParts = ["/ogloszenia/szukaj", encodeURIComponent(sanitize(category))]

      if (subcategory) {
        urlParts.push(encodeURIComponent(sanitize(subcategory)))

        if (finalcategory) {
          urlParts.push(encodeURIComponent(sanitize(finalcategory)))
        }
      }

      if (city) {
        params.set("city", city)
      }

      url = urlParts.join("/")
    } else {
      // Default to main ads page
      url = "/ogloszenia"
    }

    const queryString = params.toString()
    const finalUrl = queryString ? `${url}?${queryString}` : url

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

      if (query) apiParams.append("q", query)

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
                    <AdCard ad={ad} logged={loggedUser} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Rozszerzone filtry */}
        {showFilters && (
          <div ref={filtersRef} className="mb-8 p-6 bg-muted/20 rounded-lg">
            <h3 className="font-medium mb-4">Wybierz kategorię i lokalizację</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Kategorie</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {adCategories.map((cat) => (
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

                {/* Podkategorie - pokazuj tylko jeśli wybrano kategorię */}
                {showsub && subcategories.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-3">Podkategorie dla {category}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {subcategories.map((subcat) => (
                        <Badge
                          key={subcat.name}
                          className={`flex items-center gap-1 py-1.5 px-3 cursor-pointer ${subcategory === subcat.name
                            ? "bg-primary text-white"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                            }`}
                          onClick={() => handleSubcategoryChange(subcat.name)}
                        >
                          <Tag className="h-3 w-3" /> {subcat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {showfin && finalcategories.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-3">Szczegółowe kategorie dla {subcategory}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {finalcategories.map((subcat) => (
                        <Badge
                          key={subcat}
                          className={`flex items-center gap-1 py-1.5 px-3 cursor-pointer ${finalcategory === subcat
                            ? "bg-primary text-white"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                            }`}
                          onClick={() => setFinalcategory(subcat)}
                        >
                          <TagsIcon className="h-3 w-3" /> {subcat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Lokalizacja</h4>
                <div className="grid grid-cols-2 gap-2">
                  {locations.slice(0, 10).map((loc) => (
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

                {locations.length > 10 && (
                  <Select onValueChange={(value) => handleCityChange(value)}>
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

            {/* Submit button for filters */}
            <div className="mt-6 flex justify-center">
              <Button onClick={handleSubmit} className="px-8">
                Szukaj ogłoszeń
              </Button>
            </div>
          </div>
        )}

        {/* Recent ads section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Najnowsze ogłoszenia</h2>
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtry
              </Button>

              <Select
                value={sortBy}
                onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams?.toString())
                  params.set("sortBy", value)
                  router.push(`/ogloszenia?${params.toString()}`)
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
        </div>

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
                    <AdCard key={ad.id} ad={ad} logged={loggedUser} />
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
              <AdsMap ads={ads} isLoading={isLoading} center={{ lat: 52.2297, lng: 21.0122 }} />
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

