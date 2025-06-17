"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, RefreshCw, AlertOctagon } from "lucide-react"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Opcjonalnie możesz zalogować błąd do serwisu monitorowania
    console.error("Wystąpił błąd:", error)
    const notify = async () => {
        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: error?.message || "Brak wiadomości",
              stack: error?.stack || "Brak stack trace",
              digest: error?.digest || null,
              before: document.referrer || null
            }),
          })
        } catch (err) {
          console.error("Błąd podczas wysyłania informacji o błędzie:", err)
        }
      }

      notify()
  }, [error])

  return (
    <html lang="pl">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
          <Card className="w-full max-w-md shadow-lg border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full">
                <AlertOctagon className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-bold">Coś poszło nie tak</CardTitle>
              <CardDescription className="text-lg mt-2">Przepraszamy, wystąpił nieoczekiwany błąd.</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <div className="py-6 text-muted-foreground">
                Nasz zespół został powiadomiony o tym problemie i pracuje nad jego rozwiązaniem. Spróbuj odświeżyć
                stronę lub wróć na stronę główną.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Spróbuj ponownie
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Strona główna
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center text-muted-foreground text-sm">
            {error.digest && (<p>Kod błędu: {error.digest}</p>)}
            <p className="mt-1">
              Jeśli problem będzie się powtarzał, skontaktuj się z nami przez{" "}
              <Link href="/kontakt" className="text-primary hover:underline">
                formularz kontaktowy
              </Link>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

