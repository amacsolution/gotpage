"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ImageIcon, SmilePlus, X, Plus, Check, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ImageGrid } from "./image-grid"

interface NewsPostFormProps {
  user: {
    id: string
    name: string
    avatar: string | null
  }
  onPostCreated: (post: any) => void
}

type PostType = "text" | "image" | "poll"
type PollOption = { id: string; text: string }

export function NewsPostForm({ user, onPostCreated }: NewsPostFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<PostType>("text")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ])
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollImagePreview, setPollImagePreview] = useState<string | null>(null)
  const [pollImageFile, setPollImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (activeTab === "text" && !content.trim()) {
      toast({
        title: "Błąd",
        description: "Treść wpisu nie może być pusta",
        variant: "destructive",
      })
      return
    }

    if (activeTab === "image" && imageFiles.length === 0) {
      toast({
        title: "Błąd",
        description: "Wybierz co najmniej jedno zdjęcie do publikacji",
        variant: "destructive",
      })
      return
    }

    if (activeTab === "poll") {
      if (!pollQuestion.trim()) {
        toast({
          title: "Błąd",
          description: "Pytanie ankiety nie może być puste",
          variant: "destructive",
        })
        return
      }

      const validOptions = pollOptions.filter((option) => option.text.trim() !== "")
      if (validOptions.length < 2) {
        toast({
          title: "Błąd",
          description: "Ankieta musi zawierać co najmniej dwie opcje",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setIsLoading(true)

      let postData: any = { content }

      // Obsługa wielu zdjęć
      if (activeTab === "image" && imageFiles.length > 0) {
        // Przesyłanie wszystkich zdjęć
        const imageUrls = []
        for (const file of imageFiles) {
          const formData = new FormData()
          formData.append("file", file)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error(`Nie udało się przesłać zdjęcia: ${file.name}`)
          }

          const { url } = await uploadResponse.json()
          imageUrls.push(url)
        }

        postData = {
          content: content.trim() ? content : "Nowe zdjęcie",
          type: "image",
          imageUrls: imageUrls,
        }

        // Jeśli jest tylko jedno zdjęcie, dodajemy też imageUrl dla kompatybilności
        if (imageUrls.length === 1) {
          postData.imageUrl = imageUrls[0]
        }
      } else if (activeTab === "poll") {
        postData = {
          content: pollQuestion,
          type: "poll",
          pollOptions: pollOptions.filter((option) => option.text.trim() !== "").map((option) => option.text),
        }

        // Dodanie zdjęcia do ankiety, jeśli istnieje
        if (pollImageFile) {
          const formData = new FormData()
          formData.append("file", pollImageFile)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Nie udało się przesłać zdjęcia ankiety")
          }

          const { url } = await uploadResponse.json()
          postData.imageUrl = url
        }
      } else {
        postData = { content, type: "text" }
      }

      // Create post
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas dodawania wpisu")
      }

      const newPost = await response.json()
      onPostCreated(newPost)

      // Reset form
      setContent("")
      setImageFiles([])
      setImagePreviews([])
      setPollOptions([
        { id: "1", text: "" },
        { id: "2", text: "" },
      ])
      setPollQuestion("")
      setPollImagePreview(null)
      setPollImageFile(null)
      setActiveTab("text")

      toast({
        title: "Sukces",
        description: "Wpis został dodany pomyślnie",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas dodawania wpisu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Sprawdzenie limitu zdjęć
    if (imageFiles.length + files.length > 5) {
      toast({
        title: "Limit zdjęć",
        description: "Możesz dodać maksymalnie 5 zdjęć",
        variant: "destructive",
      })
      return
    }

    const newFiles: File[] = []
    const newPreviews: string[] = []

    Array.from(files).forEach((file) => {
      // Sprawdzenie typu pliku
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Błąd",
          description: `Plik ${file.name} nie jest obrazem`,
          variant: "destructive",
        })
        return
      }

      // Sprawdzenie rozmiaru pliku (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Błąd",
          description: `Plik ${file.name} przekracza maksymalny rozmiar 5MB`,
          variant: "destructive",
        })
        return
      }

      newFiles.push(file)
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          newPreviews.push(reader.result.toString())
          // Jeśli to ostatni plik, zaktualizuj stan
          if (newPreviews.length === newFiles.length) {
            setImageFiles((prev) => [...prev, ...newFiles])
            setImagePreviews((prev) => [...prev, ...newPreviews])
          }
        }
      }
      reader.readAsDataURL(file)
    })

    // Resetuj input, aby można było wybrać te same pliki ponownie
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePollFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Błąd",
        description: "Wybierz plik graficzny (JPG, PNG, GIF)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Błąd",
        description: "Maksymalny rozmiar pliku to 5MB",
        variant: "destructive",
      })
      return
    }

    setPollImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPollImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddPollOption = () => {
    if (pollOptions.length >= 5) {
      toast({
        title: "Limit opcji",
        description: "Maksymalnie możesz dodać 5 opcji",
      })
      return
    }

    setPollOptions([...pollOptions, { id: Date.now().toString(), text: "" }])
  }

  const handleRemovePollOption = (id: string) => {
    if (pollOptions.length <= 2) {
      toast({
        title: "Minimum opcji",
        description: "Ankieta musi zawierać co najmniej 2 opcje",
      })
      return
    }

    setPollOptions(pollOptions.filter((option) => option.id !== id))
  }

  const handlePollOptionChange = (id: string, value: string) => {
    setPollOptions(pollOptions.map((option) => (option.id === id ? { ...option, text: value } : option)))
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PostType)} className="w-full">
                <TabsContent value="text" className="mt-0 p-0">
                  <Textarea
                    placeholder={`O czym myślisz, ${user.name.split(" ")[0]}?`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 p-0 min-h-[80px]"
                    disabled={isLoading}
                  />
                </TabsContent>

                <TabsContent value="image" className="mt-0 p-0">
                  <Textarea
                    placeholder="Dodaj opis do zdjęć..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 p-0 mb-3"
                    disabled={isLoading}
                  />

                  {imagePreviews.length > 0 ? (
                    <div className="relative mt-2 mb-3">
                      <ImageGrid images={imagePreviews} alt="Podgląd zdjęć" />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {imagePreviews.map((preview, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                            className="h-8"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Usuń zdjęcie {index + 1}
                          </Button>
                        ))}
                      </div>
                      {imagePreviews.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Dodaj więcej zdjęć ({5 - imagePreviews.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-muted-foreground/20 rounded-md p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Kliknij, aby dodać zdjęcia (maksymalnie 5)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="poll" className="mt-0 p-0">
                  <Input
                    placeholder="Zadaj pytanie..."
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="mb-3"
                    disabled={isLoading}
                  />

                  <div className="space-y-2 mb-3">
                    {pollOptions.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <RadioGroup defaultValue="option-1" className="flex-none">
                          <RadioGroupItem value={`option-${index + 1}`} id={`option-${index + 1}`} />
                        </RadioGroup>
                        <Input
                          placeholder={`Opcja ${index + 1}`}
                          value={option.text}
                          onChange={(e) => handlePollOptionChange(option.id, e.target.value)}
                          className="flex-1"
                          disabled={isLoading}
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-none"
                            onClick={() => handleRemovePollOption(option.id)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {pollImagePreview ? (
                    <div className="relative mt-4 mb-3">
                      <img
                        src={pollImagePreview || "/placeholder.svg"}
                        alt="Podgląd ankiety"
                        className="max-h-[300px] rounded-md object-contain bg-muted/30 w-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => {
                          setPollImagePreview(null)
                          setPollImageFile(null)
                          if (pollFileInputRef.current) pollFileInputRef.current.value = ""
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-muted-foreground/20 rounded-md p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors mt-4"
                      onClick={() => pollFileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Kliknij, aby dodać zdjęcie do ankiety</p>
                      <input
                        ref={pollFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePollFileChange}
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {pollOptions.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleAddPollOption}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj opcję
                    </Button>
                  )}
                </TabsContent>

                <div className="border-t mt-3 pt-3">
                  <TabsList className="grid grid-cols-3 bg-transparent p-0">
                    <TabsTrigger
                      value="text"
                      className="data-[state=active]:bg-muted/50 rounded-md"
                      disabled={isLoading}
                    >
                      <SmilePlus className="h-4 w-4 mr-2" />
                      Tekst
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="data-[state=active]:bg-muted/50 rounded-md"
                      disabled={isLoading}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Zdjęcia
                    </TabsTrigger>
                    <TabsTrigger
                      value="poll"
                      className="data-[state=active]:bg-muted/50 rounded-md"
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Ankieta
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isLoading ||
                (activeTab === "text" && !content.trim()) ||
                (activeTab === "image" && imageFiles.length === 0) ||
                (activeTab === "poll" && (!pollQuestion.trim() || pollOptions.filter((o) => o.text.trim()).length < 2))
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publikowanie...
                </>
              ) : (
                "Opublikuj"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
