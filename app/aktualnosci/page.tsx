"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { NewsPost} from "@/components/news-post"
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
      const response = await fetch(`/api/news?page=${pageNum}&limit=10&includeComments=true`)

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

  const handleVote = async (postId: string, optionId: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map((post) => {
        if (post.id === postId && post.isPoll) {
          // Create a copy of poll options with updated vote count
          const updatedOptions = post.pollOptions.map((option) =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
          )

          // Calculate new total votes
          const newTotalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0)

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
      fetchPosts(1)
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
      fetchPosts(1)
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
      const newComment: Comment = {
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
      fetchPosts(1)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      // Optimistic update
      setPosts(posts.filter((post) => post.id !== postId))

      // Send delete request to API
      const response = await fetch(`/api/news/${postId}`, {
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
      fetchPosts(1)
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
      fetchPosts(1)
    }
  }

  console.log("Posts:", posts)

  const loadMore = () => {
    const nextPage = page + 1
    fetchPosts(nextPage)
  }

  // Add some sample data to demonstrate different post types
  useEffect(() => {
    if (posts.length === 0 && !isLoading) {
      const samplePosts = [
        {
          id: "1",
          author: {
            id: user?.id || "user1",
            name: "AMAC",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "",
          isPoll: true,
          pollQuestion: "Czy gotpage.pl jest nowoczesna?",
          pollOptions: [
            { id: "opt1", text: "tak", votes: 1 },
            { id: "opt2", text: "nie", votes: 0 },
            { id: "opt3", text: "nie wiem", votes: 0 },
          ],
          pollTotalVotes: 1,
          userVotedOption: user?.id ? "opt1" : undefined,
          createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
          likes: 0,
          comments: 0,
          commentsList: [],
          isLiked: false,
        },
        {
          id: "2",
          author: {
            id: "user2",
            name: "Jan Kowalski",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          content: "Właśnie wróciłem z wakacji w Grecji. Polecam wszystkim!",
          isPoll: false,
          image: "/placeholder.svg?height=300&width=600&text=Wakacje+w+Grecji",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          likes: 5,
          comments: 2,
          commentsList: [
            {
              id: "comment1",
              authorId: "user3",
              authorName: "Anna Nowak",
              authorAvatar: "/placeholder.svg?height=30&width=30",
              content: "Super! Gdzie dokładnie byłeś?",
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
              id: "comment2",
              authorId: "user2",
              authorName: "Jan Kowalski",
              authorAvatar: "/placeholder.svg?height=30&width=30",
              content: "Byłem na Krecie, przepiękna wyspa!",
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
          ],
          isLiked: true,
        },
      ]

      setPosts(samplePosts)
    }
  }, [posts.length, isLoading, user])

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
                  avatar: user.avatar,
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
                  <NewsPost
                    post={post}
                    onVote={handleVote}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDeletePost={handleDeletePost}
                    onEditPost={handleEditPost}
                  />
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

