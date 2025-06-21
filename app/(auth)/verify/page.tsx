"use client"

import { useEffect, useState, use } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function VerifyPage(
  props: {
    searchParams: Promise<{ token?: string }>
  }
) {
  const searchParams = use(props.searchParams);
  const token = searchParams.token
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setError("Brak tokenu weryfikacyjnego")
      return
    }
    async function verifyAccount() {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`)
        const data = await response.json();

        if (response.status === 200 || response.status === 307) {
          setStatus("success")

          toast.toast({
            title: "Zalogowano pomyślnie",
            description: "Zostałeś pomyślnie zalogowany do swojego konta",
          })

          // Emituj zdarzenie auth-change, aby powiadomić kontekst użytkownika
          await window.dispatchEvent(new Event("auth-change"))
          router.push("/verify-success") // Redirect to success page
        } else {
          setStatus("error")
          setError(data.error || "Wystąpił błąd podczas weryfikacji konta")
        }
      } catch (error) {
        console.error(error)
        setStatus("error")
        setError("Wystąpił błąd podczas weryfikacji konta")
      }
    }

    verifyAccount();
  }, [token, router, toast]);

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
            <Link href="/jak-to-dziala">
              <Button>Działamy</Button>
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
