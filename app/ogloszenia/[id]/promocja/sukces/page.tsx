"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/legacy/image"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        router.push("/")
        return
      }

      try {
        setIsLoading(true)
        // W rzeczywistej aplikacji tutaj byłoby zapytanie do API
        // const response = await fetch(`/api/payments/verify?session_id=${sessionId}`);
        // const data = await response.json();

        // Symulacja opóźnienia sieciowego
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data dla płatności
        setPaymentDetails({
          status: "success",
          amount: 20,
          currency: "PLN",
          promotionType: "premium",
          adId: 1,
          adTitle: "Sprzedam samochód Toyota Corolla 2018",
          promotionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        })
      } catch (error) {
        console.error("Błąd podczas weryfikacji płatności:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <MainNav />
          </div>
        </header>
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-pulse text-xl">Weryfikacja płatności...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!paymentDetails) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <MainNav />
          </div>
        </header>
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Nie znaleziono szczegółów płatności</h1>
            <Link href="/">
              <Button>Wróć do strony głównej</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-green-500 dark:border-green-700">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Płatność zakończona pomyślnie!</CardTitle>
              <CardDescription className="text-center">Twoje ogłoszenie zostało pomyślnie wypromowane</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ogłoszenie:</span>
                  <span className="font-medium">{paymentDetails.adTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ promocji:</span>
                  <span className="font-medium capitalize">{paymentDetails.promotionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kwota:</span>
                  <span className="font-medium">
                    {paymentDetails.amount} {paymentDetails.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Promocja aktywna do:</span>
                  <span className="font-medium">{paymentDetails.promotionEndDate}</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Potwierdzenie płatności zostało wysłane na Twój adres email.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href={`/ogloszenia/${paymentDetails.adId}`} className="w-full">
                <Button className="w-full">Zobacz ogłoszenie</Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Wróć do strony głównej
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6 mt-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Gotpage Logo" width={24} height={24} className="h-6 w-auto" />
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gotpage. Wszelkie prawa zastrzeżone.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/regulamin" className="text-sm text-muted-foreground hover:underline">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="text-sm text-muted-foreground hover:underline">
              Polityka prywatności
            </Link>
            <Link href="/kontakt" className="text-sm text-muted-foreground hover:underline">
              Kontakt
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}

