"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { MessageSquare, MapPin, Star, Truck, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LikeButton } from "@/components/like-button"

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
    images: string[]
    createdAt: Date
    promoted: boolean
    author: {
      id: number
      name: string
      avatar: string
      type: string
      verified: boolean
    },
    
    likes: number
    comments: number
  }
  image: string,
}

export function AdCard({ ad, image}: AdCardProps) {
  // Funkcja do generowania losowej oceny (4-5 gwiazdek) dla efektu podobnego do Amazona
  const randomRating = () => {
    return (4 + Math.random()).toFixed(1)
  }

  const rating = randomRating()

  return (
    <Link href={`/ogloszenia/${ad.id}`}>
      <Card className={`hover:shadow-md overflow-hidden transition-all ${ad.promoted ? "border-primary/40" : "border-muted"} hover:scale-105`}>
        <CardContent className="p-0 overflow-hidden">
          <div className="flex flex-col">
            {/* Zdjęcie produktu - zawsze na górze, zarówno na mobile jak i desktop */}
            <div className="relative w-full h-48 overflow-hidden bg-gray-50">
              <Image
                src={!ad.images[0] ? '/placeholder.svg' : ad.images[0]}
                alt={ad.title}
                loading="lazy"
                objectFit="cover"
                width={600}
                height={600}
              />
              {ad.promoted && (
                <Badge variant="default" className="absolute top-2 left-2 z-10">
                  Promowane
                </Badge>
              )}
            </div>

            {/* Informacje o produkcie - styl Amazon */}
            <div className="flex-1 p-4">
              <div className="space-y-2">
                {/* Tytuł produktu - większy i bardziej wyraźny */}
                <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors">{ad.title}</h3>

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
                  <span className="text-xs text-muted-foreground">({Math.floor(Math.random() * 100) + 5})</span>
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
  )
}

