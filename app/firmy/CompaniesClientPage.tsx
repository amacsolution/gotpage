"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/legacy/image"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Star, Building, Filter, X } from "lucide-react"

// Mock data dla firm
const mockCompanies = [
  {
    id: 1,
    name: "Auto Serwis Kowalski",
    logo: "/placeholder.svg?height=100&width=100&text=Auto+Serwis",
    description:
      "Profesjonalny serwis samochodowy z wieloletnim doświadczeniem. Oferujemy naprawy mechaniczne, elektryczne, diagnostykę komputerową oraz wymianę opon.",
    categories: ["Motoryzacja", "Usługi"],
    location: "Warszawa, Mazowieckie",
    distance: 2.5,
    rating: 4.8,
    reviewCount: 124,
    verified: true,
    phone: "+48 123 456 789",
    website: "https://example.com",
  },
  {
    id: 2,
    name: "Nieruchomości XYZ",
    logo: "/placeholder.svg?height=100&width=100&text=XYZ",
    description:
      "Biuro nieruchomości specjalizujące się w sprzedaży i wynajmie mieszkań, domów oraz lokali użytkowych. Działamy na rynku od 15 lat.",
    categories: ["Nieruchomości"],
    location: "Kraków, Małopolskie",
    distance: 5.1,
    rating: 4.5,
    reviewCount: 87,
    verified: true,
    phone: "+48 987 654 321",
    website: "https://example.com",
  },
  {
    id: 3,
    name: "Usługi Remontowe Nowak",
    logo: "/placeholder.svg?height=100&width=100&text=Remonty",
    description:
      "Kompleksowe usługi remontowo-budowlane. Remonty mieszkań, domów, biur. Wykończenia wnętrz, malowanie, gładzie, płytki, panele.",
    categories: ["Usługi", "Dom i ogród"],
    location: "Wrocław, Dolnośląskie",
    distance: 8.3,
    rating: 4.2,
    reviewCount: 56,
    verified: false,
    phone: "+48 111 222 333",
    website: "https://example.com",
  },
  {
    id: 4,
    name: "IT Solutions Sp. z o.o.",
    logo: "/placeholder.svg?height=100&width=100&text=IT",
    description:
      "Firma informatyczna oferująca usługi programistyczne, tworzenie stron internetowych, aplikacji mobilnych oraz wsparcie IT dla firm.",
    categories: ["Usługi", "Elektronika"],
    location: "Poznań, Wielkopolskie",
    distance: 12.7,
    rating: 4.9,
    reviewCount: 93,
    verified: true,
    phone: "+48 222 333 444",
    website: "https://example.com",
  },
  {
    id: 5,
    name: "Salon Fryzjerski Elegancja",
    logo: "/placeholder.svg?height=100&width=100&text=Fryzjer",
    description:
      "Profesjonalny salon fryzjerski oferujący strzyżenie, koloryzację, stylizację oraz zabiegi pielęgnacyjne dla włosów.",
    categories: ["Usługi", "Moda"],
    location: "Gdańsk, Pomorskie",
    distance: 15.2,
    rating: 4.7,
    reviewCount: 142,
    verified: true,
    phone: "+48 333 444 555",
    website: "https://example.com",
  },
  {
    id: 6,
    name: "Restauracja Smacznego",
    logo: "/placeholder.svg?height=100&width=100&text=Restauracja",
    description:
      "Restauracja serwująca dania kuchni polskiej i międzynarodowej. Organizujemy również imprezy okolicznościowe, catering.",
    categories: ["Usługi", "Gastronomia"],
    location: "Łódź, Łódzkie",
    distance: 18.9,
    rating: 4.6,
    reviewCount: 215,
    verified: true,
    phone: "+48 444 555 666",
    website: "https://example.com",
  },
]

