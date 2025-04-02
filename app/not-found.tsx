"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search, ArrowLeft, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Strona nie znaleziona</CardTitle>
          <CardDescription className="text-lg mt-2">Ups! Nie możemy znaleźć strony, której szukasz.</CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <div className="relative py-10">
            <div className="text-[120px] font-extrabold text-foreground select-none">404</div>
            <div className="     inset-0 flex items-center justify-center">
              <div className="text-foreground text-lg max-w-[250px]">
                Strona mogła zostać usunięta lub adres URL jest nieprawidłowy.
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Strona główna
            </Link>
          </Button>
          <div className="flex space-x-3 w-full">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/ogloszenia">
                <Search className="mr-2 h-4 w-4" />
                Przeglądaj ogłoszenia
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wróć
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-muted-foreground text-sm">
        <p>Jeśli uważasz, że to błąd, skontaktuj się z nami przez formularz kontaktowy.</p>
        <p className="mt-1">
          <Link href="/kontakt" className="text-primary hover:underline">
            Przejdź do formularza kontaktowego
          </Link>
        </p>
      </div>
    </div>
  )
}

