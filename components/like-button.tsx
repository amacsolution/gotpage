"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface LikeButtonProps {
  adId: number
  initialLikes: number
  className?: string
  showCount?: boolean
  size?: "sm" | "md" | "lg"
}

export function LikeButton({ adId, initialLikes, className = "", showCount = true, size = "md" }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check if the current user has liked this ad
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/ogloszenia/like?adId=${adId}`)
        const data = await response.json()
        setIsLiked(data.liked)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
      }
    }

    checkLikeStatus()
  }, [adId])

  const handleLike = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ogloszenia/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd podczas przetwarzania polubienia")
      }

      const data = await response.json()

      // Update the like status and count
      setIsLiked(data.liked)

      toast({
        title: data.liked ? "Polubiono ogłoszenie" : "Usunięto polubienie",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas przetwarzania polubienia",
        variant: "destructive",
        
      })
    } finally {
      setIsLoading(false)
    }
  }

  const buttonSizeClass = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8"

  const iconSizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSizeClass} rounded-full ${isLiked ? "text-red-500 hover:text-red-600 hover:bg-red-100" : ""}`}
        onClick={() => {
          handleLike()
          setLikes((prev) => (isLiked ? prev - 1 : prev + 1 ))
          setIsLiked((prev) => !prev)
        }}
        disabled={isLoading}
      >
        <Heart className={`${iconSizeClass} ${isLiked ? "fill-current" : ""}`} />
        <span className="sr-only">{isLiked ? "Usuń polubienie" : "Polub"}</span>
      </Button>
      {showCount && <span className="text-sm text-muted-foreground">{likes}</span>}
    </div>
  )
}

