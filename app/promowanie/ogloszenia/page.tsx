"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AdCard } from "@/components/ad-card"
import { Sparkles, TrendingUp, Eye, BarChart3, Zap, CheckCircle2, ChevronRight, Crown, ChevronDown } from "lucide-react"

// Add a new interface for promoted ads
interface PromotedAd {
  id: number
  title: string
  content: string
  category: string
  subcategory?: string
  price: number | null
  currency?: string
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

export default function PromoteAdsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState("standard")
  const [promotedAds, setPromotedAds] = useState<PromotedAd[]>([])

  // Fetch promoted ads from the API
  useEffect(() => {
    const fetchPromotedAds = async () => {
      setIsLoading(true)
      try {
        // Fetch only promoted ads with limit=3
        const response = await fetch("/api/ads?promoted=true&limit=3")
        if (!response.ok) {
          throw new Error("Failed to fetch promoted ads")
        }

        const data = await response.json()
        if (data.ads && Array.isArray(data.ads)) {
          setPromotedAds(data.ads)
        }
      } catch (error) {
        console.error("Error fetching promoted ads:", error)
        toast({
          title: "Error",
          description: "Nie udało się pobrać promowanych ogłoszeń",
          variant: "destructive",
        })
        // Set fallback example ads if fetch fails
        setPromotedAds([exampleAd])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotedAds()
  }, [toast])

  const handlePromote = () => {
    toast({
      title: "Przekierowanie do płatności",
      description: "Za chwilę zostaniesz przekierowany do systemu płatności",
    })
    // W rzeczywistej implementacji przekierowanie do Stripe
    // window.location.href = `/api/stripe/create-checkout?plan=${selectedPlan}&type=ad`
  }

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 9.99,
      duration: "7 dni",
      features: [
        "Wyróżnienie na liście ogłoszeń",
        "Oznaczenie jako 'Promowane'",
        "Wyższe pozycjonowanie",
      ],
      color: "bg-blue-500",
      icon: <Sparkles className="h-5 w-5" />,
      link: "/checkout/?plan=basic&type=ad",
    },
    {
      id: "standard",
      name: "Standard",
      price: 19.99,
      duration: "14 dni",
      features: [
        "Wszystkie funkcje Basic",
        "Wyświetlanie w sekcji polecanych",
        "Odświeżanie ogłoszenia co 3 dni",
        "Priorytetowe wyświetlanie w wynikach wyszukiwania",

      ],
      color: "bg-purple-500",
      popular: true,
      icon: <TrendingUp className="h-5 w-5" />,
      link: "/checkout/?plan=standard&type=ad",
    },
    {
      id: "premium",
      name: "Premium",
      price: 39.99,
      duration: "Miesiąc",
      features: [
        "Wszystkie funkcje Standard i Basic",
        "Wyświetlanie na stronie głównej",
        "Odświeżanie ogłoszenia codziennie",
        "Wyróżnienie w powiadomieniach",
        "Priorytetowa obsługa klienta",
      ],
      color: "bg-amber-500",
      icon: <Crown className="h-5 w-5" />,
      link: "/checkout/?plan=premium&type=ad",
    },
  ]

  const stats = [
    {
      title: "Więcej wyświetleń",
      value: "3.5x",
      description: "Promowane ogłoszenia mają średnio 3.5x więcej wyświetleń",
      icon: <Eye className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Szybsza sprzedaż",
      value: "70%",
      description: "70% promowanych ogłoszeń znajduje nabywcę w ciągu 7 dni",
      icon: <Zap className="h-8 w-8 text-amber-500" />,
    },
    {
      title: "Wyższa konwersja",
      value: "2.8x",
      description: "Promowane ogłoszenia otrzymują 2.8x więcej wiadomości",
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
    },
  ]

