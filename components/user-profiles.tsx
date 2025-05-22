"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, User, Star, AlertCircle, Locate, MapPin, Newspaper } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { FollowButton } from "@/components/follow-button"
import { UserData } from "@/app/api/profile/route"

interface UserProfile {
  id: number
  name: string
  username: string
  avatar: string
  location: string
  bio: string
  rating: number
  adCount: number
  isFollowing: boolean
}

export function UserProfiles() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [userId, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await localStorage.getItem("userData")

        if (!response) {
          setUser(null)
          return
        }

        const data = JSON.parse(response)
        setUser(data)
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }

    fetchUser()
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/users/featured", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`)
        }

        const data = await response.json()

        // Transform API data to match our component's expected format
        const transformedUsers = data.map((user: any) => ({
          id: user.id,
          name: user.name || user.fullname || "Użytkownik",
          username: user.username || `user_${user.id}`,
          avatar: user.avatar || `/placeholder.svg?height=100&width=100&text=${user.name?.substring(0, 2) || "U"}`,
          location: user.location || "Polska",
          bio: user.description || user.bio || "Brak opisu",
          rating: user.rating || user.stats?.rating || 4.5,
          adCount: user.adCount || user.stats?.ads || 0,
          isFollowing: user.isFollowing || false,
        }))

        setUsers(transformedUsers)
      } catch (err) {
        console.error("Error fetching featured users:", err)
        setError("Nie udało się pobrać listy użytkowników")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleFollowChange = (userId: number, isFollowing: boolean) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing } : user)))
  }

  const handleMessage = async (userId: number) => {
    try {
      // Check if user is logged in
      const currentUser = localStorage.getItem("userData")
      if (!currentUser) {
        toast({
          title: "Wymagane logowanie",
          description: "Musisz być zalogowany, aby wysyłać wiadomości",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Create or get conversation
      const response = await fetch("/api/messages/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error creating conversation: ${response.status}`)
      }

      const data = await response.json()

      // Redirect to conversation
      router.push(`/wiadomosci`)
    } catch (err) {
      console.error("Error starting conversation:", err)
      toast({
        title: "Błąd",
        description: "Nie udało się rozpocząć konwersacji. Spróbuj ponownie później.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] text-center p-6 bg-muted/30 rounded-lg">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Nie udało się pobrać listy użytkowników</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Spróbuj ponownie</Button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] text-center p-6 bg-muted/30 rounded-lg">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Brak użytkowników do wyświetlenia</h3>
        <p className="text-muted-foreground">Sprawdź ponownie później</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-background rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md justify-between flex flex-col"
          itemScope
          itemType="https://schema.org/Person"
        >
          <div>
            <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  fill
                  className="object-cover"
                  itemProp="image"
                />
              </div>
            <div className="flex items-center gap-4">
              
              <div  className="p-6">
                <h3 className="font-bold text-lg" itemProp="name">
                  {user.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  <span itemProp="alternateName">@{user.id}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium" itemProp="reviewRating">
                    {user.rating}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground inline-flex" itemProp="address">
                    <MapPin className="h-4 w-4 mr-1"/>{user.location}
                  </span>
                </div>
              </div>
            </div>

            {user.adCount > 0 && (
              <div className="flex items-center gap-2 px-5 py-2 border-t">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user.adCount} ogłoszeń</span>
              </div>
            )}

            {userId != null && (<div className="flex gap-2 my-2 px-5">
              <FollowButton
                userId={user.id}
                isFollowing={user.isFollowing}
                variant="outline"
                size="sm"
                className="flex-1"
                onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
              />
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleMessage(user.id)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Wiadomość
              </Button>
            </div>)}
          </div>
          <Link
            href={`/profil/${user.id}`}
            className="block py-3 text-center text-sm font-medium hover:bg-muted border-t"
          >
            Zobacz profil
          </Link>
        </div>
      ))}
    </div>
  )
}
