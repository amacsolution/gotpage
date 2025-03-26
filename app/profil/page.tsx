"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { useToast } from "@/hooks/use-toast"
import { AdFeed } from "@/components/ad-feed"
import { LikedAdsFeed } from "@/components/liked-ads-feed"
import { CompanyPromotion } from "@/components/company-promotion"
import { Star, Edit, Loader2 } from "lucide-react"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { UserReviews } from "@/components/user-reviews"
import { NewsPostForm } from "@/components/news-post-form"
import { NewsPost } from "@/components/news-post"

interface UserData {
  id: number
  name: string
  email: string
  phone: string
  bio: string
  avatar: string
  type: string
  verified: boolean
  joinedAt: string
  location: string
  categories: string[]
  stats: {
    ads: number
    views: number
    likes: number
    reviews?: number
    rating?: number
  }
  promotion?: {
    active: boolean
    plan: string
    endDate: string
  } | null
}

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nazwa musi mieć co najmniej 2 znaki",
  }),
  email: z.string().email({
    message: "Wprowadź poprawny adres email",
  }),
  phone: z.string().optional(),
  bio: z
    .string()
    .max(500, {
      message: "Bio nie może przekraczać 500 znaków",
    })
    .optional(),
  location: z.string().optional(),
})

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Pobieranie danych użytkownika - teraz z zoptymalizowanego endpointu
  const fetchUserData = async () => {
    try {
      setIsFetching(true)

      const response = await fetch("/api/profile", {
        // Dodanie cache: 'no-store' zapewnia, że dane będą zawsze aktualne
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Jeśli użytkownik nie jest zalogowany, przekieruj do strony logowania
          router.push("/login")
          return
        }
        throw new Error("Nie udało się pobrać danych profilu")
      }

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("Błąd podczas pobierania danych profilu:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych profilu",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [router, toast])

  // Inicjalizacja formularza po pobraniu danych
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
      location: "",
    },
  })

  
  // Aktualizacja wartości formularza po pobraniu danych
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
      })
    }
  }, [user, form])

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Wystąpił błąd podczas aktualizacji profilu")
      }

      const updatedUser = await response.json()

      // Aktualizacja stanu użytkownika
      setUser((prev) => ({
        ...prev!,
        ...updatedUser,
      }))

      toast({
        title: "Profil zaktualizowany",
        description: "Twoje dane zostały pomyślnie zaktualizowane",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji profilu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Pobieranie aktualności
  useEffect(() => {
    fetchPosts(1)
  }, [])

  const fetchPosts = async (pageNum: number) => {
    try {
      setIsLoading(true)

      const user = JSON.parse(localStorage.getItem("userData") || "{}")
      const response = await fetch(`/api/news?page=${pageNum}&limit=10&userId=${user.id}`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać aktualności")
      }

      const data = await response.json()

      console.log(data)

      if (pageNum === 1) {
        setPosts(data.posts)
      } else {
        setPosts((prev) => [...prev, ...data.posts])
      }

      console.log(data)
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

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const loadMore = () => {
    const nextPage = page + 1
    fetchPosts(nextPage)
  }


  // Skeleton loading dla całej strony
  if (isFetching) {
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
            <h1 className="text-2xl font-bold mb-4">Nie znaleziono danych użytkownika</h1>
            <Button onClick={() => router.push("/login")}>Zaloguj się</Button>
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
            <ProfileImageUpload
              userId={user.id}
              currentAvatar={user.avatar}
              userName={user.name}
              onAvatarUpdate={(newAvatarUrl) => {
                setUser((prev) => (prev ? { ...prev, avatar: newAvatarUrl } : null))
              }}
            />
          </div>
          <div className="absolute bottom-4 right-4">
            <Button
              variant="outline"
              size="sm"
              className="bg-background"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edytuj profil
            </Button>
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
              {user.categories && user.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Dołączył: {new Date(user.joinedAt).toLocaleDateString()}</p>
                <p>Lokalizacja: {user.location || "Nie podano"}</p>
                <p>Typ konta: {user.type === "individual" ? "Osoba prywatna" : "Firma"}</p>
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
            </div>

            {isEditing ? (
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Edytuj profil</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{user.type === "business" ? "Nazwa firmy" : "Imię i nazwisko"}</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lokalizacja</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} placeholder="np. Warszawa, Mazowieckie" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>O {user.type === "business" ? "firmie" : "sobie"}</FormLabel>
                            <FormControl>
                              <Textarea className="resize-none" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormDescription>Krótki opis, który będzie widoczny na Twoim profilu</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                        >
                          Anuluj
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Zapisywanie...
                            </>
                          ) : (
                            "Zapisz zmiany"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Telefon</h3>
                    <p>{user.phone || "Nie podano"}</p>
                  </div>
                  <div>
                    <Link href="/change-password">
                      <Button variant="outline" size="sm">
                        Zmień hasło
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="tablica">
              <TabsList className="w-full">
              <TabsTrigger value="tablica" className="flex-1">
                  Tablica
                </TabsTrigger>
                <TabsTrigger value="ads" className="flex-1">
                  Moje ogłoszenia
                </TabsTrigger>
                <TabsTrigger value="liked" className="flex-1">
                  Polubione
                </TabsTrigger>
                {user.type === "business" && (
                  <>
                    <TabsTrigger value="reviews" className="flex-1">
                      Opinie
                    </TabsTrigger>
                    <TabsTrigger value="promotion" className="flex-1">
                      Promowanie
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
              <TabsContent value="tablica" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Wpisy</h2>
                  <Link href="/aktualnosci">
                    <Button>Dodaj wpis</Button>
                  </Link>
                </div>
                {user && (
                  <NewsPostForm
                    user={{
                      id: user.id,
                      name: user.name,
                      avatar:
                        user.avatar ||
                        `/placeholder.svg?height=40&width=40&text=${user.name.substring(0, 2).toUpperCase()}`,
                    }}
                    onPostCreated={handlePostCreated}
                  />
                )}
    
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
              </TabsContent>
              <TabsContent value="ads" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Moje ogłoszenia</h2>
                  <Link href="/ogloszenia/dodaj">
                    <Button>Dodaj ogłoszenie</Button>
                  </Link>
                </div>
                <AdFeed isUserProfile={true} userId={user.id} />
              </TabsContent>
              <TabsContent value="liked" className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Polubione ogłoszenia</h2>
                <LikedAdsFeed userId={user.id} />
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
                        <span className="font-bold">{Number(user.stats.rating)?.toFixed(1)}</span>
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
              {user.type === "business" && (
                <TabsContent value="promotion" className="mt-4">
                  <CompanyPromotion
                    isPromoted={user.promotion?.active || false}
                    promotionEndDate={user.promotion?.endDate}
                    promotionPlan={user.promotion?.plan}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

