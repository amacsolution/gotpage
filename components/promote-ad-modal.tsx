"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Rocket, CheckCircle, Sparkles, Crown } from "lucide-react"

// Inicjalizacja Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

interface PromoteAdModalProps {
  adId: number
  adTitle: string
}

export function PromoteAdModal({ adId, adTitle }: PromoteAdModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const promotionPlans = [
    {
      id: "standard",
      title: "Standard",
      description: "Wyróżnij swoje ogłoszenie na liście wyników wyszukiwania na 7 dni",
      price: 10,
      features: ["Wyróżnienie kolorem", "Pozycjonowanie wyżej w wynikach", "7 dni promocji"],
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      id: "premium",
      title: "Premium",
      description: "Twoje ogłoszenie będzie wyświetlane na górze listy przez 14 dni",
      price: 20,
      features: ["Wszystko co w Standard", "Wyświetlanie na górze listy", "14 dni promocji", "Większe zdjęcia"],
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      id: "vip",
      title: "VIP",
      description: "Maksymalna widoczność i wyróżnienie ogłoszenia przez 30 dni",
      price: 50,
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

  const handlePromote = async () => {
    if (!selectedPlan) {
      toast({
        title: "Wybierz plan promocji",
        description: "Musisz wybrać plan promocji, aby kontynuować",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adId,
          promotionType: selectedPlan,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Przekierowanie do Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          throw new Error(error.message)
        }
      }
    } catch (error) {
      console.error("Błąd podczas promocji ogłoszenia:", error)
      toast({
        title: "Wystąpił błąd",
        description: "Nie udało się utworzyć płatności. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Rocket className="h-4 w-4 mr-2" />
          Promuj ogłoszenie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Promuj swoje ogłoszenie</DialogTitle>
          <DialogDescription>Wybierz plan promocji, aby zwiększyć widoczność ogłoszenia "{adTitle}"</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promotionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedPlan === plan.id ? "border-primary ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader>
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
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{plan.price} PLN</p>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    Wybierz
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedPlan(null)}>
            Anuluj
          </Button>
          <Button onClick={handlePromote} disabled={isLoading || !selectedPlan}>
            {isLoading ? "Przetwarzanie..." : "Przejdź do płatności"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

