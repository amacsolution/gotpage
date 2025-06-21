"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Rocket, CheckCircle, Sparkles, Crown, ArrowLeft } from "lucide-react"

// Mock data dla ogłoszeń użytkownika
// const userAds = [
//   {
//     id: 1,
//     title: "Sprzedam samochód Toyota Corolla 2018",
//     category: "Motoryzacja",
//     price: 55000,
//     image: "/placeholder.svg?height=100&width=100",
//     promoted: false,
//   },
//   {
//     id: 2,
//     title: "Wynajmę mieszkanie w centrum Warszawy",
//     category: "Nieruchomości",
//     price: 2800,
//     image: "/placeholder.svg?height=100&width=100",
//     promoted: false,
//   },
//   {
//     id: 3,
//     title: "Laptop Dell XPS 15 - stan idealny",
//     category: "Elektronika",
//     price: 4500,
//     image: "/placeholder.svg?height=100&width=100",
//     promoted: false,
//   },
//   {
//     id: 4,
//     title: "Usługi remontowe - kompleksowo",
//     category: "Usługi",
//     price: null,
//     image: "/placeholder.svg?height=100&width=100",
//     promoted: true,
//   },
//   {
//     id: 5,
//     title: "iPhone 13 Pro - nowy, nieużywany",
//     category: "Elektronika",
//     price: 3800,
//     image: "/placeholder.svg?height=100&width=100",
//     promoted: false,
//   },
// ]

// Plany promocji
const promotionPlans = [
  {
    id: "standard",
    title: "Standard",
    description: "Wyróżnij swoje ogłoszenie na liście wyników wyszukiwania na 7 dni",
    price: 9.99,
    features: ["Wyróżnienie kolorem", "Pozycjonowanie wyżej w wynikach", "7 dni promocji"],
    icon: <Rocket className="h-6 w-6" />,
  },
  {
    id: "premium",
    title: "Premium",
    description: "Twoje ogłoszenie będzie wyświetlane na górze listy przez 14 dni",
    price: 24.99,
    features: ["Wszystko co w Standard", "Wyświetlanie na górze listy", "14 dni promocji", "Większe zdjęcia"],
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: "vip",
    title: "VIP",
    description: "Maksymalna widoczność i wyróżnienie ogłoszenia przez 30 dni",
    price: 39.90,
    features: [
      "Wszystko co w Premium",
      "Wyświetlanie na stronie głównej",
      "30 dni promocji",
      "Oznaczenie VIP",
      "Priorytetowe wsparcie",
    ],
    icon: <Crown className="h-6 w-6" />,
  },
]

// Zniżki za ilość
const discounts = [
  { count: 2, discount: 0.15, label: "15%" },
  { count: 3, discount: 0.2, label: "20%" },
  { count: 5, discount: 0.4, label: "40%" },
]

