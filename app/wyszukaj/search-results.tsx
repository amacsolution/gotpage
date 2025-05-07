import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageLayout } from "@/components/page-layout"

interface SearchResultsProps {
  query: string
  type: "all" | "ads" | "users" | "companies" | "news"
}

export async function SearchResults({ query, type }: SearchResultsProps) {
  if (!query || query.length < 2) {
    return <div className="text-center py-8">Wprowadź co najmniej 2 znaki, aby wyszukać.</div>
  }

  try {
    // Używamy globalnego API zamiast results, ponieważ results zwraca 404
    const response = await fetch(`/api/search/results?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    })

    console.log("Search API response:", response)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Search API error:", errorData)

      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Wystąpił błąd podczas wyszukiwania (Status: {response.status}). Spróbuj ponownie później.
          </AlertDescription>
        </Alert>
      )
    }

    const data = await response.json()
    console.log("Search results data:", data)

    // Sprawdź, czy dane są poprawne
    if (!data || !data.results || !Array.isArray(data.results)) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Otrzymano nieprawidłowe dane z serwera. Spróbuj ponownie później.</AlertDescription>
        </Alert>
      )
    }

    // Przekształć wyniki z globalnego API na format, którego oczekuje nasz komponent
    const results = data.results || []

    // Filtruj wyniki według typu
    const filteredResults =
      type === "all"
        ? results
        : results.filter((item: any) => {
            if (type === "ads" && item.type === "ad") return true
            if (type === "users" && item.type === "user") return true
            if (type === "companies" && item.type === "company") return true
            if (type === "news" && item.type === "news") return true
            return false
          })

    if (filteredResults.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-lg mb-2">Brak wyników dla "{query}"</p>
          <p className="text-muted-foreground">Spróbuj użyć innych słów kluczowych lub sprawdź pisownię.</p>
        </div>
      )
    }

    // Grupuj wyniki według typu
    const groupedResults = {
      ads: filteredResults.filter((item: any) => item.type === "ad"),
      users: filteredResults.filter((item: any) => item.type === "user"),
      companies: filteredResults.filter((item: any) => item.type === "company"),
      news: filteredResults.filter((item: any) => item.type === "news"),
    }

    return (
      <div className="space-y-8">
        {/* Ads section */}
        {(type === "all" || type === "ads") && groupedResults.ads.length > 0 && (
          <div>
            {type === "all" && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ogłoszenia</h2>
                <Link href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=ads`} className="text-sm text-primary">
                  Zobacz wszystkie
                </Link>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedResults.ads.map((item: any) => (
                <Link
                  href={item.url}
                  key={item.id}
                  className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {item.image && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium">{item.title}</h3>
                    {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Users section */}
        {(type === "all" || type === "users") && groupedResults.users.length > 0 && (
          <div>
            {type === "all" && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Użytkownicy</h2>
                <Link href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=users`} className="text-sm text-primary">
                  Zobacz wszystkich
                </Link>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedResults.users.map((item: any) => (
                <Link
                  href={item.url}
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.image || ""} alt={item.title} />
                    <AvatarFallback>{item.title?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Companies section */}
        {(type === "all" || type === "companies") && groupedResults.companies.length > 0 && (
          <div>
            {type === "all" && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Firmy</h2>
                <Link href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=companies`} className="text-sm text-primary">
                  Zobacz wszystkie
                </Link>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedResults.companies.map((item: any) => (
                <Link
                  href={item.url}
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.image || ""} alt={item.title} />
                    <AvatarFallback>{item.title?.substring(0, 2).toUpperCase() || "CO"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* News section */}
        {(type === "all" || type === "news") && groupedResults.news.length > 0 && (
          <div>
            {type === "all" && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Aktualności</h2>
                <Link href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=news`} className="text-sm text-primary">
                  Zobacz wszystkie
                </Link>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedResults.news.map((item: any) => (
                <Link
                  href={item.url}
                  key={item.id}
                  className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2">{item.title}</h3>
                    {item.subtitle && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in search results component:", error)

    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Wystąpił nieoczekiwany błąd podczas wyszukiwania. Spróbuj ponownie później.</AlertDescription>
      </Alert>
    )
  }
}
