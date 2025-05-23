"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useDebouncedValue } from "@/hooks/useDebounceValue"
import { Loader2, RotateCcw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface BackgroundImageEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (croppedImage: Blob) => Promise<void>
  imageFile: File | null
}

const TARGET_WIDTH = 1336
const TARGET_HEIGHT = 260

export function BackgroundImageEditor({ isOpen, onClose, onSave, imageFile }: BackgroundImageEditorProps) {
  const [imgSrc, setImgSrc] = useState<string>("")
  const imgRef = useRef<HTMLImageElement>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const debouncedBrightness = useDebouncedValue(brightness)
  const debouncedContrast = useDebouncedValue(contrast)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: (TARGET_HEIGHT / TARGET_WIDTH) * 100,
    x: 0,
    y: 0,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!imageFile) return
    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result as string)
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setCrop({
      unit: "%",
      width: 100,
      height: (TARGET_HEIGHT / TARGET_WIDTH) * 100,
      x: 0,
      y: 0,
    })
  }

  const generateCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) return null

    const image = imgRef.current
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    canvas.width = TARGET_WIDTH
    canvas.height = TARGET_HEIGHT
    ctx.filter = `brightness(${debouncedBrightness}%) contrast(${debouncedContrast}%)`

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const sourceX = completedCrop.x * scaleX
    const sourceY = completedCrop.y * scaleY
    const sourceWidth = completedCrop.width * scaleX
    const sourceHeight = completedCrop.height * scaleY

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, TARGET_WIDTH, TARGET_HEIGHT)

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => blob && resolve(blob), "image/jpeg", 1.0)
    })
  }

  const handleSave = async () => {
    if (!imgRef.current) return
    setIsLoading(true)
    try {
      const croppedImage = await generateCroppedImage()
      if (croppedImage) await onSave(croppedImage)
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Przytnij zdjęcie w tle</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center">
          <div className="bg-muted rounded-lg p-4 w-full overflow-hidden">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={setCrop}
                onComplete={setCompletedCrop}
                aspect={TARGET_WIDTH / TARGET_HEIGHT}
                className="max-w-full mx-auto"
              >
                <img
                  ref={imgRef}
                  alt="Zdjęcie w tle"
                  src={imgSrc}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "500px",
                    filter: `brightness(${debouncedBrightness}%) contrast(${debouncedContrast}%)`,
                  }}
                />
              </ReactCrop>
            )}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Obszar zdjęcia: {TARGET_WIDTH} × {TARGET_HEIGHT}
            </div>
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brightness">Jasność: {brightness}%</Label>
            <Slider min={50} max={150} step={1} value={[brightness]} onValueChange={(v) => setBrightness(v[0])} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contrast">Kontrast: {contrast}%</Label>
            <Slider min={50} max={150} step={1} value={[contrast]} onValueChange={(v) => setContrast(v[0])} />
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="w-fit">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetuj ustawienia
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              "Zapisz zdjęcie"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
