"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGridProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageGrid({ images, alt, className }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const hasImages = images && images.length > 0
  const imageCount = hasImages ? images.length : 0

  if (!hasImages) return null

  const handleImageClick = (index: number) => {
    setSelectedImage(index)
  }

  const handleClose = () => {
    setSelectedImage(null)
  }

  const handlePrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + imageCount) % imageCount)
    }
  }

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % imageCount)
    }
  }

  // Renderowanie siatki zdjęć w zależności od liczby zdjęć
  const renderGrid = () => {
    switch (imageCount) {
      case 1:
        return (
          <div className="w-full rounded-lg overflow-hidden">
            <Image
              src={images[0] || "/placeholder.svg"}
              alt={`${alt} - zdjęcie 1`}
              width={800}
              height={600}
              className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => handleImageClick(0)}
            />
          </div>
        )
      case 2:
        return (
          <div className="grid grid-cols-2 gap-1">
            {images.map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${alt} - zdjęcie ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => handleImageClick(index)}
                />
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="grid grid-cols-2 gap-1">
            <div className="col-span-2 aspect-video overflow-hidden">
              <Image
                src={images[0] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 1`}
                width={800}
                height={400}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            {images.slice(1).map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${alt} - zdjęcie ${index + 2}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => handleImageClick(index + 1)}
                />
              </div>
            ))}
          </div>
        )
      case 4:
        return (
          <div className="grid grid-cols-2 gap-1">
            {images.map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${alt} - zdjęcie ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => handleImageClick(index)}
                />
              </div>
            ))}
          </div>
        )
      case 5:
        return (
          <div className="grid grid-cols-6 gap-1">
            <div className="col-span-3 aspect-square overflow-hidden">
              <Image
                src={images[0] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 1`}
                width={400}
                height={400}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="col-span-3 aspect-square overflow-hidden">
              <Image
                src={images[1] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 2`}
                width={400}
                height={400}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="col-span-2 aspect-square overflow-hidden">
              <Image
                src={images[2] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 3`}
                width={266}
                height={266}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            <div className="col-span-2 aspect-square overflow-hidden">
              <Image
                src={images[3] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 4`}
                width={266}
                height={266}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-2 aspect-square overflow-hidden">
              <Image
                src={images[4] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 5`}
                width={266}
                height={266}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
            </div>
          </div>
        )
      default:
        // Dla więcej niż 5 zdjęć, pokazujemy pierwsze 5 z nakładką "+X" na ostatnim
        return (
          <div className="grid grid-cols-6 gap-1">
            <div className="col-span-3 aspect-square overflow-hidden">
              <Image
                src={images[0] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 1`}
                width={400}
                height={400}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(0)}
              />
            </div>
            <div className="col-span-3 aspect-square overflow-hidden">
              <Image
                src={images[1] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 2`}
                width={400}
                height={400}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(1)}
              />
            </div>
            <div className="col-span-2 aspect-square overflow-hidden">
              <Image
                src={images[2] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 3`}
                width={266}
                height={266}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(2)}
              />
            </div>
            <div className="col-span-2 aspect-square overflow-hidden">
              <Image
                src={images[3] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 4`}
                width={266}
                height={266}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(3)}
              />
            </div>
            <div className="col-span-2 aspect-square overflow-hidden relative">
              <Image
                src={images[4] || "/placeholder.svg"}
                alt={`${alt} - zdjęcie 5`}
                width={266}
                height={266}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(4)}
              />
              {imageCount > 5 && (
                <div
                  className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl cursor-pointer"
                  onClick={() => handleImageClick(4)}
                >
                  +{imageCount - 5}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <div className={cn("rounded-lg overflow-hidden", className)}>{renderGrid()}</div>

      <Dialog open={selectedImage !== null} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white bg-black/50 hover:bg-black/70"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>

            {selectedImage !== null && (
              <div className="flex items-center justify-center min-h-[200px] max-h-[80vh]">
                <Image
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={`${alt} - zdjęcie ${selectedImage + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            )}

            {imageCount > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {selectedImage !== null && (
              <div className="p-2 text-center text-white bg-black/80">
                {selectedImage + 1} / {imageCount}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
