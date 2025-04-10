"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, ArrowLeft, CreditCard, Shield } from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading")
  const [productDetails, setProductDetails] = useState<{
    name: string
    price: number
    description: string
    type: "ad" | "company"
  } | null>(null)

  // Get parameters from URL
  const plan = searchParams.get("plan")
  const type = searchParams.get("type") || "company"
  const itemId = searchParams.get("id")
  const success = searchParams.get("success") === "true"
  const canceled = searchParams.get("canceled") === "true"

  useEffect(() => {
    // Handle success or canceled states from redirect
    if (success) {
      setStatus("success")
      setIsLoading(false)
      return
    }

    if (canceled) {
      setStatus("error")
      setIsLoading(false)
      toast({
        title: "Płatność anulowana",
        description: "Twoja płatność została anulowana. Możesz spróbować ponownie.",
        variant: "destructive",
      })
      return
    }

    // If no plan is provided, redirect to promotion page
    // WŁĄczyć to
    // if (!plan) {
    //   router.push("/promowanie")
    //   return
    // }

    // Fetch checkout session from API
    const fetchCheckoutSession = async () => {
      try {
        setIsLoading(true)

        // Prepare query parameters
        const params = new URLSearchParams()
        params.append("plan", plan)
        params.append("type", type as string)
        if (itemId) params.append("id", itemId)

        const response = await fetch(`/api/stripe/create-checkout?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Nie udało się utworzyć sesji płatności")
        }

        const data = await response.json()

        setCheckoutUrl(data.url)
        setProductDetails(data.product)
        setStatus("ready")
      } catch (error) {
        console.error("Error creating checkout session:", error)
        setStatus("error")
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć sesji płatności. Spróbuj ponownie później.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheckoutSession()
  }, [plan, type, itemId, success, canceled, router, toast])

  // Render different content based on status
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        )

      case "ready":
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">
                Płatność za {type === "ad" ? "promocję ogłoszenia" : "promocję firmy"}
              </CardTitle>
              <CardDescription>
                Plan: <span className="font-medium">{productDetails?.name}</span> - {productDetails?.price.toFixed(2)}{" "}
                PLN
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkoutUrl ? (
                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Bezpieczna płatność</h3>
                      <p className="text-sm text-muted-foreground">
                        Twoja płatność jest przetwarzana bezpiecznie przez Stripe. Nie przechowujemy danych Twojej
                        karty.
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <iframe src={checkoutUrl} className="w-full h-[450px]" frameBorder="0" allow="payment" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Ładowanie formularza płatności...</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wróć
              </Button>
            </CardFooter>
          </Card>
        )

      case "success":
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Płatność zakończona pomyślnie!</CardTitle>
              <CardDescription>Dziękujemy za dokonanie płatności. Twoja promocja została aktywowana.</CardDescription>
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
        )

      case "error":
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Wystąpił błąd</CardTitle>
              <CardDescription>Nie udało się przetworzyć płatności. Spróbuj ponownie później.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Co możesz zrobić?</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Sprawdź swoje połączenie internetowe</li>
                  <li>• Upewnij się, że dane karty są poprawne</li>
                  <li>• Spróbuj ponownie za kilka minut</li>
                  <li>• Skontaktuj się z naszym zespołem wsparcia, jeśli problem będzie się powtarzał</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()}>Spróbuj ponownie</Button>
              <Button variant="outline" onClick={() => router.push("/promocja")}>
                Wróć do promocji
              </Button>
            </CardFooter>
          </Card>
        )
    }
  }

  return (
    <PageLayout>
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Płatność</h1>
          <p className="text-muted-foreground">
            {status === "success"
              ? "Twoja płatność została zrealizowana pomyślnie"
              : status === "error"
                ? "Wystąpił problem z płatnością"
                : "Dokończ proces płatności, aby aktywować promocję"}
          </p>
        </div>

        {renderContent()}
      </div>
    </PageLayout>
  )
}
