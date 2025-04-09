"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

// Walidacja NIP
const validateNIP = (nip: string) => {
  // Usunięcie wszystkich znaków niebędących cyframi
  const cleanedNIP = nip.replace(/[^0-9]/g, "")

  // Sprawdzenie długości
  if (cleanedNIP.length !== 10) {
    return false
  }

  // Wagi dla poszczególnych cyfr NIP
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]

  // Obliczenie sumy kontrolnej
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanedNIP[i]) * weights[i]
  }

  // Obliczenie cyfry kontrolnej
  const checkDigit = sum % 11

  // Jeśli cyfra kontrolna jest równa 10, NIP jest nieprawidłowy
  if (checkDigit === 10) {
    return false
  }

  // Sprawdzenie, czy obliczona cyfra kontrolna zgadza się z ostatnią cyfrą NIP
  return checkDigit === Number.parseInt(cleanedNIP[9])
}

// Kategorie działalności
const businessCategories = [
  "Motoryzacja",
  "Nieruchomości",
  "Elektronika",
  "Moda",
  "Usługi",
  "Gastronomia",
  "Dom i ogród",
  "Sport i hobby",
  "Edukacja",
  "Zdrowie i uroda",
  "Transport",
  "Budownictwo",
  "IT",
  "Finanse",
  "Inne",
]

// Walidacja hasła - musi zawierać co najmniej jedną cyfrę, jedną małą literę, jedną dużą literę i jeden znak specjalny
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

// Schemat walidacji dla osoby prywatnej
const individualSchema = z
  .object({
    name: z.string().min(2, {
      message: "Imię musi mieć co najmniej 2 znaki",
    }),
    email: z.string().email({
      message: "Wprowadź poprawny adres email",
    }),
    password: z
      .string()
      .min(8, {
        message: "Hasło musi mieć co najmniej 8 znaków",
      })
      .regex(passwordRegex, {
        message:
          "Hasło musi zawierać co najmniej jedną cyfrę, jedną małą literę, jedną dużą literę i jeden znak specjalny",
      }),
    confirmPassword: z.string(),
    bio: z.string().optional(),
    accountType: z.literal("individual"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  })

// Schemat walidacji dla firmy
const businessSchema = z
  .object({
    name: z.string().min(2, {
      message: "Nazwa firmy musi mieć co najmniej 2 znaki",
    }),
    email: z.string().email({
      message: "Wprowadź poprawny adres email",
    }),
    password: z
      .string()
      .min(8, {
        message: "Hasło musi mieć co najmniej 8 znaków",
      })
      .regex(passwordRegex, {
        message:
          "Hasło musi zawierać co najmniej jedną cyfrę, jedną małą literę, jedną dużą literę i jeden znak specjalny",
      }),
    confirmPassword: z.string(),
    nip: z.string().refine(validateNIP, {
      message: "Wprowadź poprawny NIP",
    }),
    phone: z.string().min(9, {
      message: "Wprowadź poprawny numer telefonu",
    }),
    bio: z.string().optional(),
    categories: z
      .array(z.string())
      .min(1, {
        message: "Wybierz co najmniej jedną kategorię",
      })
      .max(2, {
        message: "Możesz wybrać maksymalnie 2 kategorie",
      }),
    location: z.string().min(1, {
      message: "Podaj lokalizację firmy",
    }),
    adress: z.string().min(1, {
      message: "Podaj adres firmy",
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować regulamin",
    }),
    accountType: z.literal("business"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  })

// Połączony schemat
const formSchema = z.union([individualSchema, businessSchema])

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<"individual" | "business">("individual")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Inicjalizacja formularza z poprawnie ustawioną wartością accountType
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      accountType: "individual" as const,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Przygotowanie danych do wysłania
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        type: values.accountType,
        bio: values.bio || "",
        ...(values.accountType === "business" && {
          phone: values.phone,
          nip: values.nip,
          location: values.location,
          adress: values.adress,
          categories: values.categories,
        }),
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas rejestracji")
      }

      toast({
        title: "Rejestracja zakończona pomyślnie",
        description: "Możesz teraz zalogować się na swoje konto",
      })

      // Przekierowanie na stronę logowania
      router.push("/login")
    } catch (error) {
      toast({
        title: "Błąd rejestracji",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas rejestracji",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    if (value === "individual" || value === "business") {
      setAccountType(value)
      form.setValue("accountType", value as "individual" | "business")
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      // Jeśli kategoria jest już wybrana, usuń ją
      if (prev.includes(category)) {
        const newCategories = prev.filter((c) => c !== category)
        form.setValue("categories", newCategories)
        return newCategories
      }

      // Jeśli próbujemy dodać więcej niż 2 kategorie, nie dodawaj
      if (prev.length >= 2) {
        toast({
          title: "Maksymalnie 2 kategorie",
          description: "Możesz wybrać maksymalnie 2 kategorie dla swojej firmy",
          variant: "destructive",
        })
        return prev
      }

      // Dodaj nową kategorię
      const newCategories = [...prev, category]
      form.setValue("categories", newCategories)
      return newCategories
    })
  }

  return (
    <Tabs defaultValue="individual" onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="individual">Osoba prywatna</TabsTrigger>
        <TabsTrigger value="business">Firma</TabsTrigger>
      </TabsList>
      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{accountType === "individual" ? "Imię i nazwisko" : "Nazwa firmy"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={accountType === "individual" ? "Jan Kowalski" : "Firma Sp. z o.o."}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nazwa@example.com" {...field} disabled={isLoading} />
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
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormDescription>
                    Hasło musi zawierać co najmniej 8 znaków, w tym jedną cyfrę, jedną małą literę, jedną dużą literę i
                    jeden znak specjalny.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź hasło</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === "business" && (
              <>
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>Wprowadź 10-cyfrowy numer NIP bez myślników</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokalizacja</FormLabel>
                      <FormControl>
                        <Input placeholder="Warszawa, Mazowieckie" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>Podaj miasto i województwo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokalizacja</FormLabel>
                      <FormControl>
                        <Input placeholder="ul.Fabryczna 2a" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>Podaj ulicę i numer</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <FormLabel>Kategorie działalności (max. 2)</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {businessCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => handleCategoryChange(category)}
                              disabled={isLoading}
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Akceptuję{" "}
                          <Link href="/regulamin" className="text-primary hover:underline">
                            regulamin
                          </Link>{" "}
                          i{" "}
                          <Link href="/polityka-prywatnosci" className="text-primary hover:underline">
                            politykę prywatności
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O {accountType === "individual" ? "sobie" : "firmie"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        accountType === "individual" ? "Napisz kilka słów o sobie..." : "Napisz kilka słów o firmie..."
                      }
                      className="resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejestracja...
                </>
              ) : (
                "Zarejestruj się"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </Tabs>
  )
}

