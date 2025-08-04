"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/legacy/image"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Share2, Flag, MapPin, Phone, Mail, Calendar, Clock, Eye, ShieldCheck, Edit, Trash2, ArrowRight } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { LikeButton } from "@/components/like-button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import DOMPurify from "dompurify"
import QrButton from "@/components/qr/qr-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog"
import { DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { ImageOverlay } from "@/components/ads/imageoverlay"
import { htmlToText } from "html-to-text"

export default function AdDetailsClient({ id }: { id: string }) {
  const [ad, setAd] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthor, setIsAuthor] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [similarAds, setSimilarAds] = useState<any[]>([])
  const [isSimilarAdsLoading, setIsSimilarAdsLoading] = useState(true)
  const [sanitizedHtml, setSanitizedHtml] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [slug, setSlug] = useState<string>("")
  const [showImageOverlay, setShowImageOverlay] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("userData") || "null") : null

  const handleMessage = async (userId: number) => {
    try {
      if (!currentUser) {
        toast({
          title: "Wymagane logowanie",
          description: "Musisz być zalogowany, aby wysyłać wiadomości",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const response = await fetch("/api/messages/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error creating conversation: ${response.status}`)
      }

      const data = await response.json()
      router.push(`/wiadomosci`)
    } catch (err) {
      console.error("Error starting conversation:", err)
      toast({
        title: "Błąd",
        description: "Nie udało się rozpocząć konwersacji. Spróbuj ponownie później.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchAd = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/ogloszenia/${id}`)
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        const user = currentUser
        if (data.author && user) {
          setIsAuthor(user.id === data.author.id)
        }
        setSanitizedHtml(DOMPurify.sanitize(data.description || ""))
        setAd(data)
      } catch (error) {
        console.error("Błąd podczas pobierania ogłoszenia:", error)
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać ogłoszenia. Spróbuj ponownie później.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAd()
  }, [id, toast])

  useEffect(() => {
    if (ad && !isLoading) {
      const fetchSimilarAds = async () => {
        try {
          setIsSimilarAdsLoading(true)
          const response = await fetch(`/api/ogloszenia/similar?id=${ad.id}&category=${ad.category}`)
          const data = await response.json()
          if (data.error) {
            throw new Error(data.error)
          }
          setSimilarAds(data)
        } catch (error) {
          console.error("Błąd podczas pobierania podobnych ogłoszeń:", error)
        } finally {
          setIsSimilarAdsLoading(false)
        }
      }

      fetchSimilarAds()
    }
  }, [ad, isLoading])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      const response = await fetch(`/api/ogloszenia/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setAd({
        ...ad,
        comments: [data, ...ad.comments],
      })
      setCommentText("")
      toast({
        title: "Komentarz dodany",
        description: "Twój komentarz został pomyślnie dodany.",
      })
    } catch (error) {
      console.error("Błąd podczas dodawania komentarza:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się dodać komentarza. Spróbuj ponownie później.",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    toast({
      title: "Edycja ogłoszenia",
      description: "Funkcja w przygotowaniu",
      variant: "default",
    })
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/ogloszenia/${ad.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Nie udało się usunąć ogłoszenia")
      }
      toast({
        title: "Sukces",
        description: "Ogłoszenie zostało usunięte",
      })
      router.push(`/profil/${ad.author.id}`)
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć ogłoszenia",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1))
  }

    const sanitize = (str: string) => str.replace(/\//g, '--');

  

  if (isLoading) {
    return (
      <PageLayout>
        <div className="h-full w-full absolute bg-black/10">
          <span className="sr-only">Ładowanie...</span>
        </div>
        <div className="container py-6">
          <div className="mb-6">
            <div className="flex items-center text-muted-foreground">
              <Skeleton className="h-4 w-4 mr-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3].map((_, index) => (
                  <Skeleton key={index} className="w-24 h-24 rounded-md" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-10 w-1/3 mb-4" />
              <Skeleton className="w-full h-48 rounded-lg mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-40 w-full mb-8" />
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-60 w-full" />
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!ad) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Ogłoszenie nie zostało znalezione</h1>
            <Link href="/ogloszenia">
              <Button>Wróć do ogłoszeń</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Enhanced Image Overlay */}
      <ImageOverlay
        images={ad.images || []}
        activeIndex={activeImageIndex}
        isOpen={showImageOverlay}
        onClose={() => setShowImageOverlay(false)}
        onPrevious={handlePrevImage}
        onNext={handleNextImage}
        title={ad.title}
      />

      <div className="container py-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/ogloszenia">Ogłoszenia</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/ogloszenia/szukaj/${encodeURIComponent(sanitize(ad.category))}`}>{ad.category}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {ad.category && ad.subcategory && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/ogloszenia/szukaj/${encodeURIComponent(sanitize(ad.category))}/${encodeURIComponent(sanitize(ad.subcategory))}`}>{ad.subcategory}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              {ad.category && ad.subcategory && ad.final_category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/ogloszenia/szukaj/${encodeURIComponent(sanitize(ad.category))}/${encodeURIComponent(sanitize(ad.subcategory))}/${encodeURIComponent(sanitize(ad.final_category))}`}>{ad.final_category}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              
              <BreadcrumbItem className="text-primary">
                <BreadcrumbPage>{ad.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div
              className="relative aspect-video overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImageOverlay(true)}
            >
              <Image
                src={ad.images[activeImageIndex] || "/placeholder.svg"}
                alt={ad.title}
                className="object-cover"
                priority
                layout="fill"
              />
              {ad.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {activeImageIndex + 1} / {ad.images.length}
                </div>
              )}
            </div>
            {ad.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 flex-nowrap">
                {ad.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative min-w-[96px] aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${
                      activeImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${ad.title} - zdjęcie ${index + 1}`}
                      layout="fill"
                      className="object-cover"
                      sizes="96px"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary">{ad.category}</Badge>
              {ad.subcategory && <Badge variant="outline">{ad.subcategory}</Badge>}
              {ad.final_category && <Badge variant="outline">{ad.final_category}</Badge>}
              {ad.promoted ? (
                <Badge variant="outline" className="text-primary border-primary/30">
                  Promowane
                </Badge>
              ) : ""}
              <span className="text-muted-foreground text-sm">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatDistanceToNow(new Date(ad.created_at), {
                  addSuffix: true,
                  locale: pl,
                })}
              </span>
              <span className="text-muted-foreground text-sm">
                <Eye className="h-4 w-4 inline mr-1" />
                {ad.views} wyświetleń
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{ad.location}</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-4">
              {typeof ad.price === "number" ? ad.price.toLocaleString() : ad.price} {ad.currency}
            </div>

            <Card className="p-4 mb-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/profil/${ad.author.id}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={ad.author.avatar || "/placeholder.svg"} alt={ad.author.name} />
                      <AvatarFallback>{ad.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <div className="flex items-center gap-1">
                      <Link href={`/profil/${ad.author.id}`} className="hover:underline">
                        <h3 className="font-semibold">{ad.author.name}</h3>
                      </Link>
                      {ad.author.verified && (
                        <span className="text-primary" title="Zweryfikowany">
                          <ShieldCheck />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ad.author.type === "individual" ? "Osoba prywatna" : "Firma"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Na Gotpage od {new Date(ad.author.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {isAuthor && (
                  <>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                        Edytuj
                      </Button>
                      <Button
                        onClick={handleDeleteClick}
                        variant="destructive"
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Usuń
                      </Button>
                    </div>
                  </>
                )}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Czy na pewno chcesz usunąć to ogłoszenie?</DialogTitle>
                          <DialogDescription>
                            Ta akcja jest nieodwracalna. Ogłoszenie zostanie trwale usunięte z systemu.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 sm:gap-0">
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                            Nie, anuluj
                          </Button>
                          <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? "Usuwanie..." : "Tak, usuń"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col gap-3">
                <a href={`tel:${ad.author.phone}`}>
                  <Button className="w-full" variant="default">
                    <Phone className="h-4 w-4 mr-2" />
                    {ad.author.phone}
                  </Button>
                </a>
                <Button className="w-full bg-transparent" variant="outline" onClick={() => handleMessage(ad.author.id)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Wyślij wiadomość
                </Button>
              </div>
            </Card>

            <div className="flex gap-2">
              <div className="flex-1 items-center justify-center rounded-md px-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                <LikeButton adId={ad.id} initialLikes={ad.likes || 0} className="flex-1" showCount={true} size="lg" />
              </div>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-500 hover:text-red-500 hover:font-bold bg-transparent"
              >
                <Flag className="h-4 w-4 mr-2" />
                Zgłoś
              </Button>
            </div>
            {slug && <QrButton url={`https://gotpage.pl/ogloszenia/${slug}`} className="w-full mt-2" />}
          </div>
        </div>

        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              Opis
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex-1">
              Parametry
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              Komentarze ({ad.comments ? ad.comments.length : 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <Card className="p-4">
              <div className="whitespace-pre-line text-foreground [&_*]:text-foreground">
                <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="parameters" className="mt-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ad.parameters &&
                  Object.entries(ad.parameters).map(([key, value], index) => (
                    <div key={index} className="flex justify-between p-2 border-b">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">
                        {typeof value === "boolean" ? (value ? "Tak" : "Nie") : String(value)}
                      </span>
                    </div>
                  ))}
                {/* Category-specific parameters remain the same */}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="comments" className="mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <form onSubmit={handleComment} className="mb-6">
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>TY</AvatarFallback>
                    </Avatar>
                    <input
                      type="text"
                      placeholder="Napisz komentarz..."
                      className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <Button type="submit" size="sm">
                      Wyślij
                    </Button>
                  </div>
                </form>
                {ad.comments && ad.comments.length > 0 ? (
                  ad.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg ${comment.isAuthor ? "bg-primary/10" : "bg-muted"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/profil/${comment.author.id}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div>
                          <Link href={`/profil/${comment.author.id}`} className="hover:underline">
                            <div className="font-medium text-sm">{comment.author.name}</div>
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: pl,
                            })}
                          </div>
                        </div>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Brak komentarzy. Bądź pierwszy!</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mb-8">
          <div className="flex flex-nowrap justify-between">
            <h2 className="text-xl font-bold mb-4">Poznaj inne ogłoszenia w kategorii {ad.category}</h2>
            <Link href={`/ogloszenia/szukaj/${sanitize(ad.category)}`} className="text-primary hover:underline flex items-center">
              Zobacz więcej w kategorii {ad.category} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {isSimilarAdsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-60 w-full" />
              ))}
            </div>
          ) : similarAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarAds.map((similarAd) => (
                <Link
                  href={`/ogloszenia/${similarAd.id}`}
                  key={similarAd.id}
                  className="block hover:scale-[1.01] transition-transform"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-40">
                      <Image
                        src={similarAd.image || "/placeholder.svg?height=200&width=300"}
                        alt={similarAd.title}
                        loading="lazy"
                        objectFit="cover"
                        layout="fill"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2">{similarAd.title}</h4>
                      <p className="text-primary font-semibold text-sm mt-1">
                        {similarAd.price
                          ? `${similarAd.price.toLocaleString()} ${similarAd.currency || "PLN"}`
                          : "Cena do negocjacji"}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {similarAd.location}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Brak podobnych ogłoszeń</p>
            </div>
          )}
        </div>

        
      </div>

      {ad && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: ad.title,
              image: ad.images?.[0] || "/logo.png",
              description: htmlToText(ad.description || "", { wordwrap: false, selectors: [{ selector: 'a', options: { ignoreHref: true } }] }).slice(0,200),
              category: ad.category,
              offers: {
                "@type": "Offer",
                price: ad.price,
                priceCurrency: "PLN",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
      )}
    </PageLayout>
  )
}
