"use client"
import { useState, useRef, useEffect } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Loader2, Smartphone, Monitor, RotateCcw } from "lucide-react"

interface BackgroundImageEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (croppedImage: Blob) => Promise<void>
  imageFile: File | null
}

export function BackgroundImageEditor({ isOpen, onClose, onSave, imageFile }: BackgroundImageEditorProps) {
  const [imgSrc, setImgSrc] = useState<string>("")
  const imgRef = useRef<HTMLImageElement>(null)
  const [brightness, setBrightness] = useState<number>(100)
  const [contrast, setContrast] = useState<number>(100)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeDevice, setActiveDevice] = useState<"desktop" | "mobile">("desktop")
  const [desktopCrop, setDesktopCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 30,
    x: 0,
    y: 0,
  })
  const [mobileCrop, setMobileCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 40,
    x: 0,
    y: 0,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)

  // Dimensions for desktop and mobile
  const dimensions = {
    desktop: { width: 1336, height: 160 },
    mobile: { width: 350, height: 120 },
  }

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) return

    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "")
    })
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // Reset settings
  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    if (activeDevice === "desktop") {
      setDesktopCrop({
        unit: "%",
        width: 100,
        height: 30,
        x: 0,
        y: 0,
      })
    } else {
      setMobileCrop({
        unit: "%",
        width: 100,
        height: 40,
        x: 0,
        y: 0,
      })
    }
  }

  // Handle device change
  const handleDeviceChange = (device: "desktop" | "mobile") => {
    setActiveDevice(device)
  }

  // Generate cropped image
  const generateCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) return null

    const image = imgRef.current
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return null
    }

    // Get the current crop dimensions
    const crop = activeDevice === "desktop" ? desktopCrop : mobileCrop
    const targetDimensions = activeDevice === "desktop" ? dimensions.desktop : dimensions.mobile

    // Set canvas to target dimensions
    canvas.width = targetDimensions.width
    canvas.height = targetDimensions.height

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`

    // Calculate source and destination coordinates
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const sourceX = crop.x * scaleX
    const sourceY = crop.y * scaleY
    const sourceWidth = crop.width * scaleX
    const sourceHeight = crop.height * scaleY

    // Use better quality settings
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Draw the cropped image
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetDimensions.width,
      targetDimensions.height,
    )

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty")
            return
          }
          resolve(blob)
        },
        "image/jpeg",
        1.0, // Maksymalna jakość (1.0 zamiast 0.95)
      )
    })
  }

  // Handle save
  const handleSave = async () => {
    if (!imgRef.current) return

    setIsLoading(true)
    try {
      const croppedImage = await generateCroppedImage()
      if (croppedImage) {
        await onSave(croppedImage)
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania zdjęcia:", error)
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
          <DialogDescription>
            Dostosuj zdjęcie, aby wyglądało dobrze na różnych urządzeniach. Wybierz obszar, który ma być widoczny.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="desktop"
          className="w-full"
          onValueChange={(value) => handleDeviceChange(value as "desktop" | "mobile")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>
                Komputer ({dimensions.desktop.width} × {dimensions.desktop.height})
              </span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>
                Telefon ({dimensions.mobile.width} × {dimensions.mobile.height})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="desktop" className="mt-0">
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-lg p-4 w-full overflow-hidden">
                {imgSrc && (
                  <ReactCrop
                    crop={desktopCrop}
                    onChange={(c) => setDesktopCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={dimensions.desktop.width / dimensions.desktop.height}
                    className="max-w-full mx-auto"
                  >
                    <img
                      ref={imgRef}
                      alt="Zdjęcie w tle"
                      src={imgSrc || "/placeholder.svg"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "500px",
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      }}
                    />
                  </ReactCrop>
                )}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Wybierz obszar zdjęcia, który będzie widoczny na komputerze ({dimensions.desktop.width} ×{" "}
                  {dimensions.desktop.height})
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="mt-0">
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-lg p-4 w-full overflow-hidden">
                {imgSrc && (
                  <ReactCrop
                    crop={mobileCrop}
                    onChange={(c) => setMobileCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={dimensions.mobile.width / dimensions.mobile.height}
                    className="max-w-full mx-auto"
                  >
                    <img
                      alt="Zdjęcie w tle (mobile)"
                      src={imgSrc || "/placeholder.svg"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "500px",
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      }}
                    />
                  </ReactCrop>
                )}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Wybierz obszar zdjęcia, który będzie widoczny na telefonie ({dimensions.mobile.width} ×{" "}
                  {dimensions.mobile.height})
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="brightness">Jasność: {brightness}%</Label>
            </div>
            <Slider
              id="brightness"
              min={50}
              max={150}
              step={1}
              value={[brightness]}
              onValueChange={(value) => setBrightness(value[0])}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contrast">Kontrast: {contrast}%</Label>
            </div>
            <Slider
              id="contrast"
              min={50}
              max={150}
              step={1}
              value={[contrast]}
              onValueChange={(value) => setContrast(value[0])}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="w-fit">
            <RotateCcw className="h-4 w-4 mr-2" />
            <span>Resetuj ustawienia</span>
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