export default function PromotePackagePage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalAds, setTotalAds] = useState(0)
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { toast } = useToast()
  const [selectedAds, setSelectedAds] = useState<number[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>("standard")
  const [totalPrice, setTotalPrice] = useState(0)
  const [discountedPrice, setDiscountedPrice] = useState(0)
  const [appliedDiscount, setAppliedDiscount] = useState<{ rate: number; label: string } | null>(null)
  
  useEffect(() => {
    // Reset stanu przy zmianie filtrów
    setAds([])
    setPage(1)
    setHasMore(true)
    setIsLoading(true)
    fetchAds(1, sortBy)
  }, [ sortBy])

  const fetchAds = async (pageNum: number, sort: string) => {
    try {
      setIsLoading(true)

      const user = JSON.parse(localStorage.getItem("userData") || "{}")
      const userId = user.id || null

      // Budowanie URL zapytania
      let url =
        userId
          ? `/api/users/${userId}/ogloszenia?page=${pageNum}&limit=12&sortBy=${sort}`
          : `/api/ogloszenia?page=${pageNum}&limit=12&sortBy=${sort}`

      // Dodanie parametrów filtrowania

      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (pageNum === 1) {
        setAds(data.ads)
      } else {
        setAds((prev) => [...prev, ...data.ads])
      }

      setTotalAds(data.total)
      setHasMore(pageNum < data.totalPages)
    } catch (error) {
      //console.error("Błąd podczas pobierania ogłoszeń:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ogłoszeń. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Obliczanie ceny i zniżki
  useEffect(() => {
    const plan = promotionPlans.find((p) => p.id === selectedPlan)
    if (!plan) return

    const basePrice = plan.price * selectedAds.length
    setTotalPrice(basePrice)

    // Sprawdzenie, czy przysługuje zniżka
    let discount = null
    for (let i = discounts.length - 1; i >= 0; i--) {
      if (selectedAds.length >= discounts[i].count) {
        discount = discounts[i]
        break
      }
    }

    if (discount) {
      setAppliedDiscount({ rate: discount.discount, label: discount.label })
      setDiscountedPrice(basePrice * (1 - discount.discount))
    } else {
      setAppliedDiscount(null)
      setDiscountedPrice(basePrice)
    }
  }, [selectedAds, selectedPlan])

  const toggleAdSelection = (adId: number) => {
    setSelectedAds((prev) => (prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]))
  }

  const handlePromote = async () => {
    if (selectedAds.length === 0) {
      toast({
        title: "Wybierz ogłoszenia",
        description: "Musisz wybrać co najmniej jedno ogłoszenie do promocji",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {

      toast({
        title: "Promocja zakupiona",
        description: `Pomyślnie zakupiono promocję dla ${selectedAds.length} ogłoszeń`,
      })

      // Przekierowanie do strony płatności
      router.push("/ogloszenia/promuj/sukces")
    } catch (error) {
      toast({
        title: "Wystąpił błąd",
        description: "Nie udało się zakupić promocji. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="mb-6">
          <Link href="/ogloszenia" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Wróć do ogłoszeń
          </Link>
          <h1 className="text-3xl font-bold mb-2">Pakiety promocji ogłoszeń</h1>
          <p className="text-muted-foreground">
            Wybierz ogłoszenia, które chcesz promować i skorzystaj ze zniżek przy promocji wielu ogłoszeń jednocześnie.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wybierz ogłoszenia do promocji</CardTitle>
                <CardDescription>
                  Zaznacz ogłoszenia, które chcesz promować. Im więcej ogłoszeń wybierzesz, tym większą otrzymasz
                  zniżkę.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  {ads.map((ad) => (
                    <div key={ad.id} className={`${selectedAds.includes(ad.id) ? "border-primary border-1" : ""} inline-flex w-full items-center space-x-4 p-3 rounded-lg border`} onClick={() => toggleAdSelection(ad.id)}>
                      <Checkbox
                        id={`ad-${ad.id}`}
                        className="hidden"
                        checked={ads.includes(ad.id)}
                        onCheckedChange={() => toggleAdSelection(ad.id)}
                        disabled={ad.promoted}
                      />
                      <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={ad.image || "/placeholder.svg"}
                          alt={ad.title}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{ad.title}</h3>
                          {ad.promoted ? (
                            <Badge variant="outline" className="text-primary border-primary/30">
                              Już promowane
                            </Badge>
                          ) : ( "" )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ad.category}</span>
                          {ad.price && <span>{ad.price} PLN</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wybierz plan promocji</CardTitle>
                <CardDescription>Wybierz plan promocji, który najlepiej odpowiada Twoim potrzebom.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {promotionPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedPlan === plan.id ? "border-primary ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div
                            className={`p-2 rounded-full ${
                              plan.id === "standard"
                                ? "bg-blue-100 text-blue-500"
                                : plan.id === "premium"
                                  ? "bg-purple-100 text-purple-500"
                                  : "bg-amber-100 text-amber-500"
                            }`}
                          >
                            {plan.icon}
                          </div>
                          {selectedPlan === plan.id && <CheckCircle className="h-5 w-5 text-primary" />}
                        </div>
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-xl font-bold">{plan.price} PLN / ogłoszenie</p>
                        <ul className="mt-2 space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="text-xs flex items-center">
                              <CheckCircle className="h-3 w-3 mr-2 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Podsumowanie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wybrane ogłoszenia:</span>
                    <span className="font-medium">{selectedAds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan promocji:</span>
                    <span className="font-medium capitalize">
                      {promotionPlans.find((p) => p.id === selectedPlan)?.title || ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cena podstawowa:</span>
                    <span className="font-medium">{totalPrice.toFixed(2)} PLN</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Zniżka {appliedDiscount.label}:</span>
                      <span>-{(totalPrice - discountedPrice).toFixed(2)} PLN</span>
                    </div>
                  )}

                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Razem do zapłaty:</span>
                      <span>{discountedPrice.toFixed(2)} PLN</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Dostępne zniżki:</h4>
                  <ul className="space-y-1 text-sm">
                    {discounts.map((discount) => (
                      <li key={discount.count} className="flex items-center">
                        <CheckCircle
                          className={`h-4 w-4 mr-2 ${
                            selectedAds.length >= discount.count ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={selectedAds.length >= discount.count ? "font-medium" : "text-muted-foreground"}
                        >
                          {discount.label} zniżki przy {discount.count} lub więcej ogłoszeniach
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={handlePromote} disabled={isLoading || selectedAds.length === 0}>
                  {isLoading ? "Przetwarzanie..." : "Przejdź do płatności"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/ogloszenia")}>
                  Anuluj
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dlaczego warto promować?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-500 p-2 rounded-full">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Większa widoczność</h4>
                    <p className="text-sm text-muted-foreground">
                      Promowane ogłoszenia są wyświetlane na górze listy wyszukiwania.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-500 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Szybsza sprzedaż</h4>
                    <p className="text-sm text-muted-foreground">
                      Promowane ogłoszenia sprzedają się średnio 3x szybciej.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-500 p-2 rounded-full">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Wyróżnienie</h4>
                    <p className="text-sm text-muted-foreground">
                      Promowane ogłoszenia wyróżniają się specjalnym oznaczeniem.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

