"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"

interface ImageCropperProps {
  imageUrl: string
  aspectRatio?: number
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  open: boolean
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

// Funkcja pomocnicza do generowania przyciętego obrazu w wysokiej jakości
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, scale = 1, rotate = 0): Promise<Blob> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  // Obliczenie wymiarów przyciętego obrazu
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  // Ustawienie wymiarów canvas na wymiary przyciętego obszaru
  // Używamy większego rozmiaru dla lepszej jakości
  const pixelRatio = window.devicePixelRatio || 1

  // Obliczamy szerokość i wysokość z uwzględnieniem skali i pixel ratio
  const width = Math.floor(crop.width * scaleX)
  const height = Math.floor(crop.height * scaleY)

  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio

  // Skalowanie kontekstu zgodnie z pixel ratio
  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = "high"
  ctx.imageSmoothingEnabled = true

  // Obliczenie środka canvas
  const centerX = width / 2
  const centerY = height / 2

  // Zapisanie stanu kontekstu
  ctx.save()

  // Przesunięcie do środka, obrót i skalowanie
  ctx.translate(centerX, centerY)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.scale(scale, scale)
  ctx.translate(-centerX, -centerY)

  // Narysowanie przyciętego obrazu
  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  ctx.drawImage(image, cropX, cropY, width, height, 0, 0, width, height)

  // Przywrócenie stanu kontekstu
  ctx.restore()

  // Konwersja canvas do Blob z wysoką jakością
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"))
          return
        }
        resolve(blob)
      },
      "image/jpeg",
      1.0, // Maksymalna jakość (1.0 zamiast 0.95)
    )
  })
}

export function ImageCropper({ imageUrl, aspectRatio = 1, onCropComplete, onCancel, open }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspectRatio))
    },
    [aspectRatio],
  )

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleRotateReset = () => {
    setRotate(0)
  }

  const handleScaleChange = (value: number[]) => {
    setScale(value[0])
  }

  const handleComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      return
    }

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop, scale, rotate)
      onCropComplete(croppedImageBlob)
    } catch (error) {
    }
  }, [completedCrop, scale, rotate, onCropComplete])

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dostosuj zdjęcie profilowe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={aspectRatio === 1}
              keepSelection
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl || "/placeholder.svg"}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: "400px",
                  maxWidth: "100%",
                }}
                onLoad={onImageLoad}
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Powiększenie</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={scale <= 0.5}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Slider
                  value={[scale]}
                  min={0.5}
                  max={3}
                  step={0.01}
                  onValueChange={handleScaleChange}
                  className="w-[200px]"
                />
                <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={scale >= 3}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Obrót</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleRotateReset} disabled={rotate === 0}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Slider
                  value={[rotate]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={(value) => setRotate(value[0])}
                  className="w-[200px]"
                />
                <span className="w-12 text-center text-sm">{rotate}°</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button onClick={handleComplete}>Zastosuj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

