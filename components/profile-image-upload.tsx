"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ImageCropper } from "@/components/image-cropper"
import { useToast } from "@/hooks/use-toast"
import { Camera, Loader2, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProfileImageUploadProps {
  userId: string
  currentAvatar: string | undefined
  userName: string
  onAvatarUpdate: (newAvatarUrl: string) => void
}

export function ProfileImageUpload({ userId, currentAvatar, userName, onAvatarUpdate }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Funkcja do otwierania dialogu wyboru zdjęcia
  const handleAvatarClick = () => {
    setShowUploadDialog(true)
  }

  // Funkcja do otwierania okna wyboru pliku
  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Obsługa wyboru pliku
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Sprawdzenie typu pliku
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Nieprawidłowy format",
          description: "Wybierz plik graficzny (JPG, PNG, GIF)",
          variant: "destructive",
        })
        return
      }

      // Sprawdzenie rozmiaru pliku (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Plik zbyt duży",
          description: "Maksymalny rozmiar pliku to 5MB",
          variant: "destructive",
        })
        return
      }

      // Utworzenie URL dla wybranego pliku
      const imageUrl = URL.createObjectURL(file)
      setTempImageUrl(imageUrl)
      setShowUploadDialog(false) // Zamknij dialog wyboru
      setShowCropper(true) // Otwórz edytor kadrowania
    }
  }

  // Obsługa zakończenia kadrowania
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploading(true)
    setShowCropper(false)

    try {
      // Utworzenie FormData do wysłania pliku
      const formData = new FormData()
      formData.append("avatar", croppedImageBlob, "avatar.jpg")

      // Wysłanie pliku na serwer
      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Wystąpił błąd podczas przesyłania zdjęcia")
      }

      const data = await response.json()

      // Aktualizacja avatara w UI
      onAvatarUpdate(data.avatarUrl)

      toast({
        title: "Sukces",
        description: "Zdjęcie profilowe zostało zaktualizowane",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas przesyłania zdjęcia",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Zwolnienie zasobów
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl)
        setTempImageUrl(null)
      }
    }
  }

  // Anulowanie kadrowania
  const handleCropCancel = () => {
    setShowCropper(false)
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl)
      setTempImageUrl(null)
    }
  }

  return (
    <div className="relative">

      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
        disabled={isUploading}
        onClick={handleAvatarClick}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>

      {/* Ukryty input do wyboru pliku */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Dialog wyboru zdjęcia */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zmień zdjęcie profilowe</DialogTitle>
            <DialogDescription>
              Wybierz nowe zdjęcie profilowe. Możesz je później przyciąć i dostosować.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="flex items-center justify-center w-full">
              <Avatar className="h-32 w-32">
                <AvatarImage src={currentAvatar} alt={userName} />
                <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <Button onClick={handleSelectFileClick} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Wybierz zdjęcie
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Komponent do kadrowania zdjęcia */}
      {tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          aspectRatio={1}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={showCropper}
        />
      )}
    </div>
  )
}

