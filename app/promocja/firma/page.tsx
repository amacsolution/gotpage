"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Building,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  ChevronRight,
  Star,
  Crown,
  Shield,
  Rocket,
  LineChart,
  Briefcase,
  Eye,
  ArrowDown,
  ArrowUpNarrowWide,
} from "lucide-react"
import { CompanyCard } from "@/components/company-card"
import { Arrow } from "@radix-ui/react-select"

const business = {
  id: 1,
  name: "Auto Serwis Kowalski",
  logo: "/logo-mock.png?height=100&width=100&text=Auto+Serwis",
  description:
    "Profesjonalny serwis samochodowy z wieloletnim doświadczeniem. Oferujemy naprawy mechaniczne, elektryczne, diagnostykę komputerową oraz wymianę opon.",
  categories: ["Motoryzacja", "Usługi"],
  location: "Warszawa",
  rating: 4.8,
  reviewCount: 124,
  verified: true,
};

export default function PromoteBusinessPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState("professional")

  // Symulacja ładowania danych
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handlePromote = () => {
    toast({
      title: "Przekierowanie do płatności",
      description: "Za chwilę zostaniesz przekierowany do systemu płatności",
    })
    // W rzeczywistej implementacji przekierowanie do Stripe
    // window.location.href = `/api/stripe/create-checkout?plan=${selectedPlan}&type=business`
  }

  const plans = [
    {
      id: "business",
      name: "Business",
      price: 80,
      duration: "30 dni",
      features: [
        "Wyróżniony profil firmy",
        "Priorytetowe wyświetlanie ogłoszeń",
        "Ogłoszenia bez limitu",
        "Oznaczenie jako 'Zweryfikowana Firma'",
        "Statystyki wyświetleń i kliknięć",
        "Dostęp do panelu analitycznego",
      ],
      color: "bg-blue-600",
      icon: <Building className="h-5 w-5" />,
    },
    {
      id: "professional",
      name: "Professional",
      price: 109,
      duration: "30 dni",
      features: [
        "Wszystkie funkcje Business",
        "Wyświetlanie w sekcji polecanych firm",
        "Wyróżnienie w wynikach wyszukiwania",
        "Rozszerzone statystyki i analityka",
        "Priorytetowa obsługa klienta",
        "Ogłoszenia wyróżnione na stronie głównej",
      ],
      color: "bg-purple-600",
      popular: true,
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 149,
      duration: "30 dni",
      features: [
        "Wszystkie funkcje Professional",
        "Wyświetlanie na stronie głównej",
        "Dedykowany baner reklamowy",
        "Pełne statystyki i analityka biznesowa",
        "Dedykowany opiekun klienta",
        "Priorytetowe pozycjonowanie we wszystkich kategoriach",
      ],
      color: "bg-amber-600",
      icon: <Crown className="h-5 w-5" />,
    },
  ]

  const stats = [
    {
      title: "Więcej klientów",
      value: "5.2x",
      description: "Firmy z pakietem Premium zyskują średnio 5.2x więcej klientów miesięcznie",
      icon: <Users className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Wzrost rozpoznawalności",
      value: "87%",
      description: "87% firm odnotowuje znaczący wzrost rozpoznawalności marki",
      icon: <TrendingUp className="h-8 w-8 text-amber-500" />,
    },
    {
      title: "Wyższe przychody",
      value: "3.7x",
      description: "Firmy z pakietem Premium notują średnio 3.7x wyższe przychody",
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
    },
  ]

  const testimonials = [
    {
      name: "Anna Kowalska",
      company: "Nieruchomości Premium",
      content:
        "Dzięki pakietowi Professional nasza firma zyskała znacznie większą widoczność. Liczba zapytań wzrosła o ponad 200% w ciągu pierwszego miesiąca!",
      avatar: "/placeholder.svg?height=60&width=60&text=AK",
      rating: 5,
    },
    {
      name: "Jan Nowak",
      company: "Auto-Serwis Nowak",
      content:
        "Pakiet Business całkowicie odmienił naszą obecność online. Klienci znacznie częściej wybierają nasze usługi, a my możemy śledzić wszystkie statystyki.",
      avatar: "/placeholder.svg?height=60&width=60&text=JN",
      rating: 4,
    },
    {
      name: "Marek Wiśniewski",
      company: "Tech Solutions",
      content:
        "Enterprise to strzał w dziesiątkę dla naszej firmy. Dedykowany opiekun pomógł nam zoptymalizować profil, a wyniki przeszły nasze najśmielsze oczekiwania.",
      avatar: "/placeholder.svg?height=60&width=60&text=MW",
      rating: 5,
    },
  ]

  return (
    <PageLayout>
      <div className="relative overflow-hidden">
        {/* Hero section */}
        <div className="relative bg-gradient-to-b from-blue-700 to-background py-24 px-4 sm:px-6 lg:px-8">
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
                    <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">Rozwiń swój biznes z nami</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      Zwiększ widoczność swojej <span className="text-amber-300">firmy</span> już dziś
                    </h1>
                    <p className="text-lg text-white/90 mb-8">
                      Promowane profile firm przyciągają więcej klientów, budują zaufanie i zwiększają sprzedaż.
                      Zainwestuj w promocję i wyprzedź konkurencję!
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        className="bg-white text-blue-700 hover:bg-white/90"
                        onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
                      >
                        Wybierz pakiet
                      </Button>
                      <Button className="bg-primary text-white transition-all hover:bg-primary/70 hover:text-white" size="lg" variant="outline" onClick={() => document.getElementById("more")?.scrollIntoView({ behavior: "smooth" })}>
                        Dowiedz się więcej <ArrowDown className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                ) : (
                  <div className="relative z-10 transform hover:scale-110 scale-105 transition-transform duration-300">
                    <CompanyCard company={business}/>
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
              <h2 className="text-3xl font-bold mb-4">Dlaczego warto promować firmę?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Promowane profile firm osiągają znacznie lepsze wyniki niż standardowe. Oto co możesz zyskać:
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
                          <span className="text-3xl font-bold text-primary counter-effect">{stat.value}</span>
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
              <h2 className="text-3xl font-bold mb-4">Wybierz pakiet promocyjny dla swojej firmy</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Oferujemy różne pakiety promocyjne dopasowane do potrzeb Twojej firmy. Wybierz ten, który najlepiej
                odpowiada Twoim oczekiwaniom.
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
                <Tabs defaultValue="professional" className="w-full" onValueChange={setSelectedPlan}>
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                  </TabsList>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                      <div key={plan.id} className="relative">
                        <Card
                          className={`h-full border-2 transition-all duration-300 ${selectedPlan === plan.id ? "border-primary shadow-lg scale-105 z-10" : "border-muted hover:border-primary/50"}`}
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

        {/* Opinie klientów */}
        <div className="py-16 bg-blue-700/10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Co mówią nasi klienci</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Poznaj opinie firm, które skorzystały z naszych pakietów promocyjnych.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="relative">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Image
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <h3 className="font-bold">{testimonial.name}</h3>
                            <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                          </div>
                        </div>

                        <div className="flex mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < testimonial.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>

                        <p className="text-muted-foreground">"{testimonial.content}"</p>
                      </CardContent>
                    </Card>
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
                Dołącz do zadowolonych klientów <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Korzyści */}
        <div id="more" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Korzyści z promowania firmy</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Promowanie profilu firmy to inwestycja, która przynosi wymierne korzyści. Oto co zyskujesz:
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: "Większa widoczność",
                    description:
                      "Twoja firma będzie wyświetlana na górze wyników wyszukiwania i w sekcjach polecanych.",
                    icon: <Eye className="h-10 w-10 text-blue-500" />,
                  },
                  {
                    title: "Budowanie zaufania",
                    description: "Oznaczenie 'Zweryfikowana Firma' buduje zaufanie wśród potencjalnych klientów.",
                    icon: <Shield className="h-10 w-10 text-green-500" />,
                  },
                  {
                    title: "Więcej klientów",
                    description: "Zwiększona widoczność przekłada się na większą liczbę zapytań i klientów.",
                    icon: <Users className="h-10 w-10 text-purple-500" />,
                  },
                  {
                    title: "Ogłoszenia promowane",
                    description: "Twoje ogłoszenia będą wyświetlane na górze wyników i w sekcjach polecanych.",
                    icon: <ArrowUpNarrowWide className="h-10 w-10 text-amber-500" />,
                  },
                  {
                    title: "Przewaga konkurencyjna",
                    description: "Wyróżnij się na tle konkurencji i przyciągnij więcej klientów.",
                    icon: <Award className="h-10 w-10 text-red-500" />,
                  },
                  {
                    title: "Szybszy rozwój",
                    description: "Promowane firmy rozwijają się średnio 3x szybciej niż niepromowane.",
                    icon: <Rocket className="h-10 w-10 text-blue-500" />,
                  },
                  {
                    title: "Profesjonalny wizerunek",
                    description: "Buduj profesjonalny wizerunek swojej firmy i zwiększaj jej rozpoznawalność.",
                    icon: <Briefcase className="h-10 w-10 text-indigo-500" />,
                  },
                  {
                    title: "Wyższe przychody",
                    description: "Więcej klientów i większa rozpoznawalność przekładają się na wyższe przychody.",
                    icon: <BarChart3 className="h-10 w-10 text-green-500" />,
                  },
                ].map((benefit, index) => (
                  <div key={index} className="relative">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="mb-4 p-3 rounded-full bg-primary/10">{benefit.icon}</div>
                        <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 bg-blue-700 text-white px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Gotowy, aby rozwinąć swoją firmę?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Nie czekaj, aż konkurencja Cię wyprzedzi. Promuj swoją firmę już teraz i zwiększ swoje szanse na sukces!
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-white/90"
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

