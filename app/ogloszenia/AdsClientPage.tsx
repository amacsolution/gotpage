"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/legacy/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, Tag, Filter, X, Grid, MapIcon, Heart, MessageSquare, Eye } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import dynamic from "next/dynamic"

// Dynamiczne importowanie komponentu mapy (bez SSR)
const AdsMap = dynamic(() => import("@/components/ads-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted/30 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  ),
})

// Mock data dla ogłoszeń
const mockAds = [
  {
    id: 1,
    title: "Mieszkanie 3-pokojowe, 65m², Centrum",
    description:
      "Przestronne mieszkanie w centrum miasta. 3 pokoje, oddzielna kuchnia, łazienka z WC. Blisko komunikacji miejskiej, szkół i sklepów.",
    category: "Nieruchomości",
    subcategory: "Mieszkania",
    price: 450000,
    currency: "PLN",
    location: "Warszawa, Mazowieckie",
    coordinates: { lat: 52.2297, lng: 21.0122 },
    images: ["/placeholder.svg?height=300&width=400&text=Mieszkanie"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    promoted: true,
    author: {
      id: 1,
      name: "Jan Kowalski",
      avatar: "/placeholder.svg?height=40&width=40&text=JK",
      verified: true,
    },
    likes: 24,
    views: 356,
    comments: 5,
  },
  {
    id: 2,
    title: "Toyota Corolla 2018, 1.8 Hybrid, 72 000 km",
    description:
      "Sprzedam Toyotę Corollę z 2018 roku w bardzo dobrym stanie. Hybryda 1.8, przebieg 72 000 km. Pierwszy właściciel, serwisowana w ASO.",
    category: "Motoryzacja",
    subcategory: "Samochody osobowe",
    price: 65000,
    currency: "PLN",
    location: "Kraków, Małopolskie",
    coordinates: { lat: 50.0647, lng: 19.945 },
    images: ["/placeholder.svg?height=300&width=400&text=Toyota+Corolla"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    promoted: false,
    author: {
      id: 2,
      name: "Anna Nowak",
      avatar: "/placeholder.svg?height=40&width=40&text=AN",
      verified: false,
    },
    likes: 15,
    views: 230,
    comments: 3,
  },
  {
    id: 3,
    title: 'MacBook Pro 16" 2021, M1 Pro, 16GB RAM, 512GB SSD',
    description:
      "Sprzedam MacBooka Pro 16 cali z 2021 roku. Procesor M1 Pro, 16GB RAM, 512GB SSD. Stan idealny, na gwarancji do listopada 2023.",
    category: "Elektronika",
    subcategory: "Laptopy",
    price: 8500,
    currency: "PLN",
    location: "Wrocław, Dolnośląskie",
    coordinates: { lat: 51.1079, lng: 17.0385 },
    images: ["/placeholder.svg?height=300&width=400&text=MacBook+Pro"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    promoted: true,
    author: {
      id: 3,
      name: "Piotr Wiśniewski",
      avatar: "/placeholder.svg?height=40&width=40&text=PW",
      verified: true,
    },
    likes: 32,
    views: 412,
    comments: 7,
  },
  {
    id: 4,
    title: "Sofa narożna, rozkładana, szara",
    description:
      "Sprzedam sofę narożną w kolorze szarym. Rozkładana, z pojemnikiem na pościel. Wymiary: 250x200 cm. Stan bardzo dobry.",
    category: "Dom i ogród",
    subcategory: "Meble",
    price: 1200,
    currency: "PLN",
    location: "Poznań, Wielkopolskie",
    coordinates: { lat: 52.4064, lng: 16.9252 },
    images: ["/placeholder.svg?height=300&width=400&text=Sofa"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    promoted: false,
    author: {
      id: 4,
      name: "Katarzyna Lewandowska",
      avatar: "/placeholder.svg?height=40&width=40&text=KL",
      verified: false,
    },
    likes: 8,
    views: 145,
    comments: 2,
  },
  {
    id: 5,
    title: "iPhone 13 Pro, 128GB, grafitowy",
    description:
      "Sprzedam iPhone'a 13 Pro w kolorze grafitowym. Pamięć 128GB. Stan idealny, komplet: pudełko, ładowarka, słuchawki. Na gwarancji.",
    category: "Elektronika",
    subcategory: "Telefony",
    price: 3800,
    currency: "PLN",
    location: "Gdańsk, Pomorskie",
    coordinates: { lat: 54.352, lng: 18.6466 },
    images: ["/placeholder.svg?height=300&width=400&text=iPhone"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    promoted: true,
    author: {
      id: 5,
      name: "Michał Kowalczyk",
      avatar: "/placeholder.svg?height=40&width=40&text=MK",
      verified: true,
    },
    likes: 19,
    views: 278,
    comments: 4,
  },
  {
    id: 6,
    title: "Rower górski Kross Level 5.0, 29 cali",
    description:
      "Sprzedam rower górski Kross Level 5.0. Koła 29 cali, rama aluminiowa 19 cali, przerzutki Shimano Deore. Stan bardzo dobry.",
    category: "Sport i hobby",
    subcategory: "Rowery",
    price: 2500,
    currency: "PLN",
    location: "Łódź, Łódzkie",
    coordinates: { lat: 51.7592, lng: 19.456 },
    images: ["/placeholder.svg?height=300&width=400&text=Rower"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    promoted: false,
    author: {
      id: 6,
      name: "Tomasz Nowicki",
      avatar: "/placeholder.svg?height=40&width=40&text=TN",
      verified: false,
    },
    likes: 11,
    views: 189,
    comments: 1,
  },
]

// Kategorie
const categories = [
  "Wszystkie kategorie",
  "Motoryzacja",
  "Nieruchomości",
  "Elektronika",
  "Moda",
  "Usługi",
  "Dom i ogród",
  "Sport i hobby",
]

// Lokalizacje
const locations = [
  "Wszystkie lokalizacje",
  "Warszawa, Mazowieckie",
  "Kraków, Małopolskie",
  "Wrocław, Dolnośląskie",
  "Poznań, Wielkopolskie",
  "Gdańsk, Pomorskie",
  "Łódź, Łódzkie",
]

export default function AdsClientPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie kategorie")
  const [selectedLocation, setSelectedLocation] = useState("Wszystkie lokalizacje")
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [showFilters, setShowFilters] = useState(false)
  const [ads, setAds] = useState(mockAds)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [sortBy, setSortBy] = useState("newest")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Filtrowanie ogłoszeń na podstawie kryteriów
    let filteredAds = mockAds

    if (searchQuery) {
      filteredAds = filteredAds.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "Wszystkie kategorie") {
      filteredAds = filteredAds.filter((ad) => ad.category === selectedCategory)
    }

    if (selectedLocation !== "Wszystkie lokalizacje") {
      filteredAds = filteredAds.filter((ad) => ad.location === selectedLocation)
    }

    filteredAds = filteredAds.filter((ad) => ad.price >= priceRange[0] && ad.price <= priceRange[1])

    // Sortowanie
    if (sortBy === "newest") {
      filteredAds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } else if (sortBy === "price_asc") {
      filteredAds.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === "price_desc") {
      filteredAds.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === "popular") {
      filteredAds.sort((a, b) => b.views - a.views)
    }

    setAds(filteredAds)
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedCategory("Wszystkie kategorie")
    setSelectedLocation("Wszystkie lokalizacje")
    setPriceRange([0, 1000000])
    setAds(mockAds)
  }

  // Format date to relative time (e.g. "2 days ago")
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? "dzień" : "dni"} temu`
    } else if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? "godzina" : diffInHours < 5 ? "godziny" : "godzin"} temu`
    } else {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minuta" : diffInMinutes < 5 ? "minuty" : "minut"} temu`
    }
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Ogłoszenia</h1>
          <p className="text-muted-foreground">
            Przeglądaj ogłoszenia lub użyj wyszukiwarki, aby znaleźć to, czego szukasz
          </p>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Szukaj ogłoszeń..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Szukaj</Button>
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtry
            </Button>
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
          </form>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filtry wyszukiwania</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Kategoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Lokalizacja</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz lokalizację" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sortuj według</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sortuj według" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Najnowsze</SelectItem>
                    <SelectItem value="price_asc">Cena: rosnąco</SelectItem>
                    <SelectItem value="price_desc">Cena: malejąco</SelectItem>
                    <SelectItem value="popular">Najpopularniejsze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-1 block">
                  Zakres cenowy: {priceRange[0]} - {priceRange[1]} PLN
                </label>
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000000}
                  step={1000}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 PLN</span>
                  <span>1 000 000 PLN</span>
                </div>
              </div>
              <div className="md:col-span-3">
                <Button variant="outline" className="w-full" onClick={handleReset}>
                  Resetuj filtry
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs value={viewMode} className="mt-6">
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.length > 0 ? (
                ads.map((ad) => (
                  <Link href={`/ogloszenia/${ad.id}`} key={ad.id}>
                    <Card
                      className={`hover:shadow-md overflow-hidden transition-all ${ad.promoted ? "border-primary/40" : "border-muted"}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col">
                          {/* Zdjęcie produktu */}
                          <div className="relative w-full h-48 overflow-hidden bg-muted">
                            <Image
                              src={ad.images[0] || "/placeholder.svg"}
                              alt={ad.title}
                              layout="fill"
                              objectFit="cover"
                            />
                            {ad.promoted && (
                              <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground">
                                Promowane
                              </Badge>
                            )}
                          </div>

                          {/* Informacje o produkcie */}
                          <div className="flex-1 p-4">
                            <div className="space-y-2">
                              {/* Tytuł produktu */}
                              <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors">
                                {ad.title}
                              </h3>

                              {/* Kategoria */}
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{ad.category}</Badge>
                                {ad.subcategory && <Badge variant="outline">{ad.subcategory}</Badge>}
                              </div>

                              {/* Cena */}
                              {ad.price && (
                                <div className="font-bold text-xl text-primary">
                                  {ad.price.toLocaleString()} {ad.currency || "PLN"}
                                </div>
                              )}

                              {/* Krótki opis */}
                              <p className="text-muted-foreground text-sm line-clamp-2">{ad.description}</p>

                              {/* Lokalizacja */}
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="text-sm">{ad.location}</span>
                              </div>

                              {/* Informacje o sprzedawcy i interakcjach */}
                              <div className="flex justify-between items-center pt-2 mt-2 border-t border-muted">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full overflow-hidden">
                                    <Image
                                      src={ad.author.avatar || "/placeholder.svg"}
                                      alt={ad.author.name}
                                      width={24}
                                      height={24}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{ad.author.name}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-xs text-muted-foreground">
                                    {formatRelativeTime(ad.createdAt)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Heart className="h-3 w-3" />
                                      <span className="text-xs">{ad.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Eye className="h-3 w-3" />
                                      <span className="text-xs">{ad.views}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <MessageSquare className="h-3 w-3" />
                                      <span className="text-xs">{ad.comments}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nie znaleziono ogłoszeń</h3>
                  <p className="text-muted-foreground mb-4">Spróbuj zmienić kryteria wyszukiwania</p>
                  <Button onClick={handleReset}>Resetuj filtry</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[500px] rounded-lg overflow-hidden mb-6">
              <AdsMap ads={ads} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.slice(0, 4).map((ad) => (
                <Link href={`/ogloszenia/${ad.id}`} key={ad.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={ad.images[0] || "/placeholder.svg"}
                            alt={ad.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-1">{ad.title}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <MapPin className="h-3 w-3" />
                            <span>{ad.location}</span>
                          </div>
                          <div className="font-bold text-primary">
                            {ad.price?.toLocaleString()} {ad.currency}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatRelativeTime(ad.createdAt)}</span>
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {ad.views}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {ads.length > 4 && (
              <div className="text-center mt-4">
                <Button variant="outline">Zobacz więcej ogłoszeń</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Nie znalazłeś tego, czego szukasz?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Dodaj własne ogłoszenie i znajdź kupców na swoje produkty lub usługi. To proste i szybkie!
          </p>
          <Link href="/ogloszenia/dodaj">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Dodaj ogłoszenie
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}

