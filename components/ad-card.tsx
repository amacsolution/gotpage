"use client"

import type React from "react"

import { LikeButton } from "@/components/like-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Edit, Eye, MapPin, MessageSquare, ShieldCheck, Star, Trash2, Truck } from "lucide-react"
import Image from "next/legacy/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface AdCardProps {
  ad: {
    id: number
    title: string
    content: string
    category: string
    subcategory?: string
    price: number | null
    currency?: string | null
    location?: string
    image: string
    createdAt: Date
    promoted: number
    comments_count: number
    author: {
      id: string
      name: string
      avatar: string
      type: string
      verified: boolean
    }
    likes: number
    comments: number
  }
  image?: string
}

export function AdCard({ ad, image }: AdCardProps) {
  const [isAuthor, setIsAuthor] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Funkcja do generowania losowej oceny (4-5 gwiazdek) dla efektu podobnego do Amazona
  const randomRating = () => {
    return (4 + Math.random()).toFixed(1)
  }

  const rating = randomRating()
  const plImage = "/placeholder.svg"

  // Sprawdzenie, czy zalogowany użytkownik jest autorem ogłoszenia
  useEffect(() => {
    const getUserData = async () => {
      const userData = await fetch("/api/auth/me").then((res) => res.json())
      return userData
    }
    const checkAuthor = async () => {
      try {
        const user = await getUserData()
        setIsAuthor(user.id === ad.author.id)
      } catch (error) {
      }
    }
    checkAuthor()
  }, [ad.author.id])



  // Funkcje obsługujące przyciski
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/ogloszenia/edytuj/${ad.id}`)
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/ogloszenia/${ad.id}`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/ads/${ad.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Nie udało się usunąć ogłoszenia")
      }

      toast({
        title: "Sukces",
        description: "Ogłoszenie zostało usunięte",
      })

      // Odświeżenie strony po usunięciu
      router.refresh()
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

  // Sprawdzenie, czy jesteśmy na stronie profilu
  const isProfilePage = pathname?.startsWith("/profil") && !pathname?.startsWith("/profil/")

  // Sprawdzenie, czy powinniśmy pokazać overlay
  const shouldShowOverlay = isAuthor || (isProfilePage && pathname?.includes(`/${ad.author.id}`))

  return (
    <>
      <div className="relative " onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Link href={`/ogloszenia/${ad.id}`} className="block">
          <Card ref={cardRef} className="hover:shadow-md overflow-hidden transition-all relative hover:scale-[1.01]">
            <CardContent className={`p-0 overflow-hidden ${ad.promoted ? "border-primary/40" : "border-muted"}`}>
              <div className="flex flex-col">
                {/* Zdjęcie produktu - zawsze na górze, zarówno na mobile jak i desktop */}
                <div className="relative w-full h-52 overflow-hidden bg-gray-50">
                  <Image
                    src={image || ad.image || plImage}
                    alt={ad.title}
                    loading="lazy"
                    objectFit="cover"
                    layout="fill"
                  />
                  {ad.promoted === 1 && (
                    <Badge variant="default" className="absolute top-2 left-2 z-10">
                      Promowane
                    </Badge>
                  )}
                </div>

                {/* Informacje o produkcie - styl Amazon */}
                <div className="flex-1 p-4">
                  <div className="space-y-2">
                    {/* Tytuł produktu - większy i bardziej wyraźny */}
                    <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors">
                      {ad.title}
                    </h3>

                    {/* Oceny w stylu Amazona */}
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4"
                            fill={star <= Math.floor(Number(rating)) ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{ad.comments_count}</span>
                    </div>

                    {/* Kategoria */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{ad.category}</Badge>
                      {ad.subcategory && <Badge variant="outline">{ad.subcategory}</Badge>}
                    </div>

                    {/* Cena - wyróżniona jak w Amazonie */}
                    {ad.price && (
                      <div className="font-bold text-xl text-primary">
                        {ad.price.toLocaleString()} {ad.currency || "PLN"}
                      </div>
                    )}

                    {/* Krótki opis */}
                    <p className="text-muted-foreground text-sm line-clamp-2">{ad.content}</p>

                    {/* Informacje o dostawie i lokalizacji - styl Amazon */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{ad.location || "Polska"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Truck className="h-3 w-3" />
                        <span>Dostępne od ręki</span>
                      </div>
                      {ad.author.verified && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ShieldCheck className="h-3 w-3 text-primary" />
                          <span>Zweryfikowany sprzedawca</span>
                        </div>
                      )}
                    </div>

                    {/* Informacje o sprzedawcy i interakcjach */}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={ad.author.avatar} alt={ad.author.name} />
                          <AvatarFallback>{ad.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{ad.author.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(ad.createdAt, {
                            addSuffix: true,
                            locale: pl,
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <LikeButton adId={ad.id} initialLikes={ad.likes} size="sm" />
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-xs">{ad.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Overlay dla autora ogłoszenia - wydzielony poza Link */}
        {shouldShowOverlay && isHovered && (
          <div className="absolute rounded-md inset-0 bg-gradient-to-br from-primary/70 to-black/70 z-20 flex flex-col items-center justify-center gap-4 transition-all duration-800 opacity-0 hover:opacity-100">
            <h3 className="text-white font-medium text-center px-4">Zarządzaj swoim ogłoszeniem</h3>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Edit className="h-4 w-4" />
                Edytuj
              </Button>

              <Button
                onClick={handleViewClick}
                variant="outline"
                className="flex items-center gap-2 border-white text-white hover:bg-white/20"
                size="sm"
              >
                <Eye className="h-4 w-4" />
                Zobacz
              </Button>

              <Button onClick={handleDeleteClick} variant="destructive" className="flex items-center gap-2" size="sm">
                <Trash2 className="h-4 w-4" />
                Usuń
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog potwierdzający usunięcie */}
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
    </>
  )
}

