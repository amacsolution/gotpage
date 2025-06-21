"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "./ui/progress"

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).{8,}$/

const validateNIP = (nip: string): boolean => {
  if (typeof nip !== "string") {
    return false
  }

  nip = nip.replace(/[\s-]/g, "")

  if (nip.length !== 10 || !/^\d+$/.test(nip)) {
    return false
  }

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  let sum = 0

  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(nip[i]) * weights[i]
  }

  const controlDigit = sum % 11
  const expectedControlDigit = controlDigit === 10 ? 0 : controlDigit

  return expectedControlDigit === Number.parseInt(nip[9])
}

// Dodaj po definicji validateNIP, przed baseFormSchema:

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

// Simplified schema that avoids discriminated union type issues
const baseFormSchema = z
  .object({
    name: z.string().min(2, { message: "Nazwa użytkownika musi mieć co najmniej 2 znaki" }),
    fullName: z.string().min(2, { message: "Imię i nazwisko musi mieć co najmniej 2 znaki" }),
    email: z.string().email({ message: "Wprowadź poprawny adres email" }),
    password: z
      .string()
      .min(8, {
        message: "Hasło musi mieć co najmniej 8 znaków",
      })
      .regex(passwordRegex, {
        message:
          "Hasło musi zawierać co najmniej jedną cyfrę, jedną małą literę, jedną dużą literę i jeden znak specjalny",
      }),
    confirmPassword: z.string().min(1, { message: "Potwierdź hasło" }),
    accountType: z.enum(["individual", "business"]),
    // Individual fields
    location: z.string().optional(),
    occupation: z.string().optional(),
    interests: z.string().optional(),
    relationshipStatus: z.string().optional(),
    education: z.string().optional(),
    // Business fields
    nip: z.string().optional(),
    regon: z.string().optional(),
    krs: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    categories: z.array(z.string()).optional(),
    companySize: z.string().optional(),
    foundingYear: z.string().optional(),
    website: z.string().optional(),
    openingHours: z.string().optional(),
    services: z.string().optional(),
    // Common fields
    bio: z.string().optional(),
    facebookUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    linkedinUrl: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować regulamin",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  })

export const formSchema = baseFormSchema

// Explicit type definition
type FormValues = z.infer<typeof formSchema>

export function MultiStepRegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState<"individual" | "business">("individual")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const form = useForm<FormValues>({
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
    } satisfies Partial<FormValues>,
  })

  // Dodaj funkcję handleCategoryChange po definicji form:

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

  // Dodaj po definicji form, przed funkcją onSubmit
  const validateCurrentStep = async () => {
    let isValid = false

    if (step === 1) {
      // Walidacja pierwszego kroku - wszystkie pola wymagane
      isValid = await form.trigger(["name", "fullName", "email", "password", "confirmPassword"])

      // Dodatkowa walidacja zgodności haseł
      const password = form.getValues("password")
      const confirmPassword = form.getValues("confirmPassword")

      if (password !== confirmPassword) {
        form.setError("confirmPassword", {
          type: "manual",
          message: "Hasła nie są identyczne",
        })
        isValid = false
      }
    } else if (step === 2) {
      // Drugi krok - accountType i bio (opcjonalne)
      isValid = await form.trigger(["accountType"])
    } else if (step === 3) {
      // Trzeci krok - walidacja w zależności od typu konta
      if (accountType === "business") {
        isValid = await form.trigger(["location", "address", "categories", "termsAccepted"])
      } else {
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
        title: "Błąd walidacji",
        description: "Wypełnij wszystkie wymagane pola przed przejściem dalej",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    setStep(Math.max(step - 1, 1))
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    if (values.nip) {
      const nip = validateNIP(values.nip) 
      if(nip) {
        toast({
        title: "Błąd walidacji",
        description: "Podaj prawdziwy numer NIP",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    } 
  }

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
        toast({
          title: "Wystąpił błąd!",
          description: data.error,
          })
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

  let progress = (step / totalSteps) * 100

  return (
    <Form {...form}>
      <Progress value={progress} className="mb-2" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Account Information */}
        {step === 1 && (
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa użytkownika</FormLabel>
                  <FormControl>
                    <Input placeholder="jankowal24" {...field} />
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
                    <Input placeholder="Jan Kowalski" {...field} />
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
                    <Input placeholder="jan@example.com" {...field} />
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
                    <Input type="password" placeholder="Wprowadź hasło" {...field} />
                  </FormControl>
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
                    <Input type="password" placeholder="Potwierdź hasło" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 2: Account Type and Bio */}
        {step === 2 && (
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ konta</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setAccountType(value as "individual" | "business")
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ konta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="individual">Osoba prywatna</SelectItem>
                      <SelectItem value="business">Firma</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O sobie</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Napisz kilka słów o sobie..." className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Możesz napisać krótko o sobie. Maksymalnie 160 znaków.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 3: Additional Information based on Account Type */}
        {step === 3 && (
          <div className="space-y-8">
            {accountType === "individual" ? (
              <>
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zawód</FormLabel>
                      <FormControl>
                        <Input placeholder="np. Programista, Student" {...field} />
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
                        <Input placeholder="np. Sport, muzyka, podróże" {...field} />
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
                      <FormControl>
                        <Input placeholder="np. Singiel, W związku" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="np. Wyższe, Średnie" {...field} />
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
                        <Input placeholder="https://facebook.com/twojprofil" {...field} />
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
                        <Input placeholder="https://instagram.com/twojprofil" {...field} />
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
                        <Input placeholder="https://tiktok.com/@twojprofil" {...field} />
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
                        <Input placeholder="https://linkedin.com/in/twojprofil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
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
                        <Input placeholder="123456789" {...field} />
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
                        <Input placeholder="0000123456" {...field} />
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
                        <Input placeholder="123456789" {...field} />
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
                        <Input placeholder="Warszawa, Mazowieckie" {...field} />
                      </FormControl>
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
                        <Input placeholder="ul. Przykładowa 1/2" {...field} />
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
                      <FormControl>
                        <Input placeholder="1-10 pracowników" {...field} />
                      </FormControl>
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
                        <Input placeholder="2020" {...field} />
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
                        <Input placeholder="https://twojafirma.pl" {...field} />
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
                        <Input placeholder="Pon-Pt: 9:00-17:00" {...field} />
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
                      <FormLabel>Usługi</FormLabel>
                      <FormControl>
                        <Input placeholder="Opisz oferowane usługi..." {...field} />
                      </FormControl>
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
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-80 overflow-y-auto">
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
                      <FormDescription>
                        Wybierz maksymalnie 3 kategorie, które najlepiej opisują Twoją działalność
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Akceptuję regulamin i politykę prywatności</FormLabel>
                    <FormDescription>Musisz zaakceptować regulamin aby kontynuować.</FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <Button variant="secondary" onClick={prevStep} disabled={isLoading}>
              Wstecz
            </Button>
          )}
          {step < totalSteps ? (
            <Button type="button" onClick={nextStep} disabled={isLoading}>
              Dalej
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              Zarejestruj się
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
