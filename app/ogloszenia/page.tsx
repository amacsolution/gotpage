"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { AdFeed } from "@/components/ad-feed"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Filter } from "lucide-react"

export default function AdsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  // Get search parameters from URL
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const subcategory = searchParams.get("subcategory") || ""
  const location = searchParams.get("location") || ""
  const sortBy = searchParams.get("sortBy") || "newest"

  // Fetch categories, subcategories, and locations for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoading(true)
      try {
        // Fetch categories
        const catResponse = await fetch("/api/categories")
        if (catResponse.ok) {
          const catData = await catResponse.json()
          setCategories(catData.categories || [])
        }

        // Fetch subcategories if category is selected
        if (category) {
          const subResponse = await fetch(`/api/subcategories?category=${encodeURIComponent(category)}`)
          if (subResponse.ok) {
            const subData = await subResponse.json()
            setSubcategories(subData.subcategories || [])
          }
        } else {
          setSubcategories([])
        }

        // Fetch locations
        const locResponse = await fetch("/api/locations")
        if (locResponse.ok) {
          const locData = await locResponse.json()
          setLocations(locData.locations || [])
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilterOptions()
  }, [category])

  // Handle search
  const handleSearch = (searchQuery: string) => {
    // Update URL with search parameters
    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    // Keep other parameters
    router.push(`/ogloszenia?${params.toString()}`)
  }

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(type, value)
    } else {
      params.delete(type)
    }

    // Reset subcategory when category changes
    if (type === "category") {
      params.delete("subcategory")
    }

    router.push(`/ogloszenia?${params.toString()}`)
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Ogłoszenia</h1>

          {/* Search with autocomplete */}
          <div className="mb-6">
            <SearchAutocomplete
              type="ads"
              placeholder="Szukaj ogłoszeń..."
              onSearch={handleSearch}
              className="max-w-2xl"
            />
          </div>

          {/* Filters */}
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtry
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

          {/* Expanded filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
              {/* Category filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Kategoria</label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={category} onValueChange={(value) => handleFilterChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wszystkie kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie kategorie</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Subcategory filter - only show if category is selected */}
              {category && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Podkategoria</label>
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={subcategory} onValueChange={(value) => handleFilterChange("subcategory", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie podkategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Wszystkie podkategorie</SelectItem>
                        {subcategories.map((subcat) => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Location filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">Lokalizacja</label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={location} onValueChange={(value) => handleFilterChange("location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cała Polska" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cała Polska</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ad feed with all the filters applied */}
        <AdFeed category={category} subcategory={subcategory} location={location} searchQuery={query} />
      </div>
    </PageLayout>
  )
}

