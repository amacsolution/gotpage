"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PageLayout } from "@/components/page-layout"
import { useToast } from "@/hooks/use-toast"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { SimpleEditor } from "@/components/rich-editor"
import { set } from "date-fns"

// Kategorie i podkategorie
const categories = [
  {
    id: 1,
    name: "Motoryzacja",
    subcategories: ["Samochody osobowe", "Motocykle", "Części", "Przyczepy", "Ciężarowe", "Inne pojazdy"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: true, dbField: "make" },
      { name: "model", label: "Model", type: "text", required: true, dbField: "model" },
      { name: "rok", label: "Rok produkcji", type: "number", required: true, dbField: "year" },
      { name: "przebieg", label: "Przebieg (km)", type: "number", required: false, dbField: "mileage" },
      { name: "pojemnosc", label: "Pojemność silnika (cm³)", type: "number", required: false, dbField: "engine_size" },
      {
        name: "paliwo",
        label: "Rodzaj paliwa",
        type: "select",
        options: ["Benzyna", "Diesel", "LPG", "Elektryczny", "Hybryda"],
        required: false,
        dbField: "fuel_type",
      },
      {
        name: "skrzynia",
        label: "Skrzynia biegów",
        type: "select",
        options: ["Manualna", "Automatyczna"],
        required: false,
        dbField: "transmission",
      },
    ],
  },
  {
    id: 2,
    name: "Nieruchomości",
    subcategories: ["Mieszkania", "Domy", "Działki", "Biura", "Garaże", "Pokoje"],
    fields: [
      { name: "powierzchnia", label: "Powierzchnia (m²)", type: "number", required: true, dbField: "square_meters" },
      { name: "liczba_pokoi", label: "Liczba pokoi", type: "number", required: false, dbField: "rooms" },
      { name: "pietro", label: "Piętro", type: "number", required: false, dbField: "floor" },
      { name: "rok_budowy", label: "Rok budowy", type: "number", required: false, dbField: "year_built" },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Bardzo dobry", "Dobry", "Do remontu"],
        required: false,
        dbField: "heating_type", // Używamy heating_type do przechowywania stanu
      },
      { name: "umeblowane", label: "Umeblowane", type: "checkbox", required: false, dbField: "has_balcony" }, // Używamy has_balcony do przechowywania informacji o umeblowaniu
    ],
  },
  {
    id: 3,
    name: "Elektronika",
    subcategories: ["Telefony", "Komputery", "RTV", "Konsole", "Fotografia", "Akcesoria"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: true, dbField: "brand" },
      { name: "model", label: "Model", type: "text", required: true, dbField: "model" },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Używany - jak nowy", "Używany - dobry", "Używany - widoczne ślady użytkowania"],
        required: false,
        dbField: "condition_type",
      },
      { name: "gwarancja", label: "Gwarancja", type: "checkbox", required: false, dbField: "warranty_months" },
    ],
  },
  {
    id: 4,
    name: "Moda - kobiety",
    subcategories: ["Ubrania", "Buty", "Dodatki", "Biżuteria", "Torebki", "Zegarki"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: false, dbField: "brand" },
      { name: "rozmiar", label: "Rozmiar", type: "text", required: true, dbField: "size" },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Używany - jak nowy", "Używany - dobry", "Używany - widoczne ślady użytkowania"],
        required: false,
        dbField: "condition_type",
      },
      { name: "kolor", label: "Kolor", type: "text", required: false, dbField: "color" },
      { name: "material", label: "Materiał", type: "text", required: false, dbField: "material" },
    ],
  },
  {
    id: 5,
    name: "Moda - mężczyźni",
    subcategories: ["Ubrania", "Buty", "Dodatki", "Biżuteria", "Torebki", "Zegarki"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: false, dbField: "brand" },
      { name: "rozmiar", label: "Rozmiar", type: "text", required: true, dbField: "size" },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Używany - jak nowy", "Używany - dobry", "Używany - widoczne ślady użytkowania"],
        required: false,
        dbField: "condition_type",
      },
      { name: "kolor", label: "Kolor", type: "text", required: false, dbField: "color" },
      { name: "material", label: "Materiał", type: "text", required: false, dbField: "material" },
    ],
  },
  {
    id: 6,
    name: "Usługi",
    subcategories: ["Remonty", "Transport", "Korepetycje", "Sprzątanie", "Ogrodnicze", "Finansowe"],
    fields: [
      { name: "doswiadczenie", label: "Doświadczenie (lata)", type: "number", required: false, dbField: "job_type" },
      { name: "dostepnosc", label: "Dostępność", type: "text", required: false, dbField: "availability" },
      { name: "dojazd", label: "Możliwość dojazdu", type: "checkbox", required: false, dbField: "has_garage" }, // Używamy has_garage do przechowywania informacji o możliwości dojazdu
    ],
  },
  {
    id: 7,
    name: "Praca",
    subcategories: ["Etaty", "Freelance", "Zdalna", "Dorywcza", "Sezonowa"],
    fields: [
      { name: "stanowisko", label: "Stanowisko", type: "text", required: true, dbField: "position" },
      { name: "firma", label: "Firma", type: "text", required: false, dbField: "company" },
      { name: "rodzaj_umowy", label: "Rodzaj umowy", type: "select", options: ["Umowa o pracę", "Zlecenie", "Dzieło", "B2B"], required: false, dbField: "contract_type" },
      { name: "wynagrodzenie", label: "Wynagrodzenie (PLN)", type: "number", required: false, dbField: "salary" },
      { name: "lokalizacja", label: "Lokalizacja", type: "text", required: false, dbField: "location" }
    ]
  },
  {
    id: 8,
    name: "Zwierzęta",
    subcategories: ["Psy", "Koty", "Ptaki", "Gryzonie", "Ryby", "Akcesoria"],
    fields: [
      { name: "gatunek", label: "Gatunek", type: "text", required: true, dbField: "species" },
      { name: "rasa", label: "Rasa", type: "text", required: false, dbField: "breed" },
      { name: "wiek", label: "Wiek (lata)", type: "number", required: false, dbField: "age" },
      { name: "szczepienia", label: "Szczepienia", type: "checkbox", required: false, dbField: "vaccinated" }
    ]
  },
  {
    id: 9,
    name: "Sport i Hobby",
    subcategories: ["Rowery", "Fitness", "Wędkarstwo", "Instrumenty", "Kolekcje"],
    fields: [
      { name: "typ", label: "Typ", type: "text", required: true, dbField: "type" },
      { name: "marka", label: "Marka", type: "text", required: false, dbField: "brand" },
      { name: "stan", label: "Stan", type: "select", options: ["Nowy", "Używany"], required: false, dbField: "condition" }
    ]
  },
  {
    id: 10,
    name: "Dla dzieci",
    subcategories: ["Zabawki", "Wózki", "Ubrania", "Foteliki", "Meble dziecięce"],
    fields: [
      { name: "wiek", label: "Wiek dziecka (lata)", type: "number", required: false, dbField: "child_age" },
      { name: "marka", label: "Marka", type: "text", required: false, dbField: "brand" },
      { name: "kolor", label: "Kolor", type: "text", required: false, dbField: "color" }
    ]
  }
  ,
  {
    id: 11,
    name: "Rolnictwo",
    subcategories: ["Maszyny rolnicze", "Zwierzęta hodowlane", "Nawozy", "Zboża", "Usługi rolnicze"],
    fields: [
      { name: "typ", label: "Typ", type: "text", required: true, dbField: "type" },
      { name: "rok", label: "Rok produkcji", type: "number", required: false, dbField: "year" },
      { name: "moc", label: "Moc (KM)", type: "number", required: false, dbField: "power" }
    ]
  }


]
const options = ["Pralka", "Zmywarka", "Głośniki", "Telewizor", "Laptop", "Smartfon"]

