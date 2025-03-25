import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "./register-form"
import { CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Rejestracja | Gotpage",
  description: "Utwórz nowe konto w serwisie Gotpage",
}

export default function RegisterPage() {
  return (
    <>
      <CardTitle className="text-2xl font-bold">Rejestracja</CardTitle>
      <CardDescription>Utwórz nowe konto w serwisie Gotpage</CardDescription>
      <CardContent className="pt-6">
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Zaloguj się
          </Link>
        </div>
      </CardFooter>
    </>
  )
}

