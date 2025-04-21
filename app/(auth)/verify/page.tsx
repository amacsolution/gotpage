"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setError("Brak tokenu weryfikacyjnego")
      return
    }

    const verifyAccount = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus("success")
        } else {
          setStatus("error")
          setError(data.error || "Wystąpił błąd podczas weryfikacji konta")
        }
      } catch (error) {
        setStatus("error")
        setError("Wystąpił błąd podczas weryfikacji konta")
      }
    }

    verifyAccount()
  }, [token])

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Weryfikacja konta</CardTitle>
          <CardDescription>Weryfikujemy Twój adres email</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p>Weryfikacja w toku...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p>Twój adres email został pomyślnie zweryfikowany!</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <p className="text-red-500">{error || "Wystąpił błąd podczas weryfikacji konta"}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "success" && (
            <Link href="/login">
              <Button>Zaloguj się</Button>
            </Link>
          )}
          {status === "error" && (
            <Link href="/login">
              <Button variant="outline">Wróć do strony logowania</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
