"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Rocket, Sparkles, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CompanyPromotionProps {
  isPromoted: boolean
  promotionEndDate?: string
  promotionPlan?: string
}

export function CompanyPromotion({ isPromoted = false, promotionEndDate, promotionPlan }: CompanyPromotionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePromotionPurchase = async (plan: string) => {
    setIsLoading(true)

    // Symulacja opóźnienia
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Promocja zakupiona",
      description: `Twój profil będzie promowany przez 30 dni w planie ${plan}`,
    })

    setIsLoading(false)
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Promowanie profilu firmy</h2>

      {isPromoted ? (
        <div className="bg-primary/10 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Twój profil jest promowany</h3>
          </div>
          <p className="text-muted-foreground mb-2">
            Twój profil jest promowany do {promotionEndDate} w planie {promotionPlan}.
          </p>
          <Button variant="outline" size="sm">
            Przedłuż promocję
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground mb-6">
          Promuj swój profil, aby zwiększyć widoczność i przyciągnąć więcej klientów. Promowane profile są wyświetlane
          na stronie głównej oraz na górze wyników wyszukiwania.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plan Standard */}
        <Card>
          <CardHeader>
            <div className="p-2 rounded-full bg-blue-100 text-blue-500 w-fit">
              <Rocket className="h-6 w-6" />
            </div>
            <CardTitle>Standard</CardTitle>
            <CardDescription>Podstawowa promocja profilu firmy na 30 dni</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">50 PLN</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Wyróżnienie w katalogu firm</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Wyższa pozycja w wynikach wyszukiwania</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">30 dni promocji</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handlePromotionPurchase("Standard")} disabled={isLoading}>
              {isLoading ? "Przetwarzanie..." : "Wybierz"}
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Premium */}
        <Card className="border-primary">
          <CardHeader>
            <div className="p-2 rounded-full bg-purple-100 text-purple-500 w-fit">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle>Premium</CardTitle>
              <Badge variant="outline" className="text-primary border-primary/30">
                Popularne
              </Badge>
            </div>
            <CardDescription>Rozszerzona promocja profilu firmy na 30 dni</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">100 PLN</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Wszystko co w Standard</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Wyświetlanie na stronie głównej</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Większe logo firmy</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Oznaczenie "Premium"</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handlePromotionPurchase("Premium")} disabled={isLoading}>
              {isLoading ? "Przetwarzanie..." : "Wybierz"}
            </Button>
          </CardFooter>
        </Card>

        {/* Plan VIP */}
        <Card>
          <CardHeader>
            <div className="p-2 rounded-full bg-amber-100 text-amber-500 w-fit">
              <Crown className="h-6 w-6" />
            </div>
            <CardTitle>VIP</CardTitle>
            <CardDescription>Maksymalna promocja profilu firmy na 30 dni</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">200 PLN</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Wszystko co w Premium</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Najwyższa pozycja w wynikach</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Oznaczenie "VIP"</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Priorytetowe wsparcie</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handlePromotionPurchase("VIP")} disabled={isLoading}>
              {isLoading ? "Przetwarzanie..." : "Wybierz"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

