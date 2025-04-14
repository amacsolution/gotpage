"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Trash2, Upload, Plus, X, Save, Eye } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { useToast } from "@/hooks/use-toast"

export function EditAdClient({ id }: { id: string }) {
  const [ad, setAd] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Stany dla pól formularza
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("PLN")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [location, setLocation] = useState("")
  const [parameters, setParameters] = useState<any[]>([])

  // Dodatkowe pola dla różnych kategorii
  const [additionalFields, setAdditionalFields] = useState<Record<string, any>>({})

  useEffect(() => {
    // Pobieranie danych ogłoszenia
    const fetchAd = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/ads/${id}`)
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setAd(data)

        // Inicjalizacja stanów formularza
        setTitle(data.title || "")
        setContent(data.content || data.description || "")
        setPrice(data.price?.toString() || "")
        setCurrency(data.currency || "PLN")
        setCategory(data.category || "")
        setSubcategory(data.subcategory || "")
        setLocation(data.location || "")
        setParameters(data.parameters || [])

        // Inicjalizacja dodatkowych pól
        const fields: Record<string, any> = {}

        // Pola dla kategorii Nieruchomości
        if (data.category === "Nieruchomości") {
          fields.square_meters = data.square_meters || ""
          fields.rooms = data.rooms || ""
          fields.floor = data.floor || ""
          fields.total_floors = data.total_floors || ""
          fields.year_built = data.year_built || ""
          fields.heating_type = data.heating_type || ""
          fields.has_balcony = data.has_balcony || false
          fields.has_garage = data.has_garage || false
        }

        // Pola dla kategorii Motoryzacja
        if (data.category === "Motoryzacja") {
          fields.make = data.make || ""
          fields.model = data.model || ""
          fields.year = data.year || ""
          fields.mileage = data.mileage || ""
          fields.fuel_type = data.fuel_type || ""
          fields.transmission = data.transmission || ""
          fields.engine_size = data.engine_size || ""
          fields.color = data.color || ""
        }

        // Pola dla kategorii Elektronika
        if (data.category === "Elektronika") {
          fields.brand = data.brand || ""
          fields.condition_type = data.condition_type || ""
          fields.warranty_months = data.warranty_months || ""
        }

        setAdditionalFields(fields)
      } catch (error) {
        console.error("Błąd podczas pobierania ogłoszenia:", error)
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać ogłoszenia. Spróbuj ponownie później.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAd()
  }, [id, toast])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setNewImages((prev) => [...prev, ...files])

      // Tworzenie podglądów
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setNewImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting && ad.images[index]) {
      setImagesToDelete((prev) => [...prev, ad.images[index]])
      const updatedImages = [...ad.images]
      updatedImages.splice(index, 1)
      setAd({ ...ad, images: updatedImages })

      if (activeImageIndex >= updatedImages.length) {
        setActiveImageIndex(Math.max(0, updatedImages.length - 1))
      }
    } else {
      const newIndex = index - (ad.images.length || 0)
      if (newIndex >= 0) {
        const updatedNewImages = [...newImages]
        const updatedPreviews = [...newImagePreviews]

        URL.revokeObjectURL(updatedPreviews[newIndex])
        updatedNewImages.splice(newIndex, 1)
        updatedPreviews.splice(newIndex, 1)

        setNewImages(updatedNewImages)
        setNewImagePreviews(updatedPreviews)
      }
    }
  }

  const addParameter = () => {
    setParameters([...parameters, { name: "", value: "" }])
  }

  const updateParameter = (index: number, field: "name" | "value", value: string) => {
    const updatedParameters = [...parameters]
    updatedParameters[index][field] = value
    setParameters(updatedParameters)
  }

  const removeParameter = (index: number) => {
    const updatedParameters = [...parameters]
    updatedParameters.splice(index, 1)
    setParameters(updatedParameters)
  }

  const updateAdditionalField = (field: string, value: any) => {
    setAdditionalFields((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Przygotowanie danych do wysłania
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("price", price)
      formData.append("currency", currency)
      formData.append("category", category)
      formData.append("subcategory", subcategory || "")
      formData.append("location", location)
      formData.append("parameters", JSON.stringify(parameters))

      // Dodanie dodatkowych pól
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value?.toString() || "")
      })

      // Dodanie nowych zdjęć
      newImages.forEach((file) => {
        formData.append("images", file)
      })

      // Dodanie listy zdjęć do usunięcia
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete))

      // Wysłanie danych
      const response = await fetch(`/api/ads/${id}`, {
        method: "PUT",
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      toast({
        title: "Sukces",
        description: "Ogłoszenie zostało zaktualizowane.",
      })

      // Przekierowanie do strony ogłoszenia
      router.push(`/ogloszenia/${id}`)
      router.refresh()
    } catch (error) {
      console.error("Błąd podczas aktualizacji ogłoszenia:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ogłoszenia. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    router.push(`/ogloszenia/${id}`)
  }

  // Skeleton loading dla całej strony
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-6">
          <div className="mb-6">
            <div className="flex items-center text-muted-foreground">
              <Skeleton className="h-4 w-4 mr-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Lewa kolumna - skeleton zdjęcia */}
            <div className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3].map((_, index) => (
                  <Skeleton key={index} className="w-24 h-24 rounded-md" />
                ))}
              </div>
            </div>

            {/* Prawa kolumna - skeleton informacji */}
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
            </div>
          </div>

          {/* Skeleton zakładek */}
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-40 w-full mb-8" />
        </div>
      </PageLayout>
    )
  }

  if (!ad) {
    return (
      <PageLayout>
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Ogłoszenie nie zostało znalezione</h1>
            <Link href="/ogloszenia">
              <Button>Wróć do ogłoszeń</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <Link href={`/ogloszenia/${id}`} className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Wróć do ogłoszenia
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Podgląd
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </div>
        </div>

        {/* Układ: zdjęcie po lewej, informacje po prawej */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Lewa kolumna - zdjęcia */}
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
              {ad.images.length > 0 || newImagePreviews.length > 0 ? (
                <>
                  {activeImageIndex < ad.images.length ? (
                    <Image
                      src={ad.images[activeImageIndex].image_url || "/placeholder.svg?height=600&width=800"}
                      alt={title}
                      fill
                      className="object-fill"
                    />
                  ) : (
                    <Image
                      src={
                        newImagePreviews[activeImageIndex - ad.images.length] || "/placeholder.svg?height=600&width=800"
                      }
                      alt={title}
                      fill
                      className="object-contain"
                    />
                  )}
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    onClick={() => removeImage(activeImageIndex, activeImageIndex < ad.images.length)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Dodaj zdjęcia ogłoszenia</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* Istniejące zdjęcia */}
              {ad.images.map((image: string, index: number) => (
                <div
                  key={`existing-${index}`}
                  className={`relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${
                    activeImageIndex === index ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={ad.images[index].image_url|| "/placeholder.svg?height=100&width=100"}
                    alt={`${title} - zdjęcie ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index, true)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Nowe zdjęcia */}
              {newImagePreviews.map((preview, index) => (
                <div
                  key={`new-${index}`}
                  className={`relative w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${
                    activeImageIndex === (ad.images.length + index) ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setActiveImageIndex(ad.images.length + index)}
                >
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt={`Nowe zdjęcie ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(ad.images.length + index, false)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Przycisk dodawania zdjęć */}
              <div
                className="w-24 h-24 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>

          {/* Prawa kolumna - formularz */}
          <div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Tytuł ogłoszenia</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Wpisz tytuł ogłoszenia"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Cena</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Wpisz cenę"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Waluta</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency" className="mt-1">
                      <SelectValue placeholder="Wybierz walutę" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLN">PLN</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nieruchomości">Nieruchomości</SelectItem>
                      <SelectItem value="Motoryzacja">Motoryzacja</SelectItem>
                      <SelectItem value="Elektronika">Elektronika</SelectItem>
                      <SelectItem value="Dom i ogród">Dom i ogród</SelectItem>
                      <SelectItem value="Moda">Moda</SelectItem>
                      <SelectItem value="Praca">Praca</SelectItem>
                      <SelectItem value="Usługi">Usługi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Podkategoria</Label>
                  <Input
                    id="subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Wpisz podkategorię"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Lokalizacja</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Wpisz lokalizację"
                  className="mt-1"
                />
              </div>

              {/* Informacje o sprzedającym - tylko do wyświetlenia */}
              <Card className="p-4 mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ad.author.avatar} alt={ad.author.name} />
                    <AvatarFallback>{ad.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{ad.author.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ad.author.type === "individual" ? "Osoba prywatna" : "Firma"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Edytujesz swoje ogłoszenie. Zmiany będą widoczne dla wszystkich użytkowników po zapisaniu.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Zakładki z opisem, parametrami */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              Opis
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex-1">
              Parametry
            </TabsTrigger>
            {category === "Nieruchomości" && (
              <TabsTrigger value="real-estate" className="flex-1">
                Szczegóły nieruchomości
              </TabsTrigger>
            )}
            {category === "Motoryzacja" && (
              <TabsTrigger value="automotive" className="flex-1">
                Szczegóły pojazdu
              </TabsTrigger>
            )}
            {category === "Elektronika" && (
              <TabsTrigger value="electronics" className="flex-1">
                Szczegóły elektroniki
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="description" className="mt-4">
            <Card className="p-4">
              <Label htmlFor="content">Opis ogłoszenia</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Opisz swoje ogłoszenie szczegółowo..."
                className="mt-1 min-h-[200px]"
              />
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="mt-4">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Parametry ogłoszenia</h3>
                <Button variant="outline" size="sm" onClick={addParameter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj parametr
                </Button>
              </div>

              <div className="space-y-4">
                {parameters.map((param, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={param.name}
                      onChange={(e) => updateParameter(index, "name", e.target.value)}
                      placeholder="Nazwa parametru"
                      className="flex-1"
                    />
                    <Input
                      value={param.value}
                      onChange={(e) => updateParameter(index, "value", e.target.value)}
                      placeholder="Wartość"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParameter(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {parameters.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Brak parametrów. Kliknij "Dodaj parametr", aby dodać pierwszy.
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Zakładka dla nieruchomości */}
          <TabsContent value="real-estate" className="mt-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="square_meters">Powierzchnia (m²)</Label>
                  <Input
                    id="square_meters"
                    type="number"
                    value={additionalFields.square_meters || ""}
                    onChange={(e) => updateAdditionalField("square_meters", e.target.value)}
                    placeholder="Wpisz powierzchnię"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rooms">Liczba pokoi</Label>
                  <Input
                    id="rooms"
                    type="number"
                    value={additionalFields.rooms || ""}
                    onChange={(e) => updateAdditionalField("rooms", e.target.value)}
                    placeholder="Wpisz liczbę pokoi"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="floor">Piętro</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={additionalFields.floor || ""}
                    onChange={(e) => updateAdditionalField("floor", e.target.value)}
                    placeholder="Wpisz piętro"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="total_floors">Liczba pięter w budynku</Label>
                  <Input
                    id="total_floors"
                    type="number"
                    value={additionalFields.total_floors || ""}
                    onChange={(e) => updateAdditionalField("total_floors", e.target.value)}
                    placeholder="Wpisz liczbę pięter"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="year_built">Rok budowy</Label>
                  <Input
                    id="year_built"
                    type="number"
                    value={additionalFields.year_built || ""}
                    onChange={(e) => updateAdditionalField("year_built", e.target.value)}
                    placeholder="Wpisz rok budowy"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="heating_type">Rodzaj ogrzewania</Label>
                  <Select
                    value={additionalFields.heating_type || ""}
                    onValueChange={(value) => updateAdditionalField("heating_type", value)}
                  >
                    <SelectTrigger id="heating_type" className="mt-1">
                      <SelectValue placeholder="Wybierz rodzaj ogrzewania" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gazowe">Gazowe</SelectItem>
                      <SelectItem value="Elektryczne">Elektryczne</SelectItem>
                      <SelectItem value="Miejskie">Miejskie</SelectItem>
                      <SelectItem value="Węglowe">Węglowe</SelectItem>
                      <SelectItem value="Kominkowe">Kominkowe</SelectItem>
                      <SelectItem value="Inne">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    id="has_balcony"
                    checked={additionalFields.has_balcony || false}
                    onCheckedChange={(checked) => updateAdditionalField("has_balcony", checked)}
                  />
                  <Label htmlFor="has_balcony">Balkon</Label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    id="has_garage"
                    checked={additionalFields.has_garage || false}
                    onCheckedChange={(checked) => updateAdditionalField("has_garage", checked)}
                  />
                  <Label htmlFor="has_garage">Garaż</Label>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Zakładka dla motoryzacji */}
          <TabsContent value="automotive" className="mt-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Marka</Label>
                  <Input
                    id="make"
                    value={additionalFields.make || ""}
                    onChange={(e) => updateAdditionalField("make", e.target.value)}
                    placeholder="Wpisz markę"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={additionalFields.model || ""}
                    onChange={(e) => updateAdditionalField("model", e.target.value)}
                    placeholder="Wpisz model"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Rok produkcji</Label>
                  <Input
                    id="year"
                    type="number"
                    value={additionalFields.year || ""}
                    onChange={(e) => updateAdditionalField("year", e.target.value)}
                    placeholder="Wpisz rok produkcji"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Przebieg (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={additionalFields.mileage || ""}
                    onChange={(e) => updateAdditionalField("mileage", e.target.value)}
                    placeholder="Wpisz przebieg"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel_type">Rodzaj paliwa</Label>
                  <Select
                    value={additionalFields.fuel_type || ""}
                    onValueChange={(value) => updateAdditionalField("fuel_type", value)}
                  >
                    <SelectTrigger id="fuel_type" className="mt-1">
                      <SelectValue placeholder="Wybierz rodzaj paliwa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Benzyna">Benzyna</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="LPG">LPG</SelectItem>
                      <SelectItem value="Elektryczny">Elektryczny</SelectItem>
                      <SelectItem value="Hybryda">Hybryda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transmission">Skrzynia biegów</Label>
                  <Select
                    value={additionalFields.transmission || ""}
                    onValueChange={(value) => updateAdditionalField("transmission", value)}
                  >
                    <SelectTrigger id="transmission" className="mt-1">
                      <SelectValue placeholder="Wybierz skrzynię biegów" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manualna">Manualna</SelectItem>
                      <SelectItem value="Automatyczna">Automatyczna</SelectItem>
                      <SelectItem value="Półautomatyczna">Półautomatyczna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="engine_size">Pojemność silnika (cm³)</Label>
                  <Input
                    id="engine_size"
                    type="number"
                    value={additionalFields.engine_size || ""}
                    onChange={(e) => updateAdditionalField("engine_size", e.target.value)}
                    placeholder="Wpisz pojemność silnika"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Kolor</Label>
                  <Input
                    id="color"
                    value={additionalFields.color || ""}
                    onChange={(e) => updateAdditionalField("color", e.target.value)}
                    placeholder="Wpisz kolor"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Zakładka dla elektroniki */}
          <TabsContent value="electronics" className="mt-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marka</Label>
                  <Input
                    id="brand"
                    value={additionalFields.brand || ""}
                    onChange={(e) => updateAdditionalField("brand", e.target.value)}
                    placeholder="Wpisz markę"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="condition_type">Stan</Label>
                  <Select
                    value={additionalFields.condition_type || ""}
                    onValueChange={(value) => updateAdditionalField("condition_type", value)}
                  >
                    <SelectTrigger id="condition_type" className="mt-1">
                      <SelectValue placeholder="Wybierz stan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nowy">Nowy</SelectItem>
                      <SelectItem value="Używany - jak nowy">Używany - jak nowy</SelectItem>
                      <SelectItem value="Używany - dobry">Używany - dobry</SelectItem>
                      <SelectItem value="Używany - widoczne ślady użytkowania">
                        Używany - widoczne ślady użytkowania
                      </SelectItem>
                      <SelectItem value="Do naprawy">Do naprawy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="warranty_months">Gwarancja (miesiące)</Label>
                  <Input
                    id="warranty_months"
                    type="number"
                    value={additionalFields.warranty_months || ""}
                    onChange={(e) => updateAdditionalField("warranty_months", e.target.value)}
                    placeholder="Wpisz okres gwarancji"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Przyciski akcji na dole */}
        <div className="flex justify-end gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push(`/ogloszenia/${id}`)}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}

