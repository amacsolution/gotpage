"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
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
import { useToast } from "@/hooks/use-toast"

export default function RegisterClientPage() {
  const [open, setOpen] = useState(false)
  const {toast} = useToast()

    useEffect(() => {
      try {
        const userData = localStorage.getItem("userData")
        setTimeout(() => {
        if (userData) {
          const user = JSON.parse(userData)
          
          toast({
            title: "Jesteś zalogowany",
            description: "Zalogowano jako " + user.email,
            variant: "destructive",
          })
          window.history.back()
        } else {
          return
        }}, 1000)
      } catch (error) {
      }
    }, [toast])

  return (
    <>
      <CardTitle className="text-2xl font-bold">Rejestracja</CardTitle>
      <CardDescription>Utwórz nowe konto w serwisie Gotpage</CardDescription>
      <CardContent className="pt-6">
        <Dialog open={open} onOpenChange={setOpen} >
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