  // Przykładowe dane ogłoszenia do wyświetlenia w AdCard (jako fallback)
  const exampleAd = {
    id: 1,
    title: "Nowoczesny apartament w centrum miasta",
    content:
      "Przestronny apartament z pięknym widokiem na miasto. Doskonała lokalizacja, blisko komunikacji miejskiej i sklepów.",
    category: "Nieruchomości",
    subcategory: "Mieszkania",
    price: 499000,
    currency: "PLN",
    location: "Warszawa, Mazowieckie",
    images: ["/placeholder.svg?height=300&width=500&text=Przykładowe+ogłoszenie"],
    createdAt: new Date(),
    promoted: true,
    author: {
      id: 1,
      name: "Jan Kowalski",
      avatar: "/placeholder.svg?height=40&width=40&text=JK",
      type: "individual",
      verified: true,
    },
    likes: 24,
    comments: 5,
  }

  return (
    <PageLayout>
      <div className="relative overflow-hidden">
        {/* Hero section */}
        <div className="relative bg-gradient-to-b from-primary/90 to-background py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <div className="flex gap-4 mt-6">
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                      Zwiększ swoje szanse na sprzedaż
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Wyróżnij swoje ogłoszenie i <span className="text-amber-300">sprzedaj szybciej</span>
                    </h1>
                    <p className="text-lg text-white/90 mb-8">
                      Promowane ogłoszenia przyciągają więcej uwagi, otrzymują więcej wyświetleń i sprzedają się
                      szybciej. Zainwestuj w promocję i wyróżnij się na tle konkurencji!
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90"
                        onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
                      >
                        Wybierz pakiet
                      </Button>
                      <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                        Dowiedz się więcej
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                ) : (
                  <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
                    {promotedAds.length > 0 && <AdCard ad={promotedAds[0]} />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="py-16 bg-background">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Dlaczego warto promować ogłoszenia?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Promowane ogłoszenia osiągają znacznie lepsze wyniki niż standardowe. Oto co możesz zyskać:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="relative">
                  {isLoading ? (
                    <Skeleton className="h-48 w-full rounded-lg" />
                  ) : (
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          {stat.icon}
                          <span className="text-3xl font-bold text-primary">{stat.value}</span>
                        </div>
                        <CardTitle className="text-xl mt-4">{stat.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{stat.description}</CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pakiety promocyjne */}
        <div id="plans" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Wybierz pakiet promocyjny</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Oferujemy różne pakiety promocyjne dopasowane do Twoich potrzeb. Wybierz ten, który najlepiej odpowiada
                Twoim oczekiwaniom.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Skeleton className="h-[500px] w-full rounded-lg" />
                  <Skeleton className="h-[500px] w-full rounded-lg" />
                  <Skeleton className="h-[500px] w-full rounded-lg" />
                </div>
              </div>
            ) : (
              <>
                <Tabs defaultValue="standard" className="w-full" onValueChange={setSelectedPlan}>
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                  </TabsList>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                      <div key={plan.id} className="relative">
                        <Card
                          className={`h-full border-2 transition-all duration-300 ${selectedPlan === plan.id ? "border-primary shadow-lg scale-105 z-10" : "border-muted hover:border-primary/50"}`} onClick={() => setSelectedPlan(plan.id)}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 left-0 right-0 flex justify-center">
                              <Badge className="bg-primary">Najpopularniejszy</Badge>
                            </div>
                          )}
                          <CardHeader className={`${plan.color} text-white rounded-t-lg`}>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-xl">{plan.name}</CardTitle>
                              {plan.icon}
                            </div>
                            <div className="mt-4">
                              <span className="text-3xl font-bold">{plan.price} PLN</span>
                              <span className="text-white/80 ml-1">/ {plan.duration}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <ul className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button
                              className={`w-full ${selectedPlan === plan.id ? "bg-primary" : "bg-muted-foreground/80"}`}
                              onClick={handlePromote}
                            >
                              {selectedPlan === plan.id ? "Wybierz ten pakiet" : "Wybierz"}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    ))}
                  </div>
                </Tabs>
              </>
            )}
          </div>
        </div>

        {/* Przykłady promowanych ogłoszeń */}
        <div className="py-16 bg-primary/10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Przykłady promowanych ogłoszeń</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Zobacz, jak wyglądają promowane ogłoszenia i jak wyróżniają się na tle innych.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="h-[350px] w-full rounded-lg" />
                <Skeleton className="h-[350px] w-full rounded-lg" />
                <Skeleton className="h-[350px] w-full rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {promotedAds.length > 0
                  ? promotedAds.map((ad) => (
                      <div key={ad.id} className="transform hover:scale-105 transition-transform duration-300">
                        <AdCard ad={ad}/>
                      </div>
                    ))
                  : // Fallback to example ads if no promoted ads are available
                    [
                      {
                        ...exampleAd,
                        id: 2,
                        title: "Nowoczesny laptop gamingowy",
                        content: "Wydajny laptop dla graczy z najnowszą kartą graficzną i procesorem.",
                        category: "Elektronika",
                        subcategory: "Laptopy",
                        price: 5999,
                      },
                      {
                        ...exampleAd,
                        id: 3,
                        title: "Apartament z widokiem na morze",
                        content: "Luksusowy apartament z panoramicznym widokiem na morze, blisko plaży.",
                        location: "Gdańsk, Pomorskie",
                        price: 899000,
                      },
                      {
                        ...exampleAd,
                        id: 4,
                        title: "Samochód terenowy 4x4",
                        content: "Niezawodny samochód terenowy, idealny na wyprawy w trudnym terenie.",
                        category: "Motoryzacja",
                        subcategory: "Samochody",
                        price: 89900,
                      },
                    ].map((ad) => (
                      <div key={ad.id} className="transform hover:scale-105 transition-transform duration-300">
                        <AdCard ad={ad} image={ad.images[0].image_url}/>
                      </div>
                    ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="bg-primary"
                onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
              >
                Promuj swoje ogłoszenie <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sekcja FAQ */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Często zadawane pytania</h2>
              <p className="text-lg text-muted-foreground">
                Masz pytania dotyczące promocji ogłoszeń? Znajdź odpowiedzi poniżej.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {[
                  {
                    id: 1,
                    question: "Jak długo trwa promocja ogłoszenia?",
                    answer:
                      "Czas trwania promocji zależy od wybranego pakietu. Oferujemy pakiety na 7, 14 lub 30 dni. Po zakończeniu okresu promocji, ogłoszenie wraca do standardowego wyświetlania.",
                  },
                  {
                    id: 2,
                    question: "Czy mogę przedłużyć promocję?",
                    answer:
                      "Tak, możesz przedłużyć promocję w dowolnym momencie. Wystarczy, że wybierzesz opcję 'Przedłuż promocję' w panelu zarządzania ogłoszeniem.",
                  },
                  {
                    id: 3,
                    question: "Jak płacić za promocję?",
                    answer:
                      "Akceptujemy płatności kartą kredytową, BLIK, przelewem bankowym oraz przez popularne systemy płatności elektronicznych.",
                  },
                  {
                    id: 4,
                    question: "Czy mogę anulować promocję?",
                    answer:
                      "Promocji nie można anulować po jej rozpoczęciu. Jeśli masz problemy z promowanym ogłoszeniem, skontaktuj się z naszym działem obsługi klienta.",
                  },
                  {
                    id: 5,
                    question: "Jak sprawdzić efekty promocji?",
                    answer:
                      "W panelu zarządzania ogłoszeniem znajdziesz szczegółowe statystyki dotyczące wyświetleń, kliknięć i innych metryk, które pozwolą Ci ocenić skuteczność promocji.",
                  },
                ].map((faq, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg inline-flex justify-between w-full">
                        {faq.question}
                        <ChevronDown
                          className="h-5 w-5 text-foreground"
                          onClick={() => document.getElementById(`faq${faq.id}`)?.classList.toggle("hidden")}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="hidden" id={`faq${faq.id}`}>
                      <p>{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 bg-primary text-white px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Gotowy, aby wyróżnić swoje ogłoszenie?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Nie czekaj, aż Twoje ogłoszenie zginie w tłumie. Promuj je już teraz i zwiększ swoje szanse na szybką
              sprzedaż!
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
            >
              Wybierz pakiet promocyjny
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

