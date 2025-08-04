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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PageLayout } from "@/components/page-layout"
import { useToast } from "@/hooks/use-toast"
import { ImagePlus, X, Loader2, Filter } from "lucide-react"
import { SimpleEditor } from "@/components/rich-editor"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import slugify from "slugify"
import { categorySpecificFields } from "@/lib/category-fields"
import categories from "@/lib/categories"

type Field = {
  name: string
  label: string
  type: string
  required: boolean
  dbField: string
  options?: string[]
}

// Poprawiona funkcja getFieldsForSubSubcategory
const getFieldsForSubSubcategory = (category: string, subcategory: string, subSubcategory?: string) => {
  // Sprawdź czy istnieją pola specyficzne dla tej kombinacji kategorii
  if (categorySpecificFields[category]) {
    const categoryFields = categorySpecificFields[category]
    // Jeśli mamy sub-subcategorię, szukaj jej
    if (subSubcategory && categoryFields[subSubcategory]) {
      return categoryFields[subSubcategory]
    }
    // Jeśli nie ma sub-subcategorii, szukaj subcategorii
    if (categoryFields[subcategory]) {
      return categoryFields[subcategory]
    }
  }
  // Jeśli nie ma specyficznych pól, zwróć puste pole
  return []
}

// Dynamiczne budowanie schematu walidacji
const createFormSchema = (selectedCategory: string, selectedSubcategory: string, selectedSubSubcategory: string) => {
  const baseSchema = z.object({
    title: z
      .string()
      .min(5, { message: "Tytuł musi mieć co najmniej 5 znaków" })
      .max(100, { message: "Tytuł nie może przekraczać 100 znaków" }),
    content: z.string().min(20, { message: "Opis musi mieć co najmniej 20 znaków" }),
    category: z.string({ required_error: "Wybierz kategorię" }),
    subcategory: z.string().optional(),
    finalcategory: z.string().optional(),
    price: z.string().optional(),
    location: z.string().min(2, { message: "Lokalizacja musi mieć co najmniej 2 znaki" }),
    adres: z.string().optional(),
    kod: z
      .string()
      .regex(/^\d{2}-\d{3}$/, { message: "Kod pocztowy musi być w formacie XX-XXX" })
      .optional()
      .or(z.literal("")),
    isPromoted: z.boolean().default(false),
  })

  if (!selectedCategory) {
    return baseSchema
  }

  // Pobierz pola dla konkretnej kategorii/subcategorii/sub-subcategorii
  const fields = getFieldsForSubSubcategory(selectedCategory, selectedSubcategory, selectedSubSubcategory)
  const schemaExtension: Record<string, any> = {}

  fields.forEach((field: any) => {
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
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<string>("")
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [subsubcategories, setSubSubcategories] = useState<string[]>([])
  const [categoryFields, setCategoryFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isHelloPage, setIsHelloPage] = useState(true)

  // Dynamicznie tworzymy schemat formularza
  const formSchema = createFormSchema(selectedCategory, selectedSubcategory, selectedSubSubcategory)

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
    ;(async () => {
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
        const user = userData ? JSON.parse(userData) : false
        user.location ? form.setValue("location", user.location) : ""
        user.adress ? form.setValue("adres", user.adress) : ""
      } catch (error) {
        // console.error("Nie jesteś zalogowany", error)
      }
    })()
    setIsDataLoading(false)
  }, [router, toast])

  const handleCategoryChange = async (value: string) => {
    setSelectedCategory(value)
    form.setValue("category", value)
    form.setValue("subcategory", "")
    form.setValue("finalcategory", "")
    setSelectedSubcategory("")
    setSelectedSubSubcategory("")
    setCategoryFields([])

    const category = categories.find((c) => c.name === value)
    if (category) {
      setSubcategories(category.subcategories || [])
    } else {
      setSubcategories([])
    }
    setSubSubcategories([])
  }

  const handleSubcategoryChange = async (value: string) => {
    setSelectedSubcategory(value)
    form.setValue("subcategory", value)
    form.setValue("finalcategory", "")
    setSelectedSubSubcategory("")

    const category = categories.find((c) => c.name === selectedCategory)
    if (category && category.subsubcategories) {
      const subSubcats = (category.subsubcategories as Record<string, string[] | undefined>)[value] || []
      setSubSubcategories(subSubcats)
      // Jeśli nie ma sub-subcategorii, pobierz pola dla subcategorii
      if (subSubcats.length === 0) {
        const fields = getFieldsForSubSubcategory(selectedCategory, value)
        setCategoryFields(fields)
      } else {
        setCategoryFields([])
      }
    } else {
      setSubSubcategories([])
      // Pobierz pola dla subcategorii jeśli nie ma sub-subcategorii
      const fields = getFieldsForSubSubcategory(selectedCategory, value)
      setCategoryFields(fields)
    }
  }

  const handleSubSubcategoryChange = async (value: string) => {
    setSelectedSubSubcategory(value)
    form.setValue("finalcategory", value)
    // Pobierz pola specyficzne dla tej sub-subcategorii
    const fields = getFieldsForSubSubcategory(selectedCategory, selectedSubcategory, value)
    setCategoryFields(fields)
    // Resetuj wartości poprzednich pól
    const prevFields = categoryFields
    prevFields.forEach((field: any) => {
      form.setValue(field.name as any, field.type === "checkbox" ? false : "")
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (selectedImages.length + e.target.files.length > 25) {
        toast({
          title: "Limit zdjęć",
          description: "Możesz dodać maksymalnie 25 zdjęć",
          variant: "destructive",
        })
        return
      }

      setIsUploadingImage(true)
      try {
        const files = Array.from(e.target.files)
        for (const file of files) {
          if (!file.type.startsWith("image/")) {
            toast({
              title: "Nieprawidłowy format",
              description: "Akceptowane są tylko obrazy",
              variant: "destructive",
            })
            continue
          }

          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "Plik zbyt duży",
              description: "Maksymalny rozmiar pliku to 10MB",
              variant: "destructive",
            })
            continue
          }

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
    const imageUrl = imageUrls[index]
    fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
      method: "DELETE",
    })
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(imageUrls[index])
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleQuickSelect = (categoryName: string, subcategoryName: string, subsubcatName?: string) => {
    const category = categories.find((c) => c.name === categoryName)
    if (!category) return

    setSelectedCategory(categoryName)
    setSelectedSubcategory(subcategoryName)
    setSelectedSubSubcategory(subsubcatName || "")
    form.setValue("category", categoryName)
    form.setValue("subcategory", subcategoryName)
    form.setValue("finalcategory", subsubcatName || "")

    // Ustaw subcategories
    setSubcategories(category.subcategories || [])

    // Ustaw subsubcategories (na podstawie wybranej subkategorii)
    const subsubcats = (category.subsubcategories as Record<string, string[] | undefined>)[subcategoryName] || []
    setSubSubcategories(subsubcats)

    // POPRAWKA: Pobierz pola dla odpowiedniej kombinacji
    let fields: any[] = []
    if (subsubcatName) {
      // Jeśli mamy subsubcategory, użyj jej
      fields = getFieldsForSubSubcategory(categoryName, subcategoryName, subsubcatName)
    } else if (subsubcats.length === 0) {
      // Jeśli nie ma subsubcategories, użyj subcategory
      fields = getFieldsForSubSubcategory(categoryName, subcategoryName)
    }
    // Jeśli są subsubcategories ale nie wybrano żadnej, nie ustawiaj pól

    setCategoryFields(fields)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    if (selectedImages.length === 0) {
      toast({
        title: "Brak zdjęć",
        description: "Dodaj przynajmniej jedno zdjęcie",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("content", values.content)
      formData.append("category", values.category)
      if (values.subcategory) formData.append("subcategory", values.subcategory)
      if (values.finalcategory) formData.append("finalcategory", values.finalcategory)
      if (values.price) formData.append("price", values.price)
      formData.append("location", values.location)
      formData.append("adres", values.adres || "")
      formData.append("kod", values.kod || "")
      formData.append("isPromoted", "false")

      // Dodanie pól specyficznych dla sub-subcategorii
      categoryFields.forEach((field) => {
        const fieldValue = form.getValues(field.name as any)
        if (fieldValue !== undefined && fieldValue !== "") {
          formData.append(field.name, fieldValue.toString())
        }
      })

      selectedImages.forEach((image) => {
        formData.append("images", image)
      })

      const response = await fetch("/api/ogloszenia", {
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

      router.push(`/ogloszenia/${data.adId}-${slugify(String(values.title || data.title || ""))}`)
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

  const wybory = [
    {
      name: "Samochód",
      icon: "🚗",
      category: "Motoryzacja",
      subcategory: "Samochody osobowe",
      subsubcat: "",
      color: "bg-red-100 text-red-800 hover:bg-red-400",
    },
    {
      name: "Dom",
      icon: "🏠",
      category: "Nieruchomości",
      subcategory: "Na sprzedaż",
      subsubcat: "Domy",
      color: "bg-blue-100 text-blue-800 hover:bg-blue-400",
    },
    {
      name: "Telefon",
      icon: "📱",
      category: "Elektronika",
      subcategory: "Telefony i Akcesoria",
      subsubcat: "Smartfony",
      color: "bg-purple-100 text-purple-800 hover:bg-purple-400",
    },
    {
      name: "Sukienka",
      icon: "👗",
      category: "Moda",
      subcategory: "Kobiety",
      subsubcat: "Sukienki",
      color: "bg-pink-100 text-pink-800 hover:bg-pink-400",
    },
    {
      name: "Laptop",
      icon: "💻",
      category: "Elektronika",
      subcategory: "Komputery i Akcesoria",
      subsubcat: "Laptopy/Netbooki",
      color: "bg-green-100 text-green-800 hover:bg-green-400",
    },
  ]

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
  } else if (isHelloPage) {
    return (
      <PageLayout>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-3xl font-bold mb-2">Dodaj szybko ogłoszenie</h1>
            <p className="text-muted-foreground">Skorzystaj z szybkich wyborów</p>
            <div className="mt-6 flex flex-wrap max-w-[600px] gap-2">
              {wybory.map((w, index) => (
                <motion.div
                  key={w.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.2 }}
                  whileHover={{ scale: 1.2, animationDuration: 0.1 }}
                >
                  <Badge
                    className={`text-sm py-1.5 px-3 cursor-pointer ${w.color ? w.color : "hover:bg-foreground/40 bg-foreground/20"}`}
                    onClick={async () => {
                      handleQuickSelect(w.category, w.subcategory, w.subsubcat)
                      setIsHelloPage(false)
                    }}
                  >
                    <span className="mr-1">{w.icon}</span> {w.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
            <p className="text-muted-foreground mt-5 font-bold mb-2">Lub</p>
            <motion.div
              initial={{ opacity: 0, y: 0, x: -100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
            >
              <Badge
                className="mt-4 text-sm py-1.5 px-3 cursor-pointer hover:bg-foreground/60 bg-foreground/30"
                onClick={() => setIsHelloPage(false)}
              >
                <Filter className="h-3 w-3 mr-1" /> Dodaj samodzielnie
              </Badge>
            </motion.div>
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

              {((selectedSubcategory !== "" && subsubcategories.length > 0) || selectedSubSubcategory !== "") && (
                <FormField
                  key="finalcategory"
                  control={form.control}
                  name="finalcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dokładna kategoria</FormLabel>
                      <Select
                        onValueChange={(value) => handleSubSubcategoryChange(value)}
                        defaultValue={selectedSubSubcategory || field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz dokładną kategorię" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subsubcategories.map((option: string) => (
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

              <div className="md:inline-flex gap-4 w-full">
                <FormField
                  control={form.control}
                  name="adres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Input placeholder="Marszałkowska 12a" {...field} />
                      </FormControl>
                      <FormDescription>Podaj ulicę i numer</FormDescription>
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

              {/* Dynamiczne pola dla wybranej kategorii/subcategorii/sub-subcategorii */}
              {categoryFields.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                  <h3 className="font-medium">
                    Informacje dodatkowe dla: {selectedSubSubcategory || selectedSubcategory}
                  </h3>
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
                              <FormItem className="flex flex-row mt-6 items-start space-x-3 space-y-0 rounded-md p-4">
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
                        disabled={isUploadingImage || selectedImages.length >= 25}
                      />
                    </label>
                  </div>
                  <FormDescription>Możesz dodać do 25 zdjęć. Maksymalny rozmiar zdjęcia: 10MB.</FormDescription>
                </div>
              </div>

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