// Dynamiczne budowanie schematu walidacji
const createFormSchema = (selectedCategory: string, selectedSubcategory: string) => {
  // Podstawowy schemat
  const baseSchema = z.object({
    title: z
      .string()
      .min(5, {
        message: "Tytuł musi mieć co najmniej 5 znaków",
      })
      .max(100, {
        message: "Tytuł nie może przekraczać 100 znaków",
      }),
    content: z
      .string()
      .min(20, {
        message: "Opis musi mieć co najmniej 20 znaków",
      })
      .max(5000, {
        message: "Opis nie może przekraczać 5000 znaków",
      }),
    category: z.string({
      required_error: "Wybierz kategorię",
    }),
    subcategory: z.string().optional(),
    price: z.string().optional(),
    location: z.string().min(2, {
      message: "Lokalizacja musi mieć co najmniej 2 znaki",
    }),
    adres: z.string().min(2, {
      message: "Adres musi mieć co najmniej 2 znaki",
    }),
    kod: z
      .string()
      .regex(/^\d{2}-\d{3}$/, {
        message: "Kod pocztowy musi być w formacie XX-XXX",
      }),
    isPromoted: z.boolean().default(false),
  })

  // Jeśli nie wybrano kategorii, zwróć podstawowy schemat
  if (!selectedCategory) {
    return baseSchema
  }

  // Znajdź kategorię
  const category = categories.find((c) => c.name === selectedCategory)
  if (!category) {
    return baseSchema
  }

  // Dodaj pola specyficzne dla kategorii
  const schemaExtension: Record<string, any> = {}

  category.fields.forEach((field) => {
    if (field.type === "text") {
      schemaExtension[field.name] = field.required
        ? z.string().min(1, { message: `${field.label} jest wymagane` })
        : z.string().optional()
    } else if (field.type === "number") {
      schemaExtension[field.name] = field.required
        ? z.string().min(1, { message: `${field.label} jest wymagane` })
        : z.string().optional()
    } else if (field.type === "select") {
      schemaExtension[field.name] = field.required
        ? z.string().min(1, { message: `${field.label} jest wymagane` })
        : z.string().optional()
    } else if (field.type === "checkbox") {
      schemaExtension[field.name] = z.boolean().default(false)
    }
  })

  return baseSchema.extend(schemaExtension)
}

