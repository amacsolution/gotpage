"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Share2, Flag, MapPin, Phone, Mail, Calendar, Clock, ArrowLeft, Eye } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

// Mock data dla ogłoszenia
const mockAd = {
  id: 1,
  title: "Sprzedam samochód Toyota Corolla 2018",
  content:
    "Samochód w idealnym stanie, pierwszy właściciel, serwisowany w ASO, przebieg 45000 km. Silnik 1.6 benzyna, automatyczna skrzynia biegów. Wyposażenie: klimatyzacja, nawigacja, kamera cofania, podgrzewane fotele, czujniki parkowania. Możliwość sprawdzenia w dowolnym serwisie. Cena do negocjacji.",
  category: "Motoryzacja",
  subcategory: "Samochody osobowe",
  price: 55000,
  currency: "PLN",
  location: "Warszawa, Mazowieckie",
  images: [
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800&text=Toyota+Corolla+2",
    "/placeholder.svg?height=600&width=800&text=Toyota+Corolla+3",
  ],
  createdAt: new Date(2023, 2, 15),
  promoted: true,
  views: 245,
  author: {
    id: 1,
    name: "Jan Kowalski",
    avatar: "/placeholder.svg?height=40&width=40",
    type: "individual",
    verified: false,
    phone: "+48 123 456 789",
    email: "jan.kowalski@example.com",
    joinedAt: new Date(2022, 5, 15),
  },
  likes: 12,
  comments: [
    {
      id: 1,
      author: {
        name: "Anna Nowak",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Czy możliwa jest jazda próbna?",
      createdAt: new Date(2023, 2, 16),
    },
    {
      id: 2,
      author: {
        name: "Piotr Wiśniewski",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Jaki jest dokładny przebieg?",
      createdAt: new Date(2023, 2, 17),
    },
    {
      id: 3,
      author: {
        name: "Jan Kowalski",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: "Dokładny przebieg to 45320 km. Jazda próbna jak najbardziej możliwa po wcześniejszym umówieniu się.",
      createdAt: new Date(2023, 2, 17),
      isAuthor: true,
    },
  ],
  parameters: [
    { name: "Marka", value: "Toyota" },
    { name: "Model", value: "Corolla" },
    { name: "Rok produkcji", value: "2018" },
    { name: "Przebieg", value: "45000 km" },
    { name: "Pojemność silnika", value: "1.6" },
    { name: "Rodzaj paliwa", value: "Benzyna" },
    { name: "Skrzynia biegów", value: "Automatyczna" },
    { name: "Kolor", value: "Srebrny" },
    { name: "Stan", value: "Używany" },
  ],
}

export default function AdDetailsClient({ id }: { id: string }) {
  const [ad, setAd] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    // Próba pobrania danych z API
    const fetchAd = async () => {
      try {
        setIsLoading(true)
        // W rzeczywistej aplikacji tutaj byłoby zapytanie do API
        // const response = await fetch(`/api/ads/${id}`);
        // const data = await response.json();

        // Symulacja opóźnienia sieciowego
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Używamy mock data
        setAd(mockAd)
      } catch (error) {
        console.error("Błąd podczas pobierania ogłoszenia:", error)
        // W przypadku błędu również używamy mock data
        setAd(mockAd)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAd()
  }, [id])

  const handleLike = () => {
    if (ad) {
      setAd({ ...ad, likes: ad.likes + 1 })
    }
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment = {
      id: Date.now(),
      author: {
        name: "Ty",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: commentText,
      createdAt: new Date(),
    }

    setAd({
      ...ad,
      comments: [...ad.comments, newComment],
    })
    setCommentText("")
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-pulse text-xl">Ładowanie ogłoszenia...</div>
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
      <div className="container py-6">
        <div className="mb-6">
          <Link href="/ogloszenia" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Wróć do ogłoszeń
          </Link>
        </div>

        {/* Nowy układ: zdjęcie po lewej, informacje po prawej */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Lewa kolumna - zdjęcie */}
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={ad.images[activeImageIndex] || "/placeholder.svg"}
                alt={ad.title}
                fill
                className="object-cover"
              />
            </div>
            {ad.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {ad.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${
                      activeImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${ad.title} - zdjęcie ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prawa kolumna - informacje */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary">{ad.category}</Badge>
              {ad.subcategory && <Badge variant="outline">{ad.subcategory}</Badge>}
              {ad.promoted && (
                <Badge variant="outline" className="text-primary border-primary/30">
                  Promowane
                </Badge>
              )}
              <span className="text-muted-foreground text-sm">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatDistanceToNow(ad.createdAt, {
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
              {ad.price.toLocaleString()} {ad.currency}
            </div>

            {/* Informacje o sprzedającym */}
            <Card className="p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={ad.author.avatar} alt={ad.author.name} />
                  <AvatarFallback>{ad.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold">{ad.author.name}</h3>
                    {ad.author.verified && (
                      <span className="text-primary" title="Zweryfikowany">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ad.author.type === "individual" ? "Osoba prywatna" : "Firma"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Na Gotpage od {ad.author.joinedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <Button className="w-full" variant="default">
                  <Phone className="h-4 w-4 mr-2" />
                  {ad.author.phone}
                </Button>
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Wyślij wiadomość
                </Button>
              </div>
            </Card>

            {/* Akcje */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleLike}>
                <Heart className="h-4 w-4 mr-2" />
                Polub ({ad.likes})
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij
              </Button>
              <Button variant="outline" className="flex-1 text-destructive">
                <Flag className="h-4 w-4 mr-2" />
                Zgłoś
              </Button>
            </div>
          </div>
        </div>

        {/* Zakładki z opisem, parametrami i komentarzami */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              Opis
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex-1">
              Parametry
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              Komentarze ({ad.comments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <Card className="p-4">
              <div className="whitespace-pre-line">{ad.content}</div>
            </Card>
          </TabsContent>
          <TabsContent value="parameters" className="mt-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ad.parameters.map((param: any, index: number) => (
                  <div key={index} className="flex justify-between p-2 border-b">
                    <span className="text-muted-foreground">{param.name}:</span>
                    <span className="font-medium">{param.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="comments" className="mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                {ad.comments.map((comment: any) => (
                  <div key={comment.id} className={`p-3 rounded-lg ${comment.isAuthor ? "bg-primary/10" : "bg-muted"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{comment.author.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, {
                            addSuffix: true,
                            locale: pl,
                          })}
                        </div>
                      </div>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
                <form onSubmit={handleComment} className="mt-4">
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
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Podobne ogłoszenia */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Podobne ogłoszenia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Link href={`/ogloszenia/${i + 1}`} key={i} className="block">
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-40">
                    <Image
                      src={`/placeholder.svg?height=200&width=300&text=Ad+${i}`}
                      alt={`Podobne ogłoszenie ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {i === 1
                        ? "Toyota Avensis 2016, stan idealny"
                        : i === 2
                          ? "Honda Civic 2019, niski przebieg"
                          : i === 3
                            ? "Mazda 3 2017, pierwszy właściciel"
                            : "Volkswagen Golf 2020, jak nowy"}
                    </h4>
                    <p className="text-primary font-semibold text-sm mt-1">{(45000 + i * 5000).toLocaleString()} PLN</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {i === 1 ? "Warszawa" : i === 2 ? "Kraków" : i === 3 ? "Poznań" : "Wrocław"}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

