"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Tag, MapPin, Building } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useClickOutside } from "@/hooks/use-click-outside"

interface SearchSuggestion {
  text: string
  type: string
  category?: string
  subcategory?: string
  categories?: string[]
}

interface SearchAutocompleteProps {
  type: "ads" | "companies"
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export function SearchAutocomplete({
  type,
  placeholder = "Szukaj...",
  className = "",
  onSearch,
}: SearchAutocompleteProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const searchContainerRef = useRef<HTMLDivElement>(null!)

  // Initialize search term from URL
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchTerm(query)
    }
  }, [searchParams])

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(debouncedSearchTerm)}&type=${type}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch suggestions")
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      } catch (error) {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedSearchTerm, type])

  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // If onSearch prop is provided, call it
      if (onSearch) {
        onSearch(searchTerm)
      } else {
        // Otherwise, navigate to search results page
        const baseUrl = type === "ads" ? "/ogloszenia" : "/firmy"
        router.push(`${baseUrl}?q=${encodeURIComponent(searchTerm)}`)
      }
    }
    setShowSuggestions(false)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text)

    let queryParams = `q=${encodeURIComponent(suggestion.text)}`

    // Add category and subcategory for ads
    if (type === "ads" && suggestion.type === "ad" && suggestion.category) {
      queryParams += `&category=${encodeURIComponent(suggestion.category)}`

      if (suggestion.subcategory) {
        queryParams += `&subcategory=${encodeURIComponent(suggestion.subcategory)}`
      }
    }

    // Add category for companies
    if (
      type === "companies" &&
      suggestion.type === "company" &&
      suggestion.categories &&
      suggestion.categories.length > 0
    ) {
      queryParams += `&category=${encodeURIComponent(suggestion.categories[0])}`
    }

    // Handle location for companies
    if (type === "companies" && suggestion.type === "location") {
      queryParams = `location=${encodeURIComponent(suggestion.text)}`
    }

    // Handle category-only search
    if (suggestion.type === "category") {
      queryParams = `category=${encodeURIComponent(suggestion.text)}`
    }

    const baseUrl = type === "ads" ? "/ogloszenia" : "/firmy"

    if (onSearch) {
      onSearch(suggestion.text)
    } else {
      router.push(`${baseUrl}?${queryParams}`)
    }

    setShowSuggestions(false)
  }

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Close suggestions when clicking outside
  useClickOutside(searchContainerRef, () => {
    setShowSuggestions(false)
  })

  return (
    <div className={`relative ${className}`} ref={searchContainerRef}>
      <div className="flex">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => debouncedSearchTerm.length >= 2 && setShowSuggestions(true)}
          className="rounded-r-none"
        />
        <Button onClick={handleSearch} className="rounded-l-none" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.text}-${index}`}
                className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.type === "ad" && <Search className="h-4 w-4 text-muted-foreground" />}
                {suggestion.type === "category" && <Tag className="h-4 w-4 text-primary" />}
                {suggestion.type === "company" && <Building className="h-4 w-4 text-primary" />}
                {suggestion.type === "location" && <MapPin className="h-4 w-4 text-primary" />}

                <div>
                  <div className="font-medium">{suggestion.text}</div>
                  {suggestion.type === "ad" && suggestion.category && (
                    <div className="text-xs text-muted-foreground">
                      {suggestion.category}
                      {suggestion.subcategory && ` › ${suggestion.subcategory}`}
                    </div>
                  )}
                  {suggestion.type === "company" && suggestion.categories && suggestion.categories.length > 0 && (
                    <div className="text-xs text-muted-foreground">{suggestion.categories.join(", ")}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