export default function AddAdPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [categoryFields, setCategoryFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Dynamicznie tworzymy schemat formularza
  const formSchema = createFormSchema(selectedCategory, selectedSubcategory)

  // Inicjalizacja formularza
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      subcategory: "",
      finalcategory: "",
      price: "",
      location: "",
      adres: "",
      kod: "",
      isPromoted: false,
    },
  })


  useEffect(() => {
    (async () => {
      try {
        const userData = await localStorage.getItem("userData")

        if (!userData) {
          toast({
            title: "Nie jesteś zalogowany",
            description: "Zaloguj się, aby dodać ogłoszenie",
            variant: "destructive",
          })
          router.push("/login")
        }
      } catch (error) {
        //console.error("Nie jesteś zalogowany", error)
      }
    })()
    setIsDataLoading(false)
  }, [router, toast])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    form.setValue("category", value)
    form.setValue("subcategory", "")
    setSelectedSubcategory("")

    // Resetowanie wartości pól specyficznych dla kategorii
    const prevCategory = categories.find((c) => c.name === selectedCategory)
    if (prevCategory) {
      prevCategory.fields.forEach((field) => {
        form.setValue(field.name as any, field.type === "checkbox" ? false : "")
      })
    }

    const category = categories.find((c) => c.name === value)
    if (category) {
      setSubcategories(category.subcategories || [])
      setCategoryFields(category.fields || [])
    } else {
      setSubcategories([])
      setCategoryFields([])
    }
  }

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value)
    form.setValue("subcategory", value)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Sprawdzenie limitu zdjęć
      if (selectedImages.length + e.target.files.length > 5) {
        toast({
          title: "Limit zdjęć",
          description: "Możesz dodać maksymalnie 5 zdjęć",
          variant: "destructive",
        })
        return
      }

      setIsUploadingImage(true)

      try {
        const files = Array.from(e.target.files)

        // Przesyłanie zdjęć pojedynczo
        for (const file of files) {
          // Sprawdzenie typu pliku
          if (!file.type.startsWith("image/")) {
            toast({
              title: "Nieprawidłowy format",
              description: "Akceptowane są tylko obrazy",
              variant: "destructive",
            })
            continue
          }

          // Sprawdzenie rozmiaru pliku
          if (file.size > 5 * 1024 * 1024) {
            // 5MB
            toast({
              title: "Plik zbyt duży",
              description: "Maksymalny rozmiar pliku to 5MB",
              variant: "destructive",
            })
            continue
          }

          // Przesłanie zdjęcia na serwer
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Nie udało się przesłać zdjęcia")
          }

          const data = await response.json()

          // Dodanie zdjęcia do stanu
          setSelectedImages((prev) => [...prev, file])
          setImageUrls((prev) => [...prev, data.url])
        }

        toast({
          title: "Sukces",
          description: "Zdjęcia zostały przesłane",
        })
      } catch (error) {
        console.error("Błąd podczas przesyłania zdjęć:", error)
        toast({
          title: "Błąd",
          description: error instanceof Error ? error.message : "Nie udało się przesłać zdjęć",
          variant: "destructive",
        })
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const removeImage = (index: number) => {
    // Usunięcie zdjęcia z serwera
    const imageUrl = imageUrls[index]
    fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
      method: "DELETE",
    })

    // Usunięcie zdjęcia ze stanu
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Sprawdzenie, czy dodano zdjęcia
    if (selectedImages.length === 0) {
      toast({
        title: "Brak zdjęć",
        description: "Dodaj przynajmniej jedno zdjęcie",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Przygotowanie danych formularza
      const formData = new FormData()

      // Dodanie podstawowych pól
      formData.append("title", values.title)
      formData.append("content", values.content)
      formData.append("category", values.category)
      if (values.subcategory) formData.append("subcategory", values.subcategory)
      if (values.price) formData.append("price", values.price)
      formData.append("location", values.location)
      formData.append("adres", values.adres)
      formData.append("kod", values.kod)
      formData.append("isPromoted", values.isPromoted.toString())



      // Dodanie pól specyficznych dla kategorii
      const category = categories.find((c) => c.name === selectedCategory)
      if (category) {
        category.fields.forEach((field) => {
          const fieldValue = form.getValues(field.name as any)
          if (fieldValue !== undefined && fieldValue !== "") {
            // Używamy nazwy pola z formularza, a nie nazwy kolumny w bazie danych
            // Backend zajmie się mapowaniem na odpowiednie kolumny
            formData.append(field.name, fieldValue.toString())
          }
        })
      }

      // Dodanie zdjęć
      selectedImages.forEach((image) => {
        formData.append("images", image)
      })

      // Wysłanie formularza
      const response = await fetch("/api/ads", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Nie udało się dodać ogłoszenia")
      }

      const data = await response.json()

      toast({
        title: "Sukces",
        description: "Ogłoszenie zostało dodane pomyślnie",
      })

      // Przekierowanie na stronę ogłoszenia
      router.push(`/ogloszenia/${data.adId}`)
    } catch (error) {

      console.error("Błąd podczas dodawania ogłoszenia:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się dodać ogłoszenia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isDataLoading) {
    return (
      <PageLayout>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Ładowanie formularza...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dodaj ogłoszenie</h1>
          <p className="text-muted-foreground">Wypełnij poniższy formularz, aby dodać nowe ogłoszenie</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tytuł ogłoszenia</FormLabel>
                    <FormControl>
                      <Input placeholder="Np. Sprzedam samochód Toyota Corolla 2018" {...field} />
                    </FormControl>
                    <FormDescription>Tytuł powinien jasno określać, co oferujesz</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategoria</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleCategoryChange(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz kategorię" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
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
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Podkategoria</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleSubcategoryChange(value)
                        }}
                        defaultValue={field.value}
                        disabled={!selectedCategory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz podkategorię" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedSubcategory === 'RTV' && (
                <FormField
                  key="finalcategory"
                  control={form.control}
                  name="finalcategory"
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>
                        Rodzaj sprzętu
                        *
                      </FormLabel>
                      <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Wybierz podkategorie RTV`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>)}
                />
              )}

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokalizacja</FormLabel>
                    <FormControl>
                      <Input placeholder="Np. Warszawa, Mazowieckie" {...field} />
                    </FormControl>
                    <FormDescription>Podaj miasto i województwo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:inline-flex gap-4 w-full ">
                <FormField
                  control={form.control}
                  name="adres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Input placeholder="Marszałkowska 12a" {...field} />
                      </FormControl>
                      <FormDescription>Podaj ulice i numer</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kod Pocztowy</FormLabel>
                      <FormControl>
                        <Input placeholder="XX-XXX" {...field} />
                      </FormControl>
                      <FormDescription>Podaj kod pocztowy</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dynamiczne pola dla wybranej kategorii */}
              {categoryFields.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                  <h3 className="font-medium">Informacje dodatkowe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {categoryFields.map((field) => {
                      if (field.type === "text" || field.type === "number") {
                        return (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name as any}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>
                                  {field.label}
                                  {field.required && " *"}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type={field.type === "number" ? "number" : "text"}
                                    placeholder={field.label}
                                    {...formField}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      } else if (field.type === "select") {
                        return (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name as any}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>
                                  {field.label}
                                  {field.required && " *"}
                                </FormLabel>
                                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Wybierz ${field.label.toLowerCase()}`} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {field.options?.map((option: string) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      } else if (field.type === "checkbox") {
                        return (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name as any}
                            render={({ field: formField }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                                <FormControl>
                                  <Checkbox checked={formField.value} onCheckedChange={formField.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>{field.label}</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}
{/* 
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis ogłoszenia</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Opisz szczegółowo, co oferujesz..." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormDescription>Podaj wszystkie istotne informacje o ofercie</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis ogłoszenia</FormLabel>
                    <FormControl>
                      <SimpleEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>Podaj wszystkie istotne informacje o ofercie</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena (PLN)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>Pozostaw puste, jeśli cena jest do negocjacji</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Zdjęcia</FormLabel>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Zdjęcie ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors">
                      {isUploadingImage ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                          <span className="mt-2 text-xs text-muted-foreground">Dodaj zdjęcie</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        multiple
                        disabled={isUploadingImage || selectedImages.length >= 5}
                      />
                    </label>
                  </div>
                  <FormDescription>Możesz dodać do 5 zdjęć. Maksymalny rozmiar: 5MB.</FormDescription>
                </div>
              </div>

              {/* <FormField
                control={form.control}
                name="isPromoted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Promuj ogłoszenie</FormLabel>
                      <FormDescription>
                        Promowane ogłoszenia są wyświetlane na górze listy i mają specjalne oznaczenie. Koszt promocji:
                        10 PLN za 7 dni.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              /> */}

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/ogloszenia")}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publikowanie...
                    </>
                  ) : (
                    "Opublikuj ogłoszenie"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  )
}