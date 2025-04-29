"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  type: string
  verified: boolean
  avatar?: string
  notifications?: number
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  refetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  refetchUser: async () => {},
})

export const useUser = () => useContext(UserContext)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      setIsLoading(true)

      // Sprawdź, czy dane użytkownika są w localStorage i czy nie są przestarzałe
      const cachedUserData = localStorage.getItem("userData")
      const cachedTimestamp = localStorage.getItem("userDataTimestamp")

      // Sprawdź, czy dane w cache nie są starsze niż 30 minut
      const isCacheValid =
        cachedTimestamp && Date.now() - Number.parseInt(cachedTimestamp) < 30 * 60 * 1000 && cachedUserData

      if (isCacheValid) {
        try {
          const userData = JSON.parse(cachedUserData!)
          setUser(userData)

          // Pobierz tylko liczbę powiadomień, która może się zmieniać częściej
          const notifResponse = await fetch("/api/notifications/count")
          if (notifResponse.ok) {
            const { count } = await notifResponse.json()
            setUser((prev) => (prev ? { ...prev, notifications: count } : null))
          }

          setIsLoading(false)
          return
        } catch (e) {
          console.error("Błąd podczas parsowania danych z cache:", e)
          // Kontynuuj z normalnym pobieraniem danych
        }
      }

      // Jeśli nie ma ważnych danych w cache, pobierz je z serwera
      const response = await fetch("/api/auth/me")

      if (!response.ok) {
        setUser(null)
        localStorage.removeItem("userData")
        localStorage.removeItem("userDataTimestamp")
        return
      }

      const userData = await response.json()

      // Pobierz liczbę powiadomień
      let notificationsCount = 0
      try {
        const notifResponse = await fetch("/api/notifications/count")
        if (notifResponse.ok) {
          const { count } = await notifResponse.json()
          notificationsCount = count
        }
      } catch (error) {
        console.error("Błąd podczas pobierania powiadomień:", error)
      }

      const userWithNotifications = {
        ...userData,
        notifications: notificationsCount,
      }

      // Zapisz dane w localStorage wraz z timestampem
      localStorage.setItem("userData", JSON.stringify(userWithNotifications))
      localStorage.setItem("userDataTimestamp", Date.now().toString())

      setUser(userWithNotifications)
    } catch (error) {
      console.error("Błąd podczas pobierania danych użytkownika:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    // Nasłuchuj na zdarzenia logowania/wylogowania
    window.addEventListener("auth-change", fetchUser)

    return () => {
      window.removeEventListener("auth-change", fetchUser)
    }
  }, [])

  const refetchUser = async () => {
    // Przy wymuszonym odświeżeniu, usuń dane z cache
    localStorage.removeItem("userData")
    localStorage.removeItem("userDataTimestamp")
    await fetchUser()
  }

  return <UserContext.Provider value={{ user, isLoading, refetchUser }}>{children}</UserContext.Provider>
}