// Kategorie
const categories = [
"Sklep Stacjonarny",
  "Sklep Internetowy",
  "Market",
  "Hurtownia",
  "Usługi",
  "Atrakcje/rozrywka",
  "Transport/Spedycja",
  "Dyskoteka/Klub",
  "Sanatorium",
  "Piekarnia",
  "Ośrodek zdrowia",
  "Kino/Teatr",
  "Miejscowość",
  "Portal/Strona Internetowa",
  "Miejsce/Obiekt",
  "Restauracja/Bar/Kawiarnia",
  "Blog",
  "Gry",
  "Turystyka/Rekreacja",
  "Edukacja i szkolnictwo",
  "Galeria",
  "Finanse Ubezpieczenia",
  "Bank",
  "Uroda/Zdrowie/Relax",
  "Nieruchomości",
  "Reklama i Biznes",
  "Poligrafia i Wydawnictwo",
  "Komis/Salon/Giełda",
  "Baza Noclegowa",
  "Kasyno",
  "Fundacja",
  "Telefonia/Internet",
  "Fanclub",
  "Organizacja",
  "Instytucja/Urząd",
  "Znana Osoba",
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

export default function CompaniesClientPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie kategorie")
  const [selectedLocation, setSelectedLocation] = useState("Wszystkie lokalizacje")
  const [maxDistance, setMaxDistance] = useState(20)
  const [showFilters, setShowFilters] = useState(false)
  const [companies, setCompanies] = useState(mockCompanies)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Filtrowanie firm na podstawie kryteriów
    let filteredCompanies = mockCompanies

    if (searchQuery) {
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "Wszystkie kategorie") {
      filteredCompanies = filteredCompanies.filter((company) => company.categories.includes(selectedCategory))
    }

    if (selectedLocation !== "Wszystkie lokalizacje") {
      filteredCompanies = filteredCompanies.filter((company) => company.location === selectedLocation)
    }

    filteredCompanies = filteredCompanies.filter((company) => company.distance <= maxDistance)

    setCompanies(filteredCompanies)
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedCategory("Wszystkie kategorie")
    setSelectedLocation("Wszystkie lokalizacje")
    setMaxDistance(20)
    setCompanies(mockCompanies)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Katalog firm</h1>
            <p className="text-muted-foreground">
              Przeglądaj firmy lub użyj wyszukiwarki, aby znaleźć to, czego szukasz
            </p>
          </div>

          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Szukaj firm..."
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
            </form>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 border rounded-lg">
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
                        <SelectItem key={category} value={category} onClick={() => setSelectedCategory}>
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
                        <SelectItem key={location} value={location} onClick={() => setSelectedLocation}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="flex justify-between mt-2 text-sm text-muted-foreground">Maksymalna odległość: {maxDistance} km</label>
                  <Input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 km</span>
                    <span>50 km</span>
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

          <div className="grid grid-cols-1 gap-6">
            {companies.length > 0 ? (
              companies.map((company) => (
                <Link href={`/firmy/${company.id}`} key={company.id}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={company.logo || "/placeholder.svg"}
                              alt={company.name}
                              className="object-fill"
                            />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold">{company.name}</h2>
                            {company.verified && (
                              <Badge variant="outline" className="text-primary border-primary/30">
                                Zweryfikowana
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 font-medium">{company.rating}</span>
                              <span className="text-muted-foreground text-sm ml-1">({company.reviewCount} opinii)</span>
                            </div>
                            <div className="flex items-center text-muted-foreground text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              {company.location} ({company.distance} km)
                            </div>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 mb-2">{company.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {company.categories.map((category) => (
                              <Badge key={category} variant="secondary">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-2 justify-center">
                          <Button variant="outline" className="w-full md:w-auto">
                            Zobacz profil
                          </Button>
                          <Button variant="ghost" className="w-full md:w-auto">
                            {company.phone}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nie znaleziono firm</h3>
                <p className="text-muted-foreground mb-4">Spróbuj zmienić kryteria wyszukiwania</p>
                <Button onClick={handleReset}>Resetuj filtry</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Gotpage Logo" width={24} height={24} className="h-6 w-auto" />
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gotpage. Wszelkie prawa zastrzeżone.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/regulamin" className="text-sm text-muted-foreground hover:underline">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="text-sm text-muted-foreground hover:underline">
              Polityka prywatności
            </Link>
            <Link href="/kontakt" className="text-sm text-muted-foreground hover:underline">
              Kontakt
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}

