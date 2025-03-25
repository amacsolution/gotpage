"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LogOut, Loader2 } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showIcon?: boolean
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  className = "",
  showIcon = true,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas wylogowywania")
      }

      // Wyczyść dane użytkownika z localStorage
      localStorage.removeItem("userData")
      localStorage.removeItem("userDataTimestamp")

      toast({
        title: "Wylogowano pomyślnie",
        description: "Zostałeś pomyślnie wylogowany z systemu",
      })

      // Emituj zdarzenie auth-change, aby powiadomić kontekst użytkownika
      window.dispatchEvent(new Event("auth-change"))

      // Odświeżenie danych sesji i przekierowanie
      router.refresh()
      router.push("/login")
    } catch (error) {
      toast({
        title: "Błąd wylogowania",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas wylogowywania",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          Wyloguj
        </>
      )}
    </Button>
  )
}

