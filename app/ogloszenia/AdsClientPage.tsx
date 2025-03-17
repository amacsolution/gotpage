"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { AdFeed } from "@/components/ad-feed"
import { CategoryFilters } from "@/components/category-filters"
import { LocationFilters } from "@/components/location-filters"
import { PriceFilter } from "@/components/price-filter"
import { ActiveFilters } from "@/components/active-filters"
import { SubcategorySelector } from "@/components/subcategory-selector"

// Kategorie i podkategorie
const categories = [
  {
    id: 1,
    name: "Motoryzacja",
    subcategories: ["Samochody osobowe", "Motocykle", "Części", "Przyczepy", "Ciężarowe", "Inne pojazdy"],
  },
  {
    id: 2,
    name: "Nieruchomości",
    subcategories: ["Mieszkania", "Domy", "Działki", "Biura", "Garaże", "Pokoje"],
  },
  {
    id: 3,
    name: "Elektronika",
    subcategories: ["Telefony", "Komputery", "RTV", "Konsole", "Fotografia", "Akcesoria"],
  },
  {
    id: 4,
    name: "Moda",
    subcategories: ["Ubrania", "Buty", "Dodatki", "Biżuteria", "Torebki", "Zegarki"],
  },
  {
    id: 5,
    name: "Usługi",
    subcategories: ["Remonty", "Transport", "Korepetycje", "Sprzątanie", "Ogrodnicze", "Finansowe"],
  },
  {
    id: 6,
    name: "Praca",
    subcategories: ["Biurowa", "Fizyczna", "IT", "Sprzedaż", "Gastronomia", "Zdalna"],
  },
  {
    id: 7,
    name: "Dom i ogród",
    subcategories: ["Meble", "Narzędzia", "Ogród", "Wyposażenie", "Materiały budowlane", "Rośliny"],
  },
  {
    id: 8,
    name: "Sport i hobby",
    subcategories: ["Rowery", "Fitness", "Wędkarstwo", "Turystyka", "Instrumenty", "Kolekcje"],
  },
]

// Lokalizacje
const locations = [
  "Warszawa",
  "Kraków",
  "Wrocław",
  "Poznań",
  "Gdańsk",
  "Łódź",
  "Szczecin",
  "Katowice",
  "Lublin",
  "Białystok",
]

export default function AdsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Sprawdzenie, czy urządzenie jest mobilne
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Inicjalizacja filtrów z parametrów URL
  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setSelectedCategory(category)

      // Znajdź kategorię i rozwiń ją
      const categoryObj = categories.find((c) => c.name === category)
      if (categoryObj) {
        setExpandedCategories([categoryObj.id])
      }
    }

    const subcategory = searchParams.get("subcategory")
    if (subcategory) {
      setSelectedSubcategories([subcategory])
    }

    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
    }

    const location = searchParams.get("location")
    if (location) {
      setSelectedLocations([location])
    }

    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    if (minPrice && maxPrice) {
      setPriceRange([Number.parseInt(minPrice), Number.parseInt(maxPrice)])
    }
  }, [searchParams])

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleSubcategory = (subcategory: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory) ? prev.filter((s) => s !== subcategory) : [...prev, subcategory],
    )
  }

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubcategories([])

    // Jeśli wybrano kategorię, rozwiń ją
    if (category) {
      const categoryObj = categories.find((c) => c.name === category)
      if (categoryObj) {
        setExpandedCategories([categoryObj.id])
      }
    }
  }

  const handleSubcategorySelect = (subcategory: string) => {
    if (subcategory === "") {
      setSelectedSubcategories([])
    } else {
      if (selectedSubcategories.includes(subcategory)) {
        setSelectedSubcategories((prev) => prev.filter((s) => s !== subcategory))
      } else {
        setSelectedSubcategories([subcategory])
      }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Budowanie parametrów URL
    const params = new URLSearchParams()

    if (searchQuery) {
      params.set("q", searchQuery)
    }

    if (selectedCategory) {
      params.set("category", selectedCategory)
    }

    if (selectedSubcategories.length > 0) {
      params.set("subcategory", selectedSubcategories.join(","))
    }

    if (selectedLocations.length > 0) {
      params.set("location", selectedLocations.join(","))
    }

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }

    if (priceRange[1] < 10000) {
      params.set("maxPrice", priceRange[1].toString())
    }

    // Przekierowanie z nowymi parametrami
    router.push(`/ogloszenia?${params.toString()}`)

    // Zamknij filtry na mobilnych po wyszukiwaniu
    if (isMobile) {
      setShowFilters(false)
    }
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedSubcategories([])
    setSelectedLocations([])
    setPriceRange([0, 10000])
    setExpandedCategories([])

    // Przekierowanie bez parametrów
    router.push("/ogloszenia")
  }

  // Znajdź podkategorie dla wybranej kategorii
  const subcategoriesForSelectedCategory = selectedCategory
    ? categories.find((c) => c.name === selectedCategory)?.subcategories || []
    : []

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
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filtry
            </Button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filtry - na desktop zawsze widoczne, na mobile jako popup */}
          <div
            className={`
            ${isMobile ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : "w-64"} 
            ${isMobile && !showFilters ? "hidden" : "block"}
          `}
          >
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Filtry</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {/* Kategorie */}
              <CategoryFilters
                categories={categories}
                selectedCategory={selectedCategory}
                selectedSubcategories={selectedSubcategories}
                expandedCategories={expandedCategories}
                onCategoryChange={handleCategoryChange}
                onSubcategoryToggle={toggleSubcategory}
                onCategoryExpansion={toggleCategoryExpansion}
              />

              {/* Lokalizacja */}
              <LocationFilters
                locations={locations}
                selectedLocations={selectedLocations}
                onLocationToggle={toggleLocation}
              />

              {/* Cena */}
              <PriceFilter priceRange={priceRange} onPriceChange={setPriceRange} />

              {/* Przyciski akcji */}
              <div className="space-y-2">
                <Button className="w-full" onClick={handleSearch}>
                  Zastosuj filtry
                </Button>
                <Button variant="outline" className="w-full" onClick={handleReset}>
                  Resetuj filtry
                </Button>
              </div>
            </div>
          </div>

          {/* Lista ogłoszeń */}
          <div className="flex-1">
            {/* Wyświetlanie wybranych filtrów */}
            <ActiveFilters
              selectedCategory={selectedCategory}
              selectedSubcategories={selectedSubcategories}
              selectedLocations={selectedLocations}
              priceRange={priceRange}
              onCategoryRemove={() => setSelectedCategory("")}
              onSubcategoryRemove={toggleSubcategory}
              onLocationRemove={toggleLocation}
              onPriceReset={() => setPriceRange([0, 10000])}
              onResetAll={handleReset}
            />

            {/* Jeśli wybrana kategoria, pokaż podkategorie jako listę rozwijaną */}
            <SubcategorySelector
              category={selectedCategory}
              subcategories={subcategoriesForSelectedCategory}
              selectedSubcategories={selectedSubcategories}
              onSubcategorySelect={handleSubcategorySelect}
            />

            <AdFeed />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

