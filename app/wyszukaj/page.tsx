import { Suspense } from "react"
import type { Metadata } from "next"
import { SearchResults } from "./search-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Wyniki wyszukiwania | Gotpage",
  description: "Wyniki wyszukiwania w serwisie Gotpage",
}

export default async function SearchPage(
  props: {
    searchParams: Promise<{ q?: string; tab?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || ""
  const activeTab = searchParams.tab || "all"

  return (
    <PageLayout>
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">
        Wyniki wyszukiwania dla: <span className="text-primary">"{query}"</span>
      </h1>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all" asChild>
            <a href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=all`}>Wszystko</a>
          </TabsTrigger>
          <TabsTrigger value="ads" asChild>
            <a href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=ads`}>Ogłoszenia</a>
          </TabsTrigger>
          <TabsTrigger value="users" asChild>
            <a href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=users`}>Użytkownicy</a>
          </TabsTrigger>
          <TabsTrigger value="companies" asChild>
            <a href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=companies`}>Firmy</a>
          </TabsTrigger>
          <TabsTrigger value="news" asChild>
            <a href={`/wyszukaj?q=${encodeURIComponent(query)}&tab=news`}>Aktualności</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults query={query} type={activeTab as "all" | "ads" | "users" | "companies" | "news"} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
    </PageLayout>
  )
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
