"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Building, Crown, Loader2 } from 'lucide-react'
import { PricingTable } from "@/components/pricing-table"

interface CompanyPromotionProps {
  isPromoted?: boolean
  promotionEndDate?: string
  promotionPlan?: string
}

export function CompanyPromotion({ isPromoted = false, promotionEndDate, promotionPlan }: CompanyPromotionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("standard")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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
      link: "/checkout?plan=business&type=company",
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
      link: "/checkout?plan=professional&type=company",
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
      link: "/checkout?plan=enterprise&type=company",
    },
  ]

  const handlePromotion = async () => {
    setIsLoading(true)

    try {
      // Tutaj będzie integracja z systemem płatności Stripe
      toast({
        title: "Przekierowanie do płatności",
        description: "Za chwilę zostaniesz przekierowany do systemu płatności",
      })

      // Przekierowanie do Stripe (w rzeczywistej implementacji)
      window.location.href = `/api/stripe/create-checkout?plan=${selectedPlan}&promotionType=company`
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas przetwarzania płatności",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Promowanie firmy</h2>
        <p className="text-muted-foreground">
          Promuj swoją firmę, aby zwiększyć widoczność i przyciągnąć więcej klientów.
        </p>
      </div>

      {isPromoted && promotionEndDate ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Aktywna promocja</CardTitle>
            <CardDescription>
              Twoja firma jest obecnie promowana w planie <strong>{promotionPlan || "Standard"}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Promocja aktywna do: <strong>{new Date(promotionEndDate).toLocaleDateString()}</strong>
            </p>
            <p className="mt-4">
              Dzięki promocji Twoja firma jest wyróżniona w katalogu firm, a Twoje ogłoszenia mają wyższy priorytet
              wyświetlania.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => (window.location.href = "/firmy")}>
              Zobacz swój profil w katalogu
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <PricingTable
            plans={plans}
            onSelect={setSelectedPlan}
            selectedPlan={selectedPlan}
            isLoading={isLoading}
            handlePromotion={handlePromotion}
          />
        </>
      )}
    </div>
  )
}