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
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Remove this line:
// import { categories } from "@/lib/categories"

// Walidacja NIP
const validateNIP = (nip: string) => {
  if (!nip) return true // Allow empty NIP

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

// Walidacja hasła - musi zawierać co najmniej jedną cyfrę, jedną małą literę, jedną dużą literę i jeden znak specjalny
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

// Schemat walidacji dla osoby prywatnej - krok 1
const individualStep1Schema = z
  .object({
    name: z.string().min(2, {
      message: "Nazwa użytkownika musi mieć co najmniej 2 znaki",
    }),
    fullName: z.string().min(2, {
      message: "Imię i nazwisko musi mieć co najmniej 2 znaki",
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
    accountType: z.literal("individual"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  })

// Schemat walidacji dla osoby prywatnej - krok 2
const individualStep2Schema = z.object({
  location: z.string().optional(),
  occupation: z.string().optional(),
  interests: z.string().optional(),
  relationshipStatus: z.string().optional(),
  education: z.string().optional(),
  accountType: z.literal("individual"),
})

// Schemat walidacji dla osoby prywatnej - krok 3
const individualStep3Schema = z.object({
  bio: z.string().optional(),
  facebookUrl: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  instagramUrl: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  tiktokUrl: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  linkedinUrl: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Musisz zaakceptować regulamin",
  }),
  accountType: z.literal("individual"),
})

// Schemat walidacji dla firmy - krok 1
const businessStep1Schema = z
  .object({
    name: z.string().min(2, {
      message: "Nazwa firmy musi mieć co najmniej 2 znaki",
    }),
    fullName: z.string().min(2, {
      message: "Imię i nazwisko musi mieć co najmniej 2 znaki",
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
    accountType: z.literal("business"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  })

// Schemat walidacji dla firmy - krok 2
const businessStep2Schema = z.object({
  nip: z
    .string()
    .refine(validateNIP, {
      message: "Wprowadź poprawny NIP",
    })
    .or(z.literal("")),
  regon: z.string().optional().or(z.literal("")),
  krs: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .min(9, {
      message: "Wprowadź poprawny numer telefonu",
    })
    .optional()
    .or(z.literal("")),
  location: z.string().min(1, {
    message: "Podaj lokalizację firmy",
  }),
  address: z.string().min(1, {
    message: "Podaj dokładny adres firmy",
  }),
  categories: z
    .array(z.string())
    .min(1, {
      message: "Wybierz co najmniej jedną kategorię",
    })
    .max(3, {
      message: "Możesz wybrać maksymalnie 3 kategorie",
    }),
  accountType: z.literal("business"),
})

// Schemat walidacji dla firmy - krok 3
const businessStep3Schema = z.object({
  bio: z.string().optional(),
  companySize: z.string().optional(),
  foundingYear: z.string().optional(),
  website: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  openingHours: z.string().optional(),
  services: z.string().optional(),
  facebookUrl: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  instagramUrl: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  linkedinUrl: z.string().url({ message: "Wprowadź poprawny adres URL" }).optional().or(z.literal("")),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Musisz zaakceptować regulamin",
  }),
  accountType: z.literal("business"),
})

// Połączony schemat
const formSchema = z.discriminatedUnion("accountType", [
  z.object({ ...individualStep1Schema.shape, ...individualStep2Schema.shape, ...individualStep3Schema.shape }),
  z.object({ ...businessStep1Schema.shape, ...businessStep2Schema.shape, ...businessStep3Schema.shape }),
])

// Opcje dla pola "Status związku"
const relationshipOptions = [
  { value: "single", label: "Singiel/Singielka" },
  { value: "in_relationship", label: "W związku" },
  { value: "engaged", label: "Zaręczony/a" },
  { value: "married", label: "Żonaty/Zamężna" },
  { value: "complicated", label: "To skomplikowane" },
  { value: "prefer_not_to_say", label: "Wolę nie podawać" },
]

// Opcje dla pola "Wykształcenie"
const educationOptions = [
  { value: "primary", label: "Podstawowe" },
  { value: "secondary", label: "Średnie" },
  { value: "vocational", label: "Zawodowe" },
  { value: "bachelor", label: "Licencjat/Inżynier" },
  { value: "master", label: "Magister" },
  { value: "phd", label: "Doktor" },
  { value: "prefer_not_to_say", label: "Wolę nie podawać" },
]

// Opcje dla pola "Wielkość firmy"
const companySizeOptions = [
  { value: "1-10", label: "1-10 pracowników" },
  { value: "11-50", label: "11-50 pracowników" },
  { value: "51-200", label: "51-200 pracowników" },
  { value: "201-500", label: "201-500 pracowników" },
  { value: "501-1000", label: "501-1000 pracowników" },
  { value: "1000+", label: "Ponad 1000 pracowników" },
]

// Add this array of business categories after the companySizeOptions array:
// Kategorie działalności
const businessCategories = [
  "Sklep detaliczny",
  "Sklep internetowy",
  "Supermarket",
  "Hurtownia",
  "Usługi",
  "Rozrywka",
  "Transport/Logistyka",
  "Klub nocny",
  "Sanatorium",
  "Piekarnia",
  "Centrum zdrowia",
  "Kino/Teatr",
  "Miasto",
  "Strona/Portal",
  "Obiekt/Placówka",
  "Restauracja/Bar/Kawiarnia",
  "Blog",
  "Gry",
  "Turystyka/Rekreacja",
  "Edukacja",
  "Galeria",
  "Finanse/Ubezpieczenia",
  "Bank",
  "Uroda/Zdrowie/Relaks",
  "Nieruchomości",
  "Reklama/Biznes",
  "Druk/Publikacje",
  "Salon samochodowy/Targ",
  "Noclegi",
  "Kasyno",
  "Fundacja",
  "Telekomunikacja/Internet",
  "Fan Klub",
  "Organizacja",
  "Instytucja/Urząd",
  "Znana osoba",
]

export function MultiStepRegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<"individual" | "business">("individual")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const totalSteps = 3

  // Inicjalizacja formularza z poprawnie ustawioną wartością accountType
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      accountType: "individual" as const,
      // Individual fields
      occupation: "",
      interests: "",
      relationshipStatus: "",
      education: "",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      linkedinUrl: "",
      // Business fields
      nip: "",
      regon: "",
      krs: "",
      phone: "",
      location: "",
      address: "",
      categories: [],
      companySize: "",
      foundingYear: "",
      website: "",
      openingHours: "",
      services: "",
      termsAccepted: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Przygotowanie danych do wysłania
      const userData = {
        name: values.name,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        type: values.accountType,
        bio: values.bio || "",
        ...(values.accountType === "individual" && {
          location: values.location || "",
          occupation: values.occupation || "",
          interests: values.interests || "",
          relationshipStatus: values.relationshipStatus || "",
          education: values.education || "",
          socialMedia: {
            facebook: values.facebookUrl || "",
            instagram: values.instagramUrl || "",
            tiktok: values.tiktokUrl || "",
            linkedin: values.linkedinUrl || "",
          },
        }),
        ...(values.accountType === "business" && {
          nip: values.nip || "",
          regon: values.regon || "",
          krs: values.krs || "",
          phone: values.phone || "",
          location: values.location || "",
          address: values.address || "",
          categories: values.categories || [],
          companySize: values.companySize || "",
          foundingYear: values.foundingYear || "",
          website: values.website || "",
          openingHours: values.openingHours || "",
          services: values.services || "",
          socialMedia: {
            facebook: values.facebookUrl || "",
            instagram: values.instagramUrl || "",
            linkedin: values.linkedinUrl || "",
          },
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
      setSelectedCategories([])
      form.setValue("categories", [])
      setStep(1) // Reset to step 1 when changing account type
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

      // Jeśli próbujemy dodać więcej niż 3 kategorie, nie dodawaj
      if (prev.length >= 3) {
        toast({
          title: "Maksymalnie 3 kategorie",
          description: "Możesz wybrać maksymalnie 3 kategorie dla swojej firmy",
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

  const validateCurrentStep = async () => {
    let isValid = false

    if (accountType === "individual") {
      if (step === 1) {
        isValid = await form.trigger(["name", "fullName", "email", "password", "confirmPassword"])
      } else if (step === 2) {
        isValid = true // Optional fields in step 2 for individuals
      } else if (step === 3) {
        isValid = await form.trigger(["termsAccepted"])
      }
    } else if (accountType === "business") {
      if (step === 1) {
        isValid = await form.trigger(["name", "fullName", "email", "password", "confirmPassword"])
      } else if (step === 2) {
        isValid = await form.trigger(["location", "address", "categories"])
      } else if (step === 3) {
        isValid = await form.trigger(["termsAccepted"])
      }
    }

    return isValid
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()

    if (isValid) {
      setStep(Math.min(step + 1, totalSteps))
    } else {
      toast({
        title: "Błąd",
        description: "Popraw błędy w formularzu",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    setStep(Math.max(step - 1, 1))
  }

  const progress = (step / totalSteps) * 100

  const renderStepTitle = () => {
    if (step === 1) return "Informacje podstawowe"
    if (step === 2) return accountType === "individual" ? "Informacje osobiste" : "Informacje o firmie"
    if (step === 3) return "Dodatkowe informacje"
    return ""
  }

  return (
    <div className="w-full">
      <Progress value={progress} className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 max-h-[80vh] overflow-y-scroll">
              <h2 className="text-lg font-semibold mb-4">{renderStepTitle()}</h2>

              {step === 1 && (
                <Tabs defaultValue={accountType} onValueChange={handleTabChange} className="w-full mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individual">Osoba prywatna</TabsTrigger>
                    <TabsTrigger value="business">Firma</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{accountType === "individual" ? "Nazwa użytkownika" : "Nazwa firmy"}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={accountType === "individual" ? "jankowal24" : "Firma Sp. z o.o."}
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
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imię i nazwisko</FormLabel>
                            <FormControl>
                              <Input placeholder="Jan Kowalski" {...field} disabled={isLoading} />
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
                              Hasło musi zawierać co najmniej 8 znaków, w tym jedną cyfrę, jedną małą literę, jedną dużą
                              literę i jeden znak specjalny.
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
                    </>
                  )}

                  {/* Step 2: Additional Information */}
                  {step === 2 && accountType === "individual" && (
                    <>
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
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Czym się zajmujesz?</FormLabel>
                            <FormControl>
                              <Input placeholder="np. Student, Programista, Lekarz" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zainteresowania</FormLabel>
                            <FormControl>
                              <Input placeholder="np. Sport, muzyka, podróże" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="relationshipStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status związku</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wybierz status związku" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {relationshipOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wykształcenie</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wybierz wykształcenie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {educationOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 2 && accountType === "business" && (
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
                        name="regon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>REGON</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="krs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>KRS</FormLabel>
                            <FormControl>
                              <Input placeholder="0000123456" {...field} disabled={isLoading} />
                            </FormControl>
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
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adres</FormLabel>
                            <FormControl>
                              <Input placeholder="Fabryczna 2a/10" {...field} disabled={isLoading} />
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
                            <FormLabel>Kategorie działalności (max. 3)</FormLabel>
                            {/* Update the categories mapping in the FormField for categories
                            Replace this section in step 2 for business accounts:
                            <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                              {categories.map((category) => (
                                <div key={category.name} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`category-${category.name}`}
                                    checked={selectedCategories.includes(category.name)}
                                    onCheckedChange={() => handleCategoryChange(category.name)}
                                    disabled={isLoading}
                                  />
                                  <label
                                    htmlFor={`category-${category.name}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {category.name}
                                  </label>
                                </div>
                              ))}
                            </div>

                            // With this: */}
                            <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
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
                    </>
                  )}

                  {/* Step 3: Social Media & Bio */}
                  {step === 3 && accountType === "individual" && (
                    <>
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>O sobie</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Napisz kilka słów o sobie..."
                                className="resize-none"
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
                        name="facebookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/username" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="instagramUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/username" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tiktokUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok</FormLabel>
                            <FormControl>
                              <Input placeholder="https://tiktok.com/@username" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/username" {...field} disabled={isLoading} />
                            </FormControl>
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

                  {step === 3 && accountType === "business" && (
                    <>
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>O firmie</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Napisz kilka słów o firmie..."
                                className="resize-none"
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
                        name="companySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wielkość firmy</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wybierz wielkość firmy" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {companySizeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="foundingYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rok założenia</FormLabel>
                            <FormControl>
                              <Input placeholder="np. 2010" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strona internetowa</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Godziny otwarcia</FormLabel>
                            <FormControl>
                              <Input placeholder="np. Pon-Pt: 9-17, Sob: 10-14" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Oferowane usługi/produkty</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Opisz krótko, co oferuje Twoja firma..."
                                className="resize-none"
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
                        name="facebookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/company" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="instagramUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/company" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/company/name" {...field} disabled={isLoading} />
                            </FormControl>
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

                  <div className="flex justify-between mt-6">
                    {step > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                        Wstecz
                      </Button>
                    )}
                    {step < totalSteps ? (
                      <Button type="button" onClick={nextStep} disabled={isLoading}>
                        Dalej
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Rejestracja...
                          </>
                        ) : (
                          "Zarejestruj się"
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Podsumowanie</h2>
              <div className="text-sm space-y-2">
                <p>
                  Typ konta:{" "}
                  <span className="font-medium">{accountType === "individual" ? "Prywatne" : "Firmowe"}</span>
                </p>
                {form.getValues("name") && (
                  <p>
                    {accountType === "individual" ? "Nazwa użytkownika" : "Nazwa firmy"}:{" "}
                    <span className="font-medium">{form.getValues("name")}</span>
                  </p>
                )}
                {form.getValues("fullName") && (
                  <p>
                    Imię i nazwisko: <span className="font-medium">{form.getValues("fullName")}</span>
                  </p>
                )}
                {form.getValues("email") && (
                  <p>
                    Email: <span className="font-medium">{form.getValues("email")}</span>
                  </p>
                )}
                {accountType === "individual" && (
                  <>
                    {form.getValues("location") && (
                      <p>
                        Lokalizacja: <span className="font-medium">{form.getValues("location")}</span>
                      </p>
                    )}
                    {form.getValues("occupation") && (
                      <p>
                        Zajęcie: <span className="font-medium">{form.getValues("occupation")}</span>
                      </p>
                    )}
                    {form.getValues("interests") && (
                      <p>
                        Zainteresowania: <span className="font-medium">{form.getValues("interests")}</span>
                      </p>
                    )}
                  </>
                )}
                {accountType === "business" && (
                  <>
                    {form.getValues("nip") && (
                      <p>
                        NIP: <span className="font-medium">{form.getValues("nip")}</span>
                      </p>
                    )}
                    {form.getValues("phone") && (
                      <p>
                        Telefon: <span className="font-medium">{form.getValues("phone")}</span>
                      </p>
                    )}
                    {form.getValues("location") && (
                      <p>
                        Lokalizacja: <span className="font-medium">{form.getValues("location")}</span>
                      </p>
                    )}
                    {form.getValues("address") && (
                      <p>
                        Adres: <span className="font-medium">{form.getValues("address")}</span>
                      </p>
                    )}
                    {selectedCategories.length > 0 && (
                      <p>
                        Kategorie: <span className="font-medium">{selectedCategories.join(", ")}</span>
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="mt-6 text-sm text-muted-foreground">
                <p className="mb-2">
                  Krok {step} z {totalSteps}
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li className={step === 1 ? "text-primary font-medium" : ""}>Informacje podstawowe</li>
                  <li className={step === 2 ? "text-primary font-medium" : ""}>
                    {accountType === "individual" ? "Informacje osobiste" : "Informacje o firmie"}
                  </li>
                  <li className={step === 3 ? "text-primary font-medium" : ""}>Dodatkowe informacje</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}