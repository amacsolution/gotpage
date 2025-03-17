"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/page-layout"
import { useToast } from "@/hooks/use-toast"
import { AdFeed } from "@/components/ad-feed"
import { CompanyPromotion } from "@/components/company-promotion"
import { Camera, Edit, Star } from "lucide-react"

// Mock user data
const mockUser = {
  id: 1,
  name: "Firma XYZ",
  email: "kontakt@firmaxyz.pl",
  phone: "123456789",
  bio: "Profesjonalna firma z wieloletnim doświadczeniem. Oferujemy usługi najwyższej jakości.",
  avatar: "/placeholder.svg?height=100&width=100",
  type: "business",
  verified: true,
  joinedAt: new Date(2022, 5, 15),
  stats: {
    ads: 12,
    views: 450,
    likes: 28,
  },
  categories: ["Usługi", "Nieruchomości"],
  location: "Warszawa, Mazowieckie",
  promotionActive: false,
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
})

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      bio: mockUser.bio,
    },
  })

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    // Tutaj byłaby logika aktualizacji profilu
    setIsLoading(true)

    // Symulacja opóźnienia sieciowego
    setTimeout(() => {
      console.log(values)

      toast({
        title: "Profil zaktualizowany",
        description: "Twoje dane zostały pomyślnie zaktualizowane",
      })

      setIsEditing(false)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="relative h-40 w-full rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 mb-16">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback>{mockUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
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
                <h1 className="text-2xl font-bold">{mockUser.name}</h1>
                {mockUser.verified && (
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Zweryfikowana
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{mockUser.bio}</p>
              <div className="flex flex-wrap gap-2">
                {mockUser.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Dołączył: {mockUser.joinedAt.toLocaleDateString()}</p>
                <p>Lokalizacja: {mockUser.location}</p>
                <p>Typ konta: {mockUser.type === "individual" ? "Osoba prywatna" : "Firma"}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-bold">{mockUser.stats.ads}</span> ogłoszeń
                </div>
                <div>
                  <span className="font-bold">{mockUser.stats.views}</span> wyświetleń
                </div>
                <div>
                  <span className="font-bold">{mockUser.stats.likes}</span> polubień
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
                            <FormLabel>Nazwa firmy</FormLabel>
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
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>O firmie</FormLabel>
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
                          {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
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
                    <p>{mockUser.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Telefon</h3>
                    <p>{mockUser.phone || "Nie podano"}</p>
                  </div>
                  <div>
                    <Link href="/auth/change-password">
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
            <Tabs defaultValue="ads">
              <TabsList className="w-full">
                <TabsTrigger value="ads" className="flex-1">
                  Moje ogłoszenia
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex-1">
                  Zapisane
                </TabsTrigger>
                {mockUser.type === "business" && (
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
              <TabsContent value="ads" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Moje ogłoszenia</h2>
                  <Link href="/ogloszenia/dodaj">
                    <Button>Dodaj ogłoszenie</Button>
                  </Link>
                </div>
                <AdFeed isUserProfile={true} />
              </TabsContent>
              <TabsContent value="saved" className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Zapisane ogłoszenia</h2>
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
              </TabsContent>
              {mockUser.type === "business" && (
                <TabsContent value="reviews" className="mt-4">
                  <h2 className="text-xl font-semibold mb-4">Opinie klientów</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5" fill={star <= 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="font-bold">4.0</span>
                    <span className="text-muted-foreground">(12 opinii)</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AK</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Anna Kowalska</p>
                            <p className="text-xs text-muted-foreground">2 tygodnie temu</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4" fill={star <= 5 ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p>Świetna obsługa, szybka realizacja, polecam!</p>
                    </div>
                  </div>
                </TabsContent>
              )}
              {mockUser.type === "business" && (
                <TabsContent value="promotion" className="mt-4">
                  <CompanyPromotion
                    isPromoted={mockUser.promotionActive}
                    promotionEndDate="15.04.2025"
                    promotionPlan="Premium"
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

