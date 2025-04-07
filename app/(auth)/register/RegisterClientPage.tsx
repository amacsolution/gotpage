"use client"

import Link from "next/link"
import { useState } from "react"
import { CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MultiStepRegisterForm } from "@/components/register-form"

export default function RegisterClientPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <CardTitle className="text-2xl font-bold">Rejestracja</CardTitle>
      <CardDescription>Utwórz nowe konto w serwisie Gotpage</CardDescription>
      <CardContent className="pt-6">
        <Dialog open={open} onOpenChange={setOpen} className="max-h-screen">
          <DialogTrigger asChild>
            <Button className="w-full">Zarejestruj się</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>Utwórz nowe konto</DialogTitle>
              <DialogDescription>
                Wypełnij poniższy formularz, aby utworzyć nowe konto w serwisie Gotpage.
              </DialogDescription>
            </DialogHeader>
            <MultiStepRegisterForm />
          </DialogContent>
        </Dialog>
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

