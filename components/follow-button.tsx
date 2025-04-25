"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  userId: string | number
  isFollowing: boolean
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing = false,
  variant = "outline",
  size = "sm",
  className = "",
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const user = localStorage.getItem("userData")
  const loggedUserId = user ? JSON.parse(user).id : null

  const checkIfFollowing = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}/is-following`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się sprawdzić obserwacji")
      }

      const data = await response.json()
      setIsFollowing(data.isFollowing )
    }
    catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  // Check if the user is already following the target user
  useEffect(() => {
    if (loggedUserId) {
      checkIfFollowing()
    }
  }, [userId, loggedUserId])

  const handleFollowToggle = async () => {
    try {
      setIsLoading(true)

      // Check if user is logged in
      const currentUser = localStorage.getItem("userData")
      if (!currentUser) {
        toast({
          title: "Wymagane logowanie",
          description: "Musisz być zalogowany, aby obserwować użytkowników",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Make API call to follow/unfollow
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isFollowing ? "unfollow" : "follow",
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować obserwacji")
      }

      // Update state
      const newIsFollowing = !isFollowing
      setIsFollowing(newIsFollowing)

      // Notify parent component
      if (onFollowChange) {
        onFollowChange(newIsFollowing)
      }

      // Show success message
      toast({
        title: newIsFollowing ? "Obserwujesz użytkownika" : "Przestałeś obserwować użytkownika",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować obserwacji",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleFollowToggle} variant={variant} size={size} disabled={isLoading} className={`flex items-center ${className} ${isFollowing ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? "Obserwujesz" : "Obserwuj"}
    </Button>
  )
}
