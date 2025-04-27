"use client"

// Zmień importy i typy na polskie nazwy gdzie to możliwe
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { NewsPost, type NewsPostProps } from "@/components/news-post"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Script from "next/script"
import type { Metadata, ResolvingMetadata } from "next"

type PropsStrony = {
  params: { id: string }
}

export async function generujMetadane({ params }: PropsStrony, rodzic: ResolvingMetadata): Promise<Metadata> {
  // Pobierz dane wpisu
  try {
    const idWpisu = await params.id

    // Pobierz wpis z bazy danych
    const odpowiedz = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${idWpisu}`)

    if (!odpowiedz.ok) {
      if (odpowiedz.status === 404) {
        throw new Error("Nie znaleziono wpisu")
      }
      throw new Error("Nie udało się pobrać wpisu")
    }

    const wpis: NewsPostProps[] = await odpowiedz.json()
    const daneWpisu = wpis[0]

    // Utwórz czysty fragment treści
    const fragment = daneWpisu.post.content
      ? daneWpisu.post.content.substring(0, 160).replace(/\n/g, " ") +
        (daneWpisu.post.content.length > 160 ? "..." : "")
      : "Przeczytaj najnowszy wpis na naszej platformie ogłoszeniowej"

    // Pobierz obrazy z treści, jeśli są dostępne
    const obrazy = []
    if (daneWpisu.post.imageUrl) {
      obrazy.push(daneWpisu.post.imageUrl)
    }

    // Pobierz podstawowe metadane z rodzica
    const poprzednieObrazy = (await rodzic).openGraph?.images || []

    return {
      title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
      description: fragment,
      authors: [{ name: daneWpisu.post.author.name }],
      openGraph: {
        title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
        description: fragment,
        type: "article",
        publishedTime: daneWpisu.post.createdAt,
        authors: [daneWpisu.post.author.name],
        images: [...obrazy, ...poprzednieObrazy],
      },
      twitter: {
        card: "summary_large_image",
        title: `${fragment.substring(0, 60)}${fragment.length > 60 ? "..." : ""}`,
        description: fragment,
        images: obrazy.length > 0 ? [obrazy[0]] : undefined,
      },
    }
  } catch (blad) {
    console.error("Błąd podczas generowania metadanych:", blad)
    return {
      title: "Aktualności",
      description: "Przeczytaj najnowsze aktualności na naszej platformie ogłoszeniowej",
    }
  }
}

export default function StronaPojedynczegoWpisu({ params }: { params: { id: string } }) {
  const [wpis, ustawWpis] = useState<any>(null)
  const [ladowanie, ustawLadowanie] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const {id} = params

  useEffect(() => {
    const pobierzWpis = async () => {
      try {
        ustawLadowanie(true)
        const odpowiedz = await fetch(`/api/news/${params.id}`)

        if (!odpowiedz.ok) {
          if (odpowiedz.status === 404) {
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

        const dane = await odpowiedz.json()
        ustawWpis(dane)
      } catch (blad) {
        console.error("Błąd podczas pobierania wpisu:", blad)
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać wpisu",
          variant: "destructive",
        })
      } finally {
        ustawLadowanie(false)
      }
    }

    pobierzWpis()
  }, [id, router, toast])

  return (
    <PageLayout>
      <div className="container py-6">
        <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => router.push("/aktualnosci")}>
          <ArrowLeft className="h-4 w-4" />
          Wróć do aktualności
        </Button>

        {ladowanie ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : wpis ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <NewsPost post={wpis} />
            </div>

            <div className="hidden md:block">
              <div className="sticky top-6 space-y-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">O autorze</h3>
                  {wpis.author && (
                    <div className="text-sm text-muted-foreground">
                      <p>Autor: {wpis.author.name}</p>
                      <p>Opublikowano: {new Date(wpis.createdAt).toLocaleDateString()}</p>
                      {wpis.author.verified && <p className="text-primary">Zweryfikowany użytkownik</p>}
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

        {wpis && (
          <Script
            id="post-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SocialMediaPosting",
                headline: wpis.content.substring(0, 110),
                datePublished: wpis.createdAt,
                author: {
                  "@type": "Person",
                  name: wpis.author.name,
                },
                interactionStatistic: [
                  {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/LikeAction",
                    userInteractionCount: wpis.likes,
                  },
                  {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/CommentAction",
                    userInteractionCount: wpis.comments,
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
