"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Camera, Loader2, X } from "lucide-react"
import { BackgroundImageEditor } from "./background-image-editor"

interface ProfileBackgroundUploadProps {
  userId: number
  currentBackground?: string
  onBackgroundUpdate: (newBackgroundUrl: string) => void
}

export function ProfileBackgroundUpload({
  userId,
  currentBackground,
  onBackgroundUpdate,
}: ProfileBackgroundUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Nieprawidłowy format pliku",
        description: "Proszę wybrać plik obrazu (JPG, PNG, itp.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "Plik jest zbyt duży",
        description: "Maksymalny rozmiar pliku to 10MB",
        variant: "destructive",
      })
      return
    }

    // Set selected file and open editor
    setSelectedFile(file)
    setIsEditorOpen(true)
  }

  const handleSaveImage = async (processedImage: Blob) => {
    setIsUploading(true)

    try {
      // Create a file from the blob
      const file = new File([processedImage], selectedFile?.name || "background.jpg", {
        type: "image/jpeg",
      })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "background")
      formData.append("userId", userId.toString())

      // 1. Upload the image file
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || "Wystąpił błąd podczas przesyłania zdjęcia")
      }

      const uploadData = await uploadResponse.json()
      const imageUrl = uploadData.url

      // 2. Update the user's background image in the database
      const updateResponse = await fetch(`/api/users/${userId}/background`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backgroundImage: imageUrl }),
      })

      if (!updateResponse.ok) {
        const error = await updateResponse.json()
        throw new Error(error.error || "Wystąpił błąd podczas aktualizacji tła użytkownika")
      }

      // 3. Update the UI
      onBackgroundUpdate(imageUrl)

      toast({
        title: "Zdjęcie w tle zaktualizowane",
        description: "Twoje zdjęcie w tle zostało pomyślnie zaktualizowane",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas przesyłania zdjęcia",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  const handleDelete = async () => {
    if (!currentBackground) return

    setIsDeleting(true)

    try {
      // 1. Delete the image file
      const deleteResponse = await fetch(`/api/upload?url=${encodeURIComponent(currentBackground)}`, {
        method: "DELETE",
      })

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json()
        throw new Error(error.error || "Wystąpił błąd podczas usuwania zdjęcia")
      }

      // 2. Update the user's background image in the database (set to null)
      const updateResponse = await fetch(`/api/users/${userId}/background`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backgroundImage: null }),
      })

      if (!updateResponse.ok) {
        const error = await updateResponse.json()
        throw new Error(error.error || "Wystąpił błąd podczas aktualizacji tła użytkownika")
      }

      // 3. Update the UI
      onBackgroundUpdate("")

      toast({
        title: "Zdjęcie w tle usunięte",
        description: "Twoje zdjęcie w tle zostało pomyślnie usunięte",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania zdjęcia",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-background"
          disabled={isUploading || isDeleting}
          onClick={() => document.getElementById("background-upload")?.click()}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
          {currentBackground ? "Zmień tło" : "Dodaj tło"}
        </Button>

        {currentBackground && (
          <Button
            variant="outline"
            size="sm"
            className="bg-background text-destructive hover:text-destructive"
            disabled={isUploading || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
            Usuń tło
          </Button>
        )}

        <input type="file" id="background-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>

      {selectedFile && (
        <BackgroundImageEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setSelectedFile(null)
          }}
          onSave={handleSaveImage}
          imageFile={selectedFile}
        />
      )}
    </>
  )
}
