"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { MessageSquare, Heart, MoreHorizontal, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
    }
    likes: number
    comments: number
  }
  onLike: (id: number) => void
}

export function AdCard({ ad, onLike }: AdCardProps) {
  return (
    <Link href={`/ogloszenia/${ad.id}`}>
      <Card className={`hover:border-primary/50 transition-colors ${ad.promoted ? "border-primary/20" : ""}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Zdjęcie po lewej stronie */}
            <div className="flex-shrink-0">
              <div className="relative h-32 w-32 rounded-md overflow-hidden">
                <Image
                  src={ad.images[0] || "/placeholder.svg?height=200&width=200"}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Treść ogłoszenia */}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">{ad.title}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{ad.category}</Badge>
                    {ad.promoted && (
                      <Badge variant="outline" className="text-primary border-primary/30">
                        Promowane
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>Zapisz</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>Zgłoś</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>Nie pokazuj podobnych</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {ad.price && (
                <div className="font-semibold text-lg text-primary mb-2">
                  {ad.price.toLocaleString()} {ad.currency}
                </div>
              )}

              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{ad.content}</p>

              {ad.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>{ad.location}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ad.author.avatar} alt={ad.author.name} />
                    <AvatarFallback>{ad.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{ad.author.name}</span>
                    {ad.author.verified && (
                      <span className="text-primary text-xs" title="Zweryfikowany">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(ad.createdAt, {
                    addSuffix: true,
                    locale: pl,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-muted-foreground text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 flex items-center gap-1"
                  onClick={(e) => {
                    e.preventDefault()
                    onLike(ad.id)
                  }}
                >
                  <Heart className="h-3 w-3" />
                  <span>{ad.likes}</span>
                </Button>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{ad.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

