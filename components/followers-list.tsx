"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { FollowButton } from "./follow-button"
import { ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/auth"
import { se } from "date-fns/locale"

interface User {
  id: string | number
  name: string
  avatar: string
  verified?: boolean
  location?: string
  categories?: string[]
  isFollowing?: boolean
}

interface FollowersListProps {
  userId: string | number
  type: "followers" | "following"
  limit?: number
}

export function FollowersList({ userId, type, limit }: FollowersListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const user = localStorage.getItem("userData");


  useEffect(() => {
    fetchUsers()
  }, [userId, type])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)

      if(!user) {
        setIsLoading(false)
        throw new Error(`Nie jesteś zalogowany`)
      }
      const response = await fetch(`/api/users/${userId}/${type}?limit=${limit || 10}`)

      if (!response.ok) {
        throw new Error(`Nie udało się pobrać ${type === "followers" ? "obserwujących" : "obserwowanych"}`)
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error : any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się pobrać danych",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowChange = (userId: string | number, isFollowing: boolean) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing } : user)))
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {type === "followers" ? "Brak obserwujących" : "Nie obserwuje nikogo"}
        <br />
        <span className="text-primary">{!user ? "Zaloguj się, aby zobaczyć więcej" : ""}</span>
      </div>
    )
  }

  const loggedUserId = user ? JSON.parse(user).id : null

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Link href={`/profil/${user.id}`} key={user.id}>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm">{user.name}</span>
                      {user.verified ? (
                        <span className="text-primary text-xs" title="Zweryfikowany">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                      ) : ""}
                    </div>
                    {user.location && <div className="text-xs text-muted-foreground">{user.location}</div>}
                    {user.categories && user.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.categories.map((category: string) => (
                          <Badge key={category} variant="secondary" className="text-xs py-0">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {loggedUserId !== user.id && (
                <div onClick={(e) => e.preventDefault()}>
                  <FollowButton
                    userId={user.id}
                    isFollowing={user.isFollowing || false}
                    size="sm"
                    onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
                  />
                </div>)}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
