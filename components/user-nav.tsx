"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { LogoutButton } from "@/components/logout-button"
import { Settings, PlusCircle, UserCircle } from "lucide-react"

interface UserData {
  id: number
  name: string
  email: string
  type: string
  verified: boolean
}

export function UserNav() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")

        if (!response.ok) {
          setUser(null)
          return
        }

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error("Błąd podczas pobierania danych użytkownika:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (isLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Zaloguj się
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Zarejestruj się</Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40&text=${user.name.substring(0, 2).toUpperCase()}`}
              alt={user.name}
            />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(`/profil/${user.id}`)}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Mój profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dodaj-ogloszenie")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Dodaj ogłoszenie</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/ustawienia")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Ustawienia</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton variant="ghost" showIcon={true} className="w-full justify-start" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

