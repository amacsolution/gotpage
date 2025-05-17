"use client"

import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar, MapPin, AlertCircle, Filter, Tag } from "lucide-react"
import { AdCard } from "@/components/ad-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CompanyCard } from "@/components/company-card"

interface SearchResultsProps {
  query: string
  type: "all" | "ads" | "users" | "companies" | "news"
}

interface NewsItem {
  id: number
  content: string
  image: string | null
  created_at: string
  user_id: string
  author_name: string
}

interface CompanyItem {
  id: string
  name: string
  avatar: string
  bio: string
  location: string
  categories: string
  type: string
}

interface UserItem {
  id: string
  name: string
  avatar: string
  bio: string
  location: string | null
  type: string
}

interface Category {
  category: string
  count: number
}

interface Subcategory {
  subcategory: string
  category: string
  count: number
}

interface SearchData {
  ads: any[]
  users: UserItem[]
  companies: CompanyItem[]
  news: NewsItem[]
  categories?: Category[]
  subcategories?: Subcategory[]
}

export function SearchResults({ query, type }: SearchResultsProps) {
  const [data, setData] = useState<SearchData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch search results
  useEffect(() => {
    const fetchData = async () => {
      if (!query || query.length < 2) {
        setIsLoading(false)
        return
      }

      try {
        // Poprawne kodowanie parametrów URL
        const encodedQuery = encodeURIComponent(query)
        const apiUrl = `/api/search/results?q=${encodedQuery}&type=${type}`

        console.log("Fetching from URL:", apiUrl)

        const response = await fetch(apiUrl, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error fetching search results: ${response.status}`)
        }

        const apiData = await response.json()
        console.log("Search API response:", apiData)
        setData(apiData)
      } catch (err) {
        console.error("Error in SearchResults:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [query, type])

  // Handle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Handle subcategory selection
  const toggleSubcategory = (subcategory: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory) ? prev.filter((s) => s !== subcategory) : [...prev, subcategory],
    )
  }

  // Filter ads based on selected categories and subcategories
  const filteredAds = data?.ads?.filter((ad) => {
    if (selectedCategories.length === 0 && selectedSubcategories.length === 0) {
      return true
    }

    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(ad.category)
    const subcategoryMatch = selectedSubcategories.length === 0 || selectedSubcategories.includes(ad.subcategory)

    return categoryMatch && subcategoryMatch
  })

  if (!query || query.length < 2) {
    return <div className="text-center py-8">Wprowadź co najmniej 2 znaki, aby wyszukać.</div>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie później.
          {process.env.NODE_ENV === "development" && <div className="mt-2 text-xs">{error.message}</div>}
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-2">Brak wyników dla "{query}"</p>
        <p className="text-muted-foreground">Spróbuj użyć innych słów kluczowych lub sprawdź pisownię.</p>
      </div>
    )
  }

  const noResults =
    (!data.ads || data.ads.length === 0) &&
    (!data.users || data.users.length === 0) &&
    (!data.companies || data.companies.length === 0) &&
    (!data.news || data.news.length === 0)

  if (noResults) {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-2">Brak wyników dla "{query}"</p>
        <p className="text-muted-foreground">Spróbuj użyć innych słów kluczowych lub sprawdź pisownię.</p>
      </div>
    )
  }

  const encodedQuery = encodeURIComponent(query)

  return (
    <div className="space-y-8">
      {/* Categories and Subcategories */}
      {(type === "all" || type === "ads") && data.categories && data.categories.length > 0 && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Kategorie i podkategorie
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Ukryj filtry" : "Pokaż filtry"}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-medium mb-2">Kategorie</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {data.categories.map((category) => (
                    <div key={category.category} className="flex items-center">
                      <Checkbox
                        id={`category-${category.category}`}
                        checked={selectedCategories.includes(category.category)}
                        onCheckedChange={() => toggleCategory(category.category)}
                      />
                      <label
                        htmlFor={`category-${category.category}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                      >
                        {category.category}
                      </label>
                      <Badge variant="outline" className="ml-auto">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {data.subcategories && data.subcategories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Podkategorie</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {data.subcategories.map((subcategory) => (
                      <div key={subcategory.subcategory} className="flex items-center">
                        <Checkbox
                          id={`subcategory-${subcategory.subcategory}`}
                          checked={selectedSubcategories.includes(subcategory.subcategory)}
                          onCheckedChange={() => toggleSubcategory(subcategory.subcategory)}
                        />
                        <label
                          htmlFor={`subcategory-${subcategory.subcategory}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                        >
                          {subcategory.subcategory}
                          <span className="text-xs text-muted-foreground ml-1">({subcategory.category})</span>
                        </label>
                        <Badge variant="outline" className="ml-auto">
                          {subcategory.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!showFilters && (
            <div className="flex flex-wrap gap-2">
              {data.categories.slice(0, 10).map((category) => (
                <Badge
                  key={category.category}
                  variant={selectedCategories.includes(category.category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category.category)}
                >
                  {category.category} ({category.count})
                </Badge>
              ))}
              {data.categories.length > 10 && (
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(true)}>
                  +{data.categories.length - 10} więcej
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ads section */}
      {(type === "all" || type === "ads") && filteredAds && filteredAds.length > 0 && (
        <div>
          {type === "all" && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ogłoszenia</h2>
              <Link href={`/wyszukaj?q=${encodedQuery}&tab=ads`} className="text-sm text-primary">
                Zobacz wszystkie
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </div>
      )}

      {/* Users section */}
      {(type === "all" || type === "users") && data.users && data.users.length > 0 && (
        <div>
          {type === "all" && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Użytkownicy</h2>
              <Link href={`/wyszukaj?q=${encodedQuery}&tab=users`} className="text-sm text-primary">
                Zobacz wszystkich
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.users.map((user) => (
              <Link
                href={`/profil/${user.id}`}
                key={user.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar || ""} alt={user.name} />
                  <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  {user.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.location}
                    </div>
                  )}
                  {user.bio && <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Companies section */}
      {(type === "all" || type === "companies") && data.companies && data.companies.length > 0 && (
        <div>
          {type === "all" && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Firmy</h2>
              <Link href={`/wyszukaj?q=${encodedQuery}&tab=companies`} className="text-sm text-primary">
                Zobacz wszystkie
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.companies.map((company) => (
              <><Link
                href={`/profil/${company.id}`}
                key={company.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={company.avatar || ""} alt={company.name} />
                  <AvatarFallback>{company.name?.substring(0, 2).toUpperCase() || "CO"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{company.name}</h3>
                  {company.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {company.location}
                    </div>
                  )}
                  {company.bio && <p className="text-sm text-muted-foreground line-clamp-1">{company.bio}</p>}
                  {company.categories && company.categories !== "[]" && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(() => {
                        try {
                          const parsedCategories = JSON.parse(company.categories)
                          return Array.isArray(parsedCategories)
                            ? parsedCategories.map((category: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                              >
                                {category}
                              </span>
                            ))
                            : null
                        } catch (e) {
                          console.error("Error parsing categories:", e)
                          return null
                        }
                      })()}
                    </div>
                  )}
                </div>
              </Link>
                {/* //   href={`/profil/${company.id}`}
                //   key={company.id}
                //   className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors"
                // >
                //   <Avatar className="h-12 w-12">
                //     <AvatarImage src={company.avatar || ""} alt={company.name} />
                //     <AvatarFallback>{company.name?.substring(0, 2).toUpperCase() || "CO"}</AvatarFallback>
                //   </Avatar>
                //   <div>
                //     <h3 className="font-medium">{company.name}</h3>
                //     {company.location && (
                //       <div className="flex items-center text-sm text-muted-foreground">
                //         <MapPin className="h-3 w-3 mr-1" />
                //         {company.location}
                //       </div>
                //     )}
                //     {company.bio && <p className="text-sm text-muted-foreground line-clamp-1">{company.bio}</p>}
                //     {company.categories && company.categories !== "[]" && (
                //       <div className="flex flex-wrap gap-1 mt-1">
                //         {(() => {
                //           try {
                //             const parsedCategories = JSON.parse(company.categories)
                //             return Array.isArray(parsedCategories)
                //               ? parsedCategories.map((category: string, index: number) => (
                //                   <span
                //                     key={index}
                //                     className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                //                   >
                //                     {category}
                //                   </span>
                //                 ))
                //               : null
                //           } catch (e) {
                //             console.error("Error parsing categories:", e)
                //             return null
                //           }
                //         })()}
                //       </div>
                //     )}
                //   </div>
                // </Link> */}
                <CompanyCard key={company.id} company={company} /></>
            ))}
          </div>
        </div>
      )}

      {/* News section */}
      {(type === "all" || type === "news") && data.news && data.news.length > 0 && (
        <div>
          {type === "all" && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Aktualności</h2>
              <Link href={`/wyszukaj?q=${encodedQuery}&tab=news`} className="text-sm text-primary">
                Zobacz wszystkie
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.news.map((post) => (
              <Link
                href={`/aktualnosci/post/${post.id}`}
                key={post.id}
                className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.image && (
                  <div className="relative h-40 w-full">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.content?.substring(0, 50) || "Aktualność"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2">{post.content?.substring(0, 100) || "Aktualność"}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(post.created_at).toLocaleDateString("pl-PL")}
                    {post.author_name && (
                      <>
                        <span className="mx-1">•</span>
                        <User className="h-3 w-3 mr-1" />
                        {post.author_name}
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
