"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { NewsPost } from "@/components/news-post"
import { NewsPostForm } from "@/components/news-post-form"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/lib/user-context"
import { ArrowRight, Loader2, Users } from "lucide-react"
import Script from "next/script"
import Link from "next/link"
import { CompanyCard } from "@/components/company-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [activeTab, setActiveTab] = useState<"all" | "followed">("all")

  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        
        // Fetch featured companies
        const res = await fetch("/api/companies?promoted=true&limit=4")
        if (res.ok) {
          const featuredData = await res.json()
          setFeaturedCompanies(featuredData.companies || [])
        } else {
          throw new Error("Nie udało się pobrać firm")
        }

      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych. Spróbuj ponownie później.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])
  const fetchPosts = async (pageNum: number, followedOnly = false) => {
    try {
      setIsLoading(true)
      const url = `/api/news?page=${pageNum}&limit=10&includeComments=true${followedOnly ? "&followedOnly=true" : ""}`
      const response = await fetch(url)

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

  useEffect(() => {
    fetchPosts(1, activeTab === "followed")
  }, [activeTab])

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const handleVote = async (postId: string, optionId: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map((post) => {
        if (post.id === postId && post.isPoll) {
          // Create a copy of poll options with updated vote count
          const updatedOptions = post.pollOptions.map((option : {id : string, votes : number}) =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
          )

          // Calculate new total votes
          const newTotalVotes = updatedOptions.reduce((sum : number, option : {votes : number}) => sum + option.votes, 0)

          return {
            ...post,
            pollOptions: updatedOptions,
            pollTotalVotes: newTotalVotes,
            userVotedOption: optionId,
          }
        }
        return post
      })

      setPosts(updatedPosts)

      // Send vote to API
      const response = await fetch("/api/news/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          optionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się zagłosować")
      }

      toast({
        title: "Sukces",
        description: "Twój głos został zapisany",
      })
    } catch (error) {
      console.error("Error voting on poll:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zagłosować",
        variant: "destructive",
      })

      // Revert optimistic update by refreshing posts
      fetchPosts(1, activeTab === "followed")
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          }
        }
        return post
      })

      setPosts(updatedPosts)

      // Send like to API
      const response = await fetch("/api/news/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się polubić postu")
      }
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się polubić postu",
        variant: "destructive",
      })

      // Revert optimistic update by refreshing posts
      fetchPosts(1, activeTab === "followed")
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby obserwować użytkowników",
          variant: "destructive",
        })
        return
      }

      // Optimistic update
      const updatedPosts = posts.map((post) => {
        if (post.author.id === userId) {
          return {
            ...post,
            author: {
              ...post.author,
              isFollowed: !post.author.isFollowed,
            },
            isFollowed: !post.isFollowed,
          }
        }
        return post
      })

      setPosts(updatedPosts)

      // Send follow/unfollow request to API
      const action = posts.find((post) => post.author.id === userId)?.isFollowed ? "unfollow" : "follow"

      const response = await fetch("/api/user/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      })

      if (!response.ok) {
        throw new Error(`Nie udało się ${action === "follow" ? "obserwować" : "przestać obserwować"} użytkownika`)
      }

      toast({
        title: "Sukces",
        description: action === "follow" ? "Zacząłeś obserwować użytkownika" : "Przestałeś obserwować użytkownika",
      })
    } catch (error) {
      console.error("Error following user:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić statusu obserwacji",
        variant: "destructive",
      })

      // Revert optimistic update by refreshing posts
      fetchPosts(1, activeTab === "followed")
    }
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby dodać komentarz",
          variant: "destructive",
        })
        return
      }

      // Optimistic update
      const newComment = {
        id: `temp-${Date.now()}`,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content,
        createdAt: new Date(),
      }

      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...(post.commentsList || []), newComment],
          }
        }
        return post
      })

      setPosts(updatedPosts)

      // Send comment to API
      const response = await fetch("/api/news/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się dodać komentarza")
      }

      toast({
        title: "Sukces",
        description: "Komentarz został dodany",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się dodać komentarza",
        variant: "destructive",
      })

      // Revert optimistic update by refreshing posts
      fetchPosts(1, activeTab === "followed")
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      // Optimistic update
      setPosts(posts.filter((post) => post.id !== postId))

      // Send delete request to API
      const response = await fetch(`/api/news?postId=${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Nie udało się usunąć postu")
      }

      toast({
        title: "Sukces",
        description: "Post został usunięty",
      })
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć postu",
        variant: "destructive",
      })

      // Revert optimistic update by refreshing posts
      fetchPosts(1, activeTab === "followed")
    }
  }

  const handleEditPost = async (postId: string, content: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            content,
          }
        }
        return post
      })

      setPosts(updatedPosts)

      // Send edit request to API
      const response = await fetch(`/api/news/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się edytować postu")
      }

      toast({
        title: "Sukces",
        description: "Post został zaktualizowany",
      })
    } catch (error) {
      console.error("Error editing post:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się edytować postu",
        variant: "destructive",
      })

      // Revert optimistic update by refreshing posts
      fetchPosts(1, activeTab === "followed")
    }
  }

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1
      fetchPosts(nextPage, activeTab === "followed")
    }
  }, [isLoading, hasMore, page, activeTab])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Funkcja callback dla Intersection Observer
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore()
      }
    }

    // Resetuj observer przy zmianie zależności
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Inicjalizuj nowy observer
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "0px 0px 200px 0px", // Załaduj więcej, gdy element jest 200px od dolnej krawędzi
      threshold: 0.1,
    })

    // Obserwuj element loadMoreRef, jeśli istnieje
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, hasMore, isLoading])

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
                  avatar: user.avatar ?? null,
                }}
                onPostCreated={handlePostCreated}
              />
            )}

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "all" | "followed")}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">Wszystkie</TabsTrigger>
                <TabsTrigger value="followed" disabled={!user}>
                  <Users className="h-4 w-4 mr-2" />
                  Obserwowane
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading && posts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-lg" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <NewsPost
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDeletePost={handleDeletePost}
                    onEditPost={handleEditPost}
                    onFollow={handleFollow}
                    showFollowButton={true}
                  />
                ))}

                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-6">
                    {isLoading && (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Ładowanie...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  {activeTab === "followed" ? "Brak aktualności od obserwowanych użytkowników" : "Brak aktualności"}
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === "followed"
                    ? "Zacznij obserwować więcej użytkowników, aby zobaczyć ich aktualności"
                    : "Bądź pierwszy i dodaj nowy wpis!"}
                </p>
                {activeTab === "followed" && (
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("all")}>
                    Pokaż wszystkie aktualności
                  </Button>
                )}
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
                {user && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Wskazówki:</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Obserwuj użytkowników, aby widzieć ich posty na górze</li>
                      <li>Używaj zakładki "Obserwowane", aby zobaczyć tylko posty od obserwowanych użytkowników</li>
                      <li>Reaguj na posty, aby pokazać swoje zainteresowanie</li>
                    </ul>
                  </div>
                )}
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
