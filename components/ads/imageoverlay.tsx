"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/legacy/image"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, Maximize2, Download } from "lucide-react"

interface ImageOverlayProps {
  images: string[]
  activeIndex: number
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  title?: string
}

export function ImageOverlay({ images, activeIndex, isOpen, onClose, onPrevious, onNext, title }: ImageOverlayProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const imageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset zoom and position when image changes
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsLoading(true)
  }, [activeIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          onPrevious()
          break
        case "ArrowRight":
          onNext()
          break
        case "+":
        case "=":
          e.preventDefault()
          handleZoomIn()
          break
        case "-":
          e.preventDefault()
          handleZoomOut()
          break
        case "0":
          e.preventDefault()
          handleReset()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, onPrevious, onNext])

  // Mouse wheel zoom
  useEffect(() => {
    if (!isOpen) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.2 : 0.2
        setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)))
      }
    }

    document.addEventListener("wheel", handleWheel, { passive: false })
    return () => document.removeEventListener("wheel", handleWheel)
  }, [isOpen])

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(5, prev + 0.5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.5))
  }, [])

  const handleReset = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        setIsDragging(true)
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        })
      }
    },
    [scale, position],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && scale > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart, scale],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(images[activeIndex])
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `image-${activeIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }, [images, activeIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          {/* Lewa część – tytuł */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-lg font-medium truncate max-w-[70vw]">
              {title || `Zdjęcie ${activeIndex + 1} z ${images.length}`}
            </h3>
            <span className="text-sm text-white/70">
              {activeIndex + 1} / {images.length}
            </span>
          </div>

          {/* Prawa część – ikony */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>


      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="lg"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
            onClick={onNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 rounded-full p-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 5}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-white/30 mx-1" />
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-white hover:bg-white/20 h-8 w-8 p-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <div
          ref={imageRef}
          className={`relative transition-transform duration-200 ease-out ${
            isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-zoom-in"
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            maxWidth: "90vw",
            maxHeight: "90vh",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => {
            e.stopPropagation()
            if (scale === 1) {
              handleZoomIn()
            }
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          <div className="relative w-[80vw] h-[80vh] max-w-4xl">
            <Image
              src={images[activeIndex] || "/placeholder.svg"}
              alt={title || `Zdjęcie ${activeIndex + 1}`}
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
              priority
              onLoadingComplete={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 bg-black/50 rounded-lg p-2 backdrop-blur-sm max-w-[90vw] overflow-x-scroll">
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative min-w-[96px] aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${
                  index === activeIndex ? "border-primary scale-110" : "border-transparent hover:border-white/50"
                }`}
                onClick={() => {
                  // This would need to be passed as a prop or handled by parent
                  // For now, we'll just show the concept
                }}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Miniatura ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      {/* <div className="absolute top-20 left-4 z-10 text-white/70 text-sm space-y-1">
        <div>Klawisze: ← → (nawigacja), +/- (zoom), 0 (reset), Esc (zamknij)</div>
        <div>Ctrl + scroll (zoom), przeciągnij (przesuwanie)</div>
      </div> */}
    </div>
  )
}
