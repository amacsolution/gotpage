"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Building, Loader2 } from "lucide-react"
import { CompanyCard } from "@/components/company-card"

interface CompanyFeedProps {
  category?: string
  location?: string
  searchQuery?: string
  sortBy?: string
}

export function CompanyFeed({ category, location, searchQuery, sortBy = "rating" }: CompanyFeedProps) {
  const [companies, setCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // Reset state when filters change
    setCompanies([])
    setPage(1)
    setHasMore(true)
    setIsLoading(true)
    fetchCompanies(1, sortBy)
  }, [category, location, searchQuery, sortBy])

  const fetchCompanies = async (pageNum: number, sort: string) => {
    try {
      setIsLoading(true)

      // Build query URL
      const params = new URLSearchParams()
      params.append("page", pageNum.toString())
      params.append("limit", "12")
      params.append("sortBy", sort)

      if (category) params.append("category", category)
      if (location) params.append("location", location)
      if (searchQuery) params.append("q", searchQuery)

      const response = await fetch(`/api/companies?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać firm")
      }

      const data = await response.json()

      // Format companies to match CompanyCard props
      const formattedCompanies = data.companies.map((company: any) => ({
        id: company.id,
        name: company.name,
        logo: company.avatar || "/placeholder.svg?height=64&width=64&text=LOGO",
        description: company.bio || "",
        categories: company.categories || [],
        location: company.location || "Polska",
        rating: company.rating || 0,
        reviewCount: company.reviewCount || 0,
        verified: company.verified || false,
      }))

      if (pageNum === 1) {
        setCompanies(formattedCompanies)
      } else {
        setCompanies((prev) => [...prev, ...formattedCompanies])
      }

      setTotalCompanies(data.total)
      setHasMore(pageNum < data.totalPages)
    } catch (error) {
      console.error("Błąd podczas pobierania firm:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać firm. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCompanies(nextPage, sortBy)
  }

  // Skeleton loading for companies
  if (isLoading && companies.length === 0) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // No companies found
  if (companies.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Brak firm</h3>
        <p className="text-muted-foreground">Nie znaleziono firm spełniających podane kryteria.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Company count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Znaleziono {totalCompanies} {totalCompanies === 1 ? "firmę" : totalCompanies < 5 ? "firmy" : "firm"}
        </p>
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
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
              "Załaduj więcej firm"
            )}
          </Button>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && companies.length > 0 && (
        <div className="text-center text-muted-foreground mt-8 py-2 border-t">
          Wyświetlono wszystkie firmy ({totalCompanies})
        </div>
      )}
    </div>
  )
}

