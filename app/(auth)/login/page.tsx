"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { PageLayout } from "@/components/page-layout"

const formSchema = z.object({
  email: z.string().email({
    message: "Wprowadź poprawny adres email",
  }),
  password: z.string().min(1, {
    message: "Hasło jest wymagane",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Tutaj byłaby logika logowania użytkownika
    console.log(values)

    // Symulacja opóźnienia logowania
    setTimeout(() => {
      setIsLoading(false)

      toast({
        title: "Zalogowano pomyślnie",
        description: "Witamy z powrotem!",
      })

      // Przekierowanie na stronę główną
      router.push("/")
    }, 1500)
  }

  return (
    <PageLayout>
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Zaloguj się do konta</h1>
            <p className="text-sm text-muted-foreground">Wprowadź swoje dane logowania poniżej</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nazwa@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>
          </Form>
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Lub</span>
            </div>
          </div>
          <div className="text-center text-sm">
            Nie masz jeszcze konta?{" "}
            <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
              Zarejestruj się
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

