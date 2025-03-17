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

// Kategorie i podkategorie
const categories = [
  {
    id: 1,
    name: "Motoryzacja",
    subcategories: ["Samochody osobowe", "Motocykle", "Części", "Przyczepy", "Ciężarowe", "Inne pojazdy"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: true },
      { name: "model", label: "Model", type: "text", required: true },
      { name: "rok", label: "Rok produkcji", type: "number", required: true },
      { name: "przebieg", label: "Przebieg (km)", type: "number", required: false },
      { name: "pojemnosc", label: "Pojemność silnika (cm³)", type: "number", required: false },
      {
        name: "paliwo",
        label: "Rodzaj paliwa",
        type: "select",
        options: ["Benzyna", "Diesel", "LPG", "Elektryczny", "Hybryda"],
        required: false,
      },
      {
        name: "skrzynia",
        label: "Skrzynia biegów",
        type: "select",
        options: ["Manualna", "Automatyczna"],
        required: false,
      },
    ],
  },
  {
    id: 2,
    name: "Nieruchomości",
    subcategories: ["Mieszkania", "Domy", "Działki", "Biura", "Garaże", "Pokoje"],
    fields: [
      { name: "powierzchnia", label: "Powierzchnia (m²)", type: "number", required: true },
      { name: "liczba_pokoi", label: "Liczba pokoi", type: "number", required: false },
      { name: "pietro", label: "Piętro", type: "number", required: false },
      { name: "rok_budowy", label: "Rok budowy", type: "number", required: false },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Bardzo dobry", "Dobry", "Do remontu"],
        required: false,
      },
      { name: "umeblowane", label: "Umeblowane", type: "checkbox", required: false },
    ],
  },
  {
    id: 3,
    name: "Elektronika",
    subcategories: ["Telefony", "Komputery", "RTV", "Konsole", "Fotografia", "Akcesoria"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: true },
      { name: "model", label: "Model", type: "text", required: true },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Używany - jak nowy", "Używany - dobry", "Używany - widoczne ślady użytkowania"],
        required: false,
      },
      { name: "gwarancja", label: "Gwarancja", type: "checkbox", required: false },
    ],
  },
  {
    id: 4,
    name: "Moda",
    subcategories: ["Ubrania", "Buty", "Dodatki", "Biżuteria", "Torebki", "Zegarki"],
    fields: [
      { name: "marka", label: "Marka", type: "text", required: false },
      { name: "rozmiar", label: "Rozmiar", type: "text", required: true },
      {
        name: "stan",
        label: "Stan",
        type: "select",
        options: ["Nowy", "Używany - jak nowy", "Używany - dobry", "Używany - widoczne ślady użytkowania"],
        required: false,
      },
      { name: "kolor", label: "Kolor", type: "text", required: false },
      { name: "material", label: "Materiał", type: "text", required: false },
    ],
  },
  {
    id: 5,
    name: "Usługi",
    subcategories: ["Remonty", "Transport", "Korepetycje", "Sprzątanie", "Ogrodnicze", "Finansowe"],
    fields: [
      { name: "doswiadczenie", label: "Doświadczenie (lata)", type: "number", required: false },
      { name: "dostepnosc", label: "Dostępność", type: "text", required: false },
      { name: "dojazd", label: "Możliwość dojazdu", type: "checkbox", required: false },
    ],
  },
]

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
      .max(2000, {
        message: "Opis nie może przekraczać 2000 znaków",
      }),
    category: z.string({
      required_error: "Wybierz kategorię",
    }),
    subcategory: z.string().optional(),
    price: z.string().optional(),
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
      price: "",
      isPromoted: false,
    },
  })

  // Symulacja pobierania danych z bazy
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true)
        // Tutaj byłoby rzeczywiste zapytanie do API
        // const response = await fetch('/api/categories');
        // const data = await response.json();

        // Symulacja opóźnienia sieciowego
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Używamy mock data
        setIsDataLoading(false)
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error)
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych. Używamy danych lokalnych.",
          variant: "destructive",
        })
        setIsDataLoading(false)
      }
    }

    fetchData()
  }, [toast])

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages((prev) => [...prev, ...files])

      // Create URLs for preview
      const newUrls = files.map((file) => URL.createObjectURL(file))
      setImageUrls((prev) => [...prev, ...newUrls])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index])
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Tutaj byłaby rzeczywista logika dodawania ogłoszenia
      console.log(values)
      console.log("Selected images:", selectedImages)

      // Symulacja op��źnienia
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Ogłoszenie dodane pomyślnie",
        description: "Twoje ogłoszenie zostało opublikowane",
      })

      // Przekierowanie na stronę ogłoszeń
      setTimeout(() => {
        router.push("/ogloszenia")
      }, 2000)
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać ogłoszenia. Spróbuj ponownie później.",
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
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      <span className="mt-2 text-xs text-muted-foreground">Dodaj zdjęcie</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} multiple />
                    </label>
                  </div>
                  <FormDescription>Możesz dodać do 5 zdjęć. Maksymalny rozmiar: 5MB.</FormDescription>
                </div>
              </div>

              <FormField
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
              />

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

