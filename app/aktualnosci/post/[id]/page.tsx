"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { NewsPost } from "@/components/news-post"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Script from "next/script"

export default function SinglePostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/news/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Nie znaleziono wpisu",
              description: "Wpis nie istnieje lub został usunięty",
              variant: "destructive",
            })
            router.push("/aktualnosci")
            return
          }
          throw new Error("Nie udało się pobrać wpisu")
        }

        const data = await response.json()
        setPost(data)
      } catch (error) {
        console.error("Error fetching post:", error)
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać wpisu",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router, toast])

  return (
    <PageLayout>
      <div className="container py-6">
        <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => router.push("/aktualnosci")}>
          <ArrowLeft className="h-4 w-4" />
          Wróć do aktualności
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : post ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <NewsPost post={post} />
            </div>

            <div className="hidden md:block">
              <div className="sticky top-6 space-y-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">O autorze</h3>
                  {post.author && (
                    <div className="text-sm text-muted-foreground">
                      <p>Autor: {post.author.name}</p>
                      <p>Opublikowano: {new Date(post.createdAt).toLocaleDateString()}</p>
                      {post.author.verified && <p className="text-primary">Zweryfikowany użytkownik</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Nie znaleziono wpisu</h3>
            <p className="text-muted-foreground">Wpis mógł zostać usunięty lub nie istnieje.</p>
          </div>
        )}

        {post && (
          <Script
            id="post-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SocialMediaPosting",
                headline: post.content.substring(0, 110),
                datePublished: post.createdAt,
                author: {
                  "@type": "Person",
                  name: post.author.name,
                },
                interactionStatistic: [
                  {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/LikeAction",
                    userInteractionCount: post.likes,
                  },
                  {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/CommentAction",
                    userInteractionCount: post.comments,
                  },
                ],
              }),
            }}
          />
        )}
      </div>
    </PageLayout>
  )
}

