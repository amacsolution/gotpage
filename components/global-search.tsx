"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Building, User, FileText } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useClickOutside } from "@/hooks/use-click-outside"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SearchResult {
  id: string | number
  type: "ad" | "user" | "company" | "news"
  title: string
  subtitle?: string
  image?: string
  url: string
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
        const response = await fetch(`/api/search/global?q=${encodeURIComponent(debouncedSearchTerm)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch results")
        }

        const data = await response.json()
        setResults(data.results || [])
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
                  <div>
                    <div className="font-medium">{result.title}</div>
                    {result.subtitle && <div className="text-xs text-muted-foreground">{result.subtitle}</div>}
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
