import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "./login-form"
import { CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export const metadata: Metadata = {
  title: "Logowanie | Gotpage",
  description: "Zaloguj się do swojego konta Gotpage",
}



export default function LoginPage() {


  return (
    <>
      <CardTitle className="text-2xl font-bold">Logowanie</CardTitle>
      <CardDescription>Wprowadź swoje dane, aby zalogować się do konta</CardDescription>
      <CardContent className="pt-6">
        <LoginForm />
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-2">
        <div className="text-sm text-muted-foreground">
          Nie masz jeszcze konta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Zarejestruj się
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Zapomniałeś hasła?
          </Link>
        </div>
      </CardFooter>
    </>
  )
}

