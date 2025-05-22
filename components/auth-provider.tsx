"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  role: string
  name: string
} | null

type AuthContextType = {
  user: User
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Sprawdź status uwierzytelnienia przy ładowaniu
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await localStorage.getItem("userData")
        const data = res ? JSON.parse(res) : null

        if (res && data.authenticated) {
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        // Po udanym logowaniu, pobierz dane użytkownika
        const userRes = await fetch("/api/auth/me")
        const userData = await userRes.json()

        if (userData.authenticated) {
          setUser(userData.user)
          setIsAuthenticated(true)
          return true
        }
      }

      return false
    } catch (error) {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })

      setUser(null)
      setIsAuthenticated(false)
      router.push("/admin/login")
    } catch (error) {
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

