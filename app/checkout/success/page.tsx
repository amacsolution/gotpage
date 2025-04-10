"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import confetti from "canvas-confetti"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "company"

  // Trigger confetti effect on page load
  useEffect(() => {
    // Create confetti effect
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <PageLayout>
      <div className="container py-12">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Dziękujemy za płatność!</CardTitle>
            <CardDescription>Twoja promocja została pomyślnie aktywowana.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Co dalej?</h3>
              <p className="text-sm text-muted-foreground">
                {type === "ad"
                  ? "Twoje ogłoszenie zostało wyróżnione i będzie widoczne na górze listy wyszukiwania. Promocja jest już aktywna."
                  : "Twoja firma została wyróżniona i będzie widoczna w sekcji polecanych firm. Promocja jest już aktywna."}
              </p>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Szczegóły promocji</h3>
              <p className="text-sm text-muted-foreground">
                Szczegóły Twojej promocji możesz sprawdzić w panelu użytkownika w sekcji "Promowanie". W razie
                jakichkolwiek pytań, skontaktuj się z naszym zespołem wsparcia.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={() => router.push(type === "ad" ? "/ogloszenia" : "/firmy")}>
              {type === "ad" ? "Przejdź do ogłoszeń" : "Przejdź do katalogu firm"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/profil")}>
              Przejdź do profilu
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  )
}
