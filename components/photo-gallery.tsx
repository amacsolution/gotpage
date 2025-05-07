"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, X, Heart, MessageCircle, Share2 } from "lucide-react"
import Image from "next/image"

interface Photo {
  id: string
  userId: string
  imageUrl: string
  caption?: string
  createdAt: string
  likes: number
  comments: number
  isLiked?: boolean
}

interface PhotoGalleryProps {
  userId: string
  isOwnProfile?: boolean
}

export function PhotoGallery({ userId, isOwnProfile = false }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()

  const fetchPhotos = async (pageNum: number) => {
    try {
      setIsLoading(true)
      // Using your existing API structure
      const response = await fetch(`/api/users/${userId}/photos?page=${pageNum}&limit=12`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać zdjęć")
      }

      const data = await response.json()

      if (pageNum === 1) {
        setPhotos(data.photos || [])
      } else {
        setPhotos((prev) => [...prev, ...(data.photos || [])])
      }

      setHasMore(data.hasMore || false)
      setPage(pageNum)
    } catch (error) {
      console.error("Błąd podczas pobierania zdjęć:", error)
      // If API doesn't exist yet, show empty state
      setPhotos([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos(1)
  }, [userId])

  const handleLikePhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Nie udało się polubić zdjęcia")
      }

      const { liked, likesCount } = await response.json()

      setPhotos((prev) =>
        prev.map((photo) => (photo.id === photoId ? { ...photo, isLiked: liked, likes: likesCount } : photo)),
      )

      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto((prev) => (prev ? { ...prev, isLiked: liked, likes: likesCount } : null))
      }
    } catch (error) {
      console.error("Błąd podczas polubiania zdjęcia:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się polubić zdjęcia. Spróbuj ponownie później.",
        variant: "destructive",
      })
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    fetchPhotos(nextPage)
  }

  const handlePhotoUploadSuccess = (newPhoto: Photo) => {
    setPhotos((prev) => [newPhoto, ...prev])
  }

  if (isLoading && photos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <div className="flex justify-end">
          <PhotoUploadDialog userId={userId} onUploadSuccess={handlePhotoUploadSuccess} />
        </div>
      )}

      {photos.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-md overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.imageUrl || "/placeholder.svg"}
                  alt={photo.caption || "Zdjęcie użytkownika"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-3 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="h-5 w-5" fill={photo.isLiked ? "white" : "none"} />
                      <span>{photo.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-5 w-5" />
                      <span>{photo.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ładowanie...
                  </>
                ) : (
                  "Załaduj więcej"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Brak zdjęć</h3>
          <p className="text-muted-foreground">
            {isOwnProfile
              ? "Dodaj swoje pierwsze zdjęcie, aby pokazać je innym!"
              : "Ten użytkownik nie dodał jeszcze żadnych zdjęć."}
          </p>
          {isOwnProfile && (
            <div className="mt-4">
              <PhotoUploadDialog userId={userId} onUploadSuccess={handlePhotoUploadSuccess} />
            </div>
          )}
        </div>
      )}

      {selectedPhoto && (
        <PhotoDetailDialog photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} onLike={handleLikePhoto} />
      )}
    </div>
  )
}

interface PhotoUploadDialogProps {
  userId: string
  onUploadSuccess: (photo: Photo) => void
}

function PhotoUploadDialog({ userId, onUploadSuccess }: PhotoUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null)
      return
    }

    const file = e.target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "Błąd",
        description: "Maksymalny rozmiar pliku to 5MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Błąd",
        description: "Wybierz plik graficzny",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      // Using your existing upload API
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("caption", caption)
      formData.append("userId", userId)
      formData.append("type", "photo")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Nie udało się przesłać zdjęcia")
      }

      const data = await response.json()

      // Create a photo object from the response
      const newPhoto: Photo = {
        id: data.id || String(Date.now()),
        userId: userId,
        imageUrl: data.url || data.path,
        caption: caption,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        isLiked: false,
      }

      toast({
        title: "Sukces",
        description: "Zdjęcie zostało dodane",
      })

      onUploadSuccess(newPhoto)
      setIsOpen(false)
      setSelectedFile(null)
      setCaption("")
    } catch (error) {
      console.error("Błąd podczas przesyłania zdjęcia:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać zdjęcia. Spróbuj ponownie później.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj zdjęcie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dodaj nowe zdjęcie</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {preview ? (
            <div className="relative aspect-square rounded-md overflow-hidden">
              <Image src={preview || "/placeholder.svg"} alt="Podgląd zdjęcia" fill className="object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedFile(null)
                  setPreview(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
              <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Kliknij, aby wybrać zdjęcie</p>
                  <p className="text-xs text-muted-foreground">Maksymalny rozmiar: 5MB</p>
                </div>
              </label>
            </div>
          )}

          {preview && (
            <>
              <div>
                <label htmlFor="caption" className="block text-sm font-medium mb-1">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  id="caption"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Dodaj opis do zdjęcia..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Przesyłanie...
                    </>
                  ) : (
                    "Dodaj zdjęcie"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PhotoDetailDialogProps {
  photo: Photo
  onClose: () => void
  onLike: (photoId: string) => void
}

function PhotoDetailDialog({ photo, onClose, onLike }: PhotoDetailDialogProps) {
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl h-80 p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-square">
            <Image
              src={photo.imageUrl || "/placeholder.svg"}
              alt={photo.caption || "Zdjęcie użytkownika"}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{photo.caption || "Zdjęcie użytkownika"}</h3>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLike(photo.id)}
                className={photo.isLiked ? "text-red-500" : ""}
              >
                <Heart className="h-5 w-5" fill={photo.isLiked ? "currentColor" : "none"} />
              </Button>
              <span>{photo.likes} polubień</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Dodano: {new Date(photo.createdAt).toLocaleDateString()}
            </div>

            <div className="mt-4 flex-grow">{photo.caption && <p>{photo.caption}</p>}</div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                Zamknij
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
