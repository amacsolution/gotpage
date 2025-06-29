"use client"

// Zmień importy i typy na polskie nazwy gdzie to możliwe
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { NewsPost } from "@/components/news-post"
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


export default function StronaPojedynczegoWpisu({ id }: { id: string }) {
    const [wpis, ustawWpis] = useState<any>(null)
    const [ladowanie, ustawLadowanie] = useState(true)
    const router = useRouter()
    const { toast } = useToast()
    let fragment = "Wpis na naszej platformie ogłoszeniowej"

    useEffect(() => {
        const pobierzWpis = async () => {
            try {
                ustawLadowanie(true)
                const odpowiedz = await fetch(`/api/news/${id}`)

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
        <>
            <PageLayout>
                <div className="container py-6">


                    {ladowanie ? (
                        <div className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                    ) : wpis ? (
                        <>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/aktualnosci">
                                            Wróć do aktualności
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`/profil/${wpis.author.id}`}>{wpis.author.name}</BreadcrumbLink>
                                    </BreadcrumbItem>

                                </BreadcrumbList>
                            </Breadcrumb>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
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
                        </>
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
        </>
    )
}
