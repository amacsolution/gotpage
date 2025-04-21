"use client"

import { useState, useEffect, use } from "react"
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
import {
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  User,
  Globe,
  Book,
  BookUser,
  Briefcase,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { UserReviews } from "@/components/user-reviews"
import { CompanyCard } from "@/components/company-card"
import { NewsPost } from "@/components/news-post"
import { FollowButton } from "@/components/follow-button"
import { FollowStats } from "@/components/follow-stats"
import { set } from "date-fns"

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params) // Unwrap the params object
  const id = unwrappedParams.id
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [similarUsers, setSimilarUsers] = useState<any[]>([])
  const [isSimilarUsersLoading, setIsSimilarUsersLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(false)

  const loggedUser = JSON.parse(localStorage.getItem("userData") || "null")
  // Utworzenie lokalnej zmiennej dla ID do użycia w tablicy zależności
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/users/${id}`)
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }
        setIsFollowing(data.isFollowing)

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
  }, [id, toast])

  useEffect(() => {
    fetchPosts(1, id)
  }, [])

  const fetchPosts = async (pageNum: number, id: string) => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/news?page=${pageNum}&limit=10&userId=${id}`)

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


  // Pobieranie podobnych użytkowników z niższym priorytetem
  useEffect(() => {
    if (user && !isLoading) {
      const fetchSimilarUsers = async () => {
        try {
          setIsSimilarUsersLoading(true)
          const response = await fetch(`/api/users/similar?id=${user.id}&type=${user.type}`) //&type=${user.type} do konkretnego wyszukiwania podobnych profili
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

  const loadMore = () => {
    const nextPage = page + 1
    fetchPosts(nextPage, id)
  }

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
      <div
          className={`relative profile-background h-40 w-full rounded-xl mb-16 ${
            user.background_img ? "bg-cover bg-center" : ""
          }`}
          style={
            user.background_img
              ? {
                  backgroundImage: `url(${user.background_img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: "linear-gradient(135deg, #e5308a 0%, #7c2ae8 100%)",
                }
          } >
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
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
                {user.verified ? (
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Zweryfikowana
                  </Badge>
                ): "" }
              </div>
              
                <div className="mt-2 md:mt-0 flex items-center gap-4">
                {loggedUser.id !== id && (
                  <FollowButton
                  userId={user.id}
                  isFollowing={isFollowing}
                  onFollowChange={(following) => {
                  setIsFollowing(following);
                  setUser((prevUser: any) => ({
                    ...prevUser,
                    stats: {
                    ...prevUser.stats,
                    followers: following
                      ? (prevUser.stats.followers || 0) + 1
                      : (prevUser.stats.followers || 0) - 1,
                    },
                  }));
                  }}
                />
                )}
                
                <FollowStats
                  userId={user.id}
                  followers={user.stats.followers || 0}
                  following={user.stats.following || 0}
                />
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
                    <a href={`tel:${user.phone}`}>
                      <Button variant="outline" className="w-full justify-start my-1" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {user.phone}
                      </Button>
                    </a>
                    <a href={`mailto:${user.email}`}>
                      <Button variant="outline" className="w-full justify-start my-1" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </Button>
                    </a>
                    {user.website && (
                      <a href={user.website} rel="nofollow">
                        <Button variant="outline" className="w-full justify-start my-1" size="sm">
                          <Globe className="h-4 w-4 mr-2" />
                          {user.website}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Opis</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full h-auto justify-start align-top p-4" size="sm">
                      <Book className="h-4 w-4 mr-2" />
                      <p className="whitespace-normal break-words text-left">{user.description}</p>
                    </Button>
                    {user.company_size && (
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <BookUser className="h-4 w-4 mr-2" />
                        Ilość pracowników {user.company_size}
                      </Button>
                    )}
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
                  <div className="flex flex-col gap-3">
                    {similarUsers.map((similarUser) =>
                      similarUser.type === "business" ? (
                        <CompanyCard key={similarUser.id} company={similarUser} />
                      ) : (
                        <Link href={`/profil/${similarUser.id}`} key={similarUser.id}>
                          <Card className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={similarUser.avatar || "/placeholder-user.jpg"} alt={similarUser.name} />
                                    <AvatarFallback>{similarUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-sm">{similarUser.name}</span>
                                      {similarUser.verified ? (
                                        <span className="text-primary text-xs" title="Zweryfikowany">
                                          <ShieldCheck className="h-4 w-4" />
                                        </span>
                                      ) : ""}
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
                                <FollowButton
                                  userId={similarUser.id}
                                  isFollowing={similarUser.isFollowing || false}
                                  size="sm"
                                  />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="tab">
              <TabsList className="w-full overflow-x-auto whitespace-nowrap no-scrollbar">
                <TabsTrigger value="tab" className="flex-1">
                  Tablica
                </TabsTrigger>
                <TabsTrigger value="ads" className="flex-1">
                  Ogłoszenia ({user.stats.ads})
                </TabsTrigger>
                {user.type === "business" && (
                  <TabsTrigger value="reviews" className="flex-1">
                    Opinie ({user.stats.reviews})
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="tab" className="mt-4">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Informacje</h2>
                  {user.type === "individual" && <p>{user.bio}</p>}
                  {user.type === "individual" && (
                    <>
                      {user.occupation && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{user.occupation}</span>
                        </div>
                      )}
                      {user.interests && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>{user.interests}</span>
                        </div>
                      )}
                    </>
                  )}
                  {user.type === "business" && (
                    <>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold mb-2">Dane firmy</h3>
                          {user.businessData?.nip && (
                            <div className="flex items-center gap-2 text-muted-foreground my-1">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <p>
                                NIP: <span className="text-foreground">{user.businessData.nip}</span>
                              </p>
                            </div>
                          )}
                          {user.businessData?.krs && (
                            <div className="flex items-center gap-2 text-muted-foreground my-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>
                                KRS: <span className="text-foreground">{user.businessData.krs}</span>
                              </span>
                            </div>
                          )}
                          {user.businessData?.regon && (
                            <div className="flex items-center gap-2 text-muted-foreground my-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>
                                REGON: <span className="text-foreground">{user.businessData.regon}</span>
                              </span>
                            </div>
                          )}
                          {user.location && (
                            <div className="flex items-center gap-2 text-muted-foreground my-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Lokalizacja: <span className="text-foreground">{user.location}</span>
                              </span>
                            </div>
                          )}
                          {user.company_size && (
                            <div className="flex items-center gap-2 text-muted-foreground my-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Wielkość firmy: <span className="text-foreground">{user.company_size}</span>
                              </span>
                            </div>
                          )}
                          {user.website && (
                            <div className="flex items-center gap-2 my-1">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <Link href={user.website} className="hover:underline">
                                {user.website}
                              </Link>
                            </div>
                          )}
                          {user.categories && user.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 my-2">
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Kategorie</h3>
                              {user.categories.map((category: string) => (
                                <Badge key={category} variant="secondary">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 mt-6">Aktualności</h3>
                <div className="mt-4">
                  {isLoading && posts.length === 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <>
                      {posts.map((post) => (
                        <NewsPost key={post.id} post={post} />
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
                      <p className="text-muted-foreground">Dodaj nowy wpis i daj się poznać!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
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
