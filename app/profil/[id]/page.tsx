"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { AdFeed } from "@/components/ad-feed"
import { Star, Mail, Phone, MapPin, Calendar, Building, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { UserReviews } from "@/components/user-reviews"

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [similarUsers, setSimilarUsers] = useState<any[]>([])
  const [isSimilarUsersLoading, setIsSimilarUsersLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Utworzenie lokalnej zmiennej dla ID do użycia w tablicy zależności
  const userId = params.id

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/users/${userId}`)
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setUser(data)
      } catch (error) {
        console.error("Błąd podczas pobierania profilu użytkownika:", error)
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać profilu użytkownika. Spróbuj ponownie później.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId, toast])

  // Pobieranie podobnych użytkowników z niższym priorytetem
  useEffect(() => {
    if (user && !isLoading) {
      const fetchSimilarUsers = async () => {
        try {
          setIsSimilarUsersLoading(true)
          const response = await fetch(`/api/users/similar?id=${user.id}&type=${user.type}`)
          const data = await response.json()

          if (data.error) {
            throw new Error(data.error)
          }

          setSimilarUsers(data)
        } catch (error) {
          console.error("Błąd podczas pobierania podobnych użytkowników:", error)
        } finally {
          setIsSimilarUsersLoading(false)
        }
      }

      fetchSimilarUsers()
    }
  }, [user, isLoading])

  // Skeleton loading dla całej strony
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-6">
          <div className="relative h-40 w-full rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 mb-16">
            <div className="absolute -bottom-12 left-6">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex gap-4 text-sm">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Użytkownik nie został znaleziony</h1>
            <Button onClick={() => router.push("/")}>Wróć do strony głównej</Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="relative h-40 w-full rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 mb-16">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.verified && (
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Zweryfikowana
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.bio}</p>
              {user.type === "business" && user.categories && user.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.categories.map((category: string) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Dołączył: {new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>Lokalizacja: {user.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  {user.type === "business" ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span>Typ konta: {user.type === "individual" ? "Osoba prywatna" : "Firma"}</span>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-bold">{user.stats.ads}</span> ogłoszeń
                </div>
                <div>
                  <span className="font-bold">{user.stats.views}</span> wyświetleń
                </div>
                <div>
                  <span className="font-bold">{user.stats.likes}</span> polubień
                </div>
              </div>

              {user.type === "business" && user.stats.reviews > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-500"
                        fill={star <= Math.round(user.stats.rating) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="font-bold">{user.stats.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({user.stats.reviews} opinii)</span>
                </div>
              )}
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Kontakt</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar users section */}
            {similarUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {user.type === "business" ? "Podobne firmy" : "Podobni użytkownicy"}
                </h3>

                {isSimilarUsersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {similarUsers.map((similarUser) => (
                      <Link href={`/profil/${similarUser.id}`} key={similarUser.id}>
                        <Card className="hover:border-primary/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={similarUser.avatar} alt={similarUser.name} />
                                <AvatarFallback>{similarUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-sm">{similarUser.name}</span>
                                  {similarUser.verified && (
                                    <span className="text-primary text-xs" title="Zweryfikowany">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{similarUser.location}</div>
                                {similarUser.categories && similarUser.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {similarUser.categories.map((category: string) => (
                                      <Badge key={category} variant="secondary" className="text-xs py-0">
                                        {category}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="ads">
              <TabsList className="w-full">
                <TabsTrigger value="ads" className="flex-1">
                  Ogłoszenia ({user.stats.ads})
                </TabsTrigger>
                {user.type === "business" && (
                  <TabsTrigger value="reviews" className="flex-1">
                    Opinie ({user.stats.reviews})
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="ads" className="mt-4">
                <AdFeed isUserProfile={true} userId={user.id} />
              </TabsContent>
              {user.type === "business" && (
                <TabsContent value="reviews" className="mt-4">
                  <h2 className="text-xl font-semibold mb-4">Opinie klientów</h2>
                  {user.stats.reviews && user.stats.reviews > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-5 w-5"
                              fill={star <= (user.stats.rating || 0) ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <span className="font-bold">{user.stats.rating?.toFixed(1)}</span>
                        <span className="text-muted-foreground">({user.stats.reviews} opinii)</span>
                      </div>
                      <UserReviews userId={user.id} />
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Brak opinii</p>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

