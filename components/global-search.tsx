"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Building, User, FileText, Tag, Layers } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useClickOutside } from "@/hooks/use-click-outside"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  id: string | number
  type: "ad" | "user" | "company" | "news"
  title: string
  subtitle?: string
  image?: string
  url: string
  category?: string
  subcategory?: string
}

interface ApiResponse {
  ads: any[]
  users: any[]
  companies: any[]
  news: any[]
}

export function GlobalSearch({ className = "" }: { className?: string }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch results when search term changes
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        // Use the results API instead of global
        const response = await fetch(`/api/search/results?q=${encodeURIComponent(debouncedSearchTerm)}&type=all`)

        if (!response.ok) {
          throw new Error("Failed to fetch results")
        }

        const data: ApiResponse = await response.json()

        // Transform the data to the format expected by the component
        const transformedResults: SearchResult[] = []

        // Add ads
        if (data.ads && data.ads.length > 0) {
          transformedResults.push(
            ...data.ads.map((ad) => ({
              id: ad.id,
              type: "ad" as const,
              title: ad.title,
              subtitle: `${ad.price ? `${ad.price} zł • ` : ""}${ad.location || ""}`,
              image: ad.image_url || ad.image,
              url: `/ogloszenia/${ad.id}`,
              category: ad.category,
              subcategory: ad.subcategory,
            })),
          )
        }

        // Add users
        if (data.users && data.users.length > 0) {
          transformedResults.push(
            ...data.users.map((user) => ({
              id: user.id,
              type: "user" as const,
              title: user.name,
              subtitle: user.location || "",
              image: user.avatar,
              url: `/profil/${user.id}`,
            })),
          )
        }

        // Add companies
        if (data.companies && data.companies.length > 0) {
          transformedResults.push(
            ...data.companies.map((company) => ({
              id: company.id,
              type: "company" as const,
              title: company.name,
              subtitle: company.location || "",
              image: company.avatar,
              url: `/profil/${company.id}`,
            })),
          )
        }

        // Add news
        if (data.news && data.news.length > 0) {
          transformedResults.push(
            ...data.news.map((news) => ({
              id: news.id,
              type: "news" as const,
              title: news.content.substring(0, 50) + (news.content.length > 50 ? "..." : ""),
              subtitle: `Opublikowano: ${new Date(news.created_at).toLocaleDateString("pl-PL")}`,
              image: news.image,
              url: `/aktualnosci/post/${news.id}`,
            })),
          )
        }

        setResults(transformedResults)
        setShowResults(true)
      } catch (error) {
        console.error("Error fetching results:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedSearchTerm])

  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/wyszukaj?q=${encodeURIComponent(searchTerm)}`)
    }
    setShowResults(false)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setShowResults(false)
    setSearchTerm("")
  }

  // Handle category click
  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation() // Prevent triggering the parent click event
    router.push(`/wyszukaj?q=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`)
    setShowResults(false)
  }

  // Handle subcategory click
  const handleSubcategoryClick = (e: React.MouseEvent, category: string, subcategory: string) => {
    e.stopPropagation() // Prevent triggering the parent click event
    router.push(
      `/wyszukaj?q=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(
        category,
      )}&subcategory=${encodeURIComponent(subcategory)}`,
    )
    setShowResults(false)
  }

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Close results when clicking outside
  useClickOutside(searchContainerRef, () => {
    setShowResults(false)
  })

  // Get icon based on result type
  const getIcon = (type: string) => {
    switch (type) {
      case "ad":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "user":
        return <User className="h-4 w-4 text-green-500" />
      case "company":
        return <Building className="h-4 w-4 text-purple-500" />
      case "news":
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  return (
    <div className={`relative ${className}`} ref={searchContainerRef}>
      <div className="flex">
        <Input
          type="text"
          placeholder="Szukaj w całym serwisie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => debouncedSearchTerm.length >= 2 && setShowResults(true)}
          className="rounded-r-none w-full max-w-[300px]"
        />
        <Button onClick={handleSearch} className="rounded-l-none" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[400px] overflow-y-auto">
          <ul className="py-1">
            {results.map((result) => (
              <li
                key={`${result.type}-${result.id}`}
                className="px-4 py-2 hover:bg-muted cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center gap-3">
                  {result.type === "user" || result.type === "company" ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={result.image || ""} alt={result.title} />
                      <AvatarFallback>{result.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    getIcon(result.type)
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.subtitle && <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>}

                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-primary">
                        {result.type === "ad"
                          ? "Ogłoszenie"
                          : result.type === "user"
                            ? "Użytkownik"
                            : result.type === "company"
                              ? "Firma"
                              : "Aktualność"}
                      </div>
                    </div>

                    {/* Separate category and subcategory badges */}
                    {result.type === "ad" && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.category && (
                          <Badge
                            variant="outline"
                            className="text-xs py-0 h-5 px-1.5 flex items-center gap-1 cursor-pointer hover:bg-primary/10"
                            onClick={(e) => handleCategoryClick(e, result.category!)}
                          >
                            <Tag className="h-3 w-3" />
                            {result.category}
                          </Badge>
                        )}

                        {result.subcategory && (
                          <Badge
                            variant="outline"
                            className="text-xs py-0 h-5 px-1.5 flex items-center gap-1 cursor-pointer hover:bg-primary/10"
                            onClick={(e) => handleSubcategoryClick(e, result.category!, result.subcategory!)}
                          >
                            <Layers className="h-3 w-3" />
                            {result.subcategory}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {showResults && debouncedSearchTerm.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center">
          Brak wyników dla "{debouncedSearchTerm}"
        </div>
      )}
    </div>
  )
}
