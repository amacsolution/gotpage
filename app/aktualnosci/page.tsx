"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { NewsPost } from "@/components/news-post"
import { NewsPostForm } from "@/components/news-post-form"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"
import { ArrowRight, Loader2 } from "lucide-react"
import Script from "next/script"
import Link from "next/link"
import { CompanyCard } from "@/components/company-card"

const featuredCompanies = [
    {
      id: 1,
      name: "Auto Serwis Kowalski",
      logo: "/placeholder.svg?height=100&width=100&text=Auto+Serwis",
      description:
        "Profesjonalny serwis samochodowy z wieloletnim doświadczeniem. Oferujemy naprawy mechaniczne, elektryczne, diagnostykę komputerową oraz wymianę opon.",
      categories: ["Motoryzacja", "Usługi"],
      location: "Warszawa",
      rating: 4.8,
      reviewCount: 124,
      verified: true,
    },
    {
      id: 2,
      name: "Nieruchomości XYZ",
      logo: "/placeholder.svg?height=100&width=100&text=XYZ",
      description:
        "Biuro nieruchomości specjalizujące się w sprzedaży i wynajmie mieszkań, domów oraz lokali użytkowych. Działamy na rynku od 15 lat.",
      categories: ["Nieruchomości"],
      location: "Kraków",
      rating: 4.5,
      reviewCount: 87,
      verified: true,
    },
    {
      id: 3,
      name: "IT Solutions Sp. z o.o.",
      logo: "/placeholder.svg?height=100&width=100&text=IT",
      description:
        "Firma informatyczna oferująca usługi programistyczne, tworzenie stron internetowych, aplikacji mobilnych oraz wsparcie IT dla firm.",
      categories: ["Usługi", "Elektronika"],
      location: "Poznań",
      rating: 4.9,
      reviewCount: 93,
      verified: true,
    },
    {
      id: 4,
      name: "Salon Fryzjerski Elegancja",
      logo: "/placeholder.svg?height=100&width=100&text=Fryzjer",
      description:
        "Profesjonalny salon fryzjerski oferujący strzyżenie, koloryzację, stylizację oraz zabiegi pielęgnacyjne dla włosów.",
      categories: ["Usługi", "Moda"],
      location: "Gdańsk",
      rating: 4.7,
      reviewCount: 142,
      verified: true,
    },
  ]

export default function NewsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    fetchPosts(1)
  }, [])

  const fetchPosts = async (pageNum: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/news?page=${pageNum}&limit=10`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać aktualności")
      }

      const data = await response.json()

      if (pageNum === 1) {
        setPosts(data.posts)
      } else {
        setPosts((prev) => [...prev, ...data.posts])
      }

      setHasMore(pageNum < data.totalPages)
      setPage(pageNum)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać aktualności",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const loadMore = () => {
    const nextPage = page + 1
    fetchPosts(nextPage)
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Aktualności</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {user && (
              <NewsPostForm
                user={{
                  id: user.id,
                  name: user.name,
                  avatar:
                    user.avatar ||
                    `/placeholder.svg?height=40&width=40&text=${user.name.substring(0, 2).toUpperCase()}`,
                }}
                onPostCreated={handlePostCreated}
              />
            )}

            {isLoading && posts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-lg" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <NewsPost key={post.id} post={post} />
                ))}

                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ładowanie...
                        </>
                      ) : (
                        "Załaduj więcej"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Brak aktualności</h3>
                <p className="text-muted-foreground">Bądź pierwszy i dodaj nowy wpis!</p>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <div className="sticky top-13 space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">O aktualnościach</h3>
                <p className="text-muted-foreground text-sm">
                  Tutaj możesz dzielić się swoimi przemyśleniami, linkami do ciekawych artykułów i nowościami z branży.
                </p>
              </div>

              {/* Tutaj można dodać więcej elementów, np. popularne hashtagi, polecane profile itp. */}
                <div className="container py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Polecane firmy</h2>
                        <Link href="/firmy" className="text-primary hover:underline flex items-center">
                            Zobacz wszystkie <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                    {featuredCompanies.map((company) => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                    </div>
                </div>
            </div>
          </div>
        </div>

        <Script
          id="news-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Aktualności Gotpage",
              description: "Najnowsze aktualności, wpisy i dyskusje społeczności Gotpage.",
              publisher: {
                "@type": "Organization",
                name: "Gotpage",
                logo: {
                  "@type": "ImageObject",
                  url: `${process.env.NEXT_PUBLIC_APP_URL || "https://gotpage.pl"}/logo.png`,
                },
              },
              mainEntity: {
                "@type": "ItemList",
                itemListElement: posts.slice(0, 10).map((post, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  item: {
                    "@type": "SocialMediaPosting",
                    headline: post.content.substring(0, 110),
                    datePublished: post.createdAt,
                    author: {
                      "@type": "Person",
                      name: post.author.name,
                    },
                  },
                })),
              },
            }),
          }}
        />
      </div>
    </PageLayout>
  )
}

