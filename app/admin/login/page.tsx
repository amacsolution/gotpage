"use client"

import type React from "react"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Dołącz ciasteczka
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Dodaj opóźnienie przed przekierowaniem, aby użytkownik zobaczył komunikat o sukcesie
        const timeoutId = setTimeout(() => {
          router.push("/admin")
        }, 200) // 2-second delay

        return () => clearTimeout(timeoutId) // Clear timeout if component unmounts
      } else {
        setError(data.message || "Nieprawidłowe hasło")
      }
    } catch (err) {
      setError("Wystąpił błąd podczas logowania")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Panel Administracyjny</h1>
          <p className="mt-2 text-foreground-muted">Wprowadź hasło, aby uzyskać dostęp</p>
        </div>

        {error && <div className="p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

        {success && (
          <div className="p-4 text-green-700 bg-green-100 rounded-md">Logowanie udane! Przekierowywanie...</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Hasło administratora"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full px-4 py-2 text-white bg-primary/90 rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading && (
              <Loader2 className="inline mr-2 w-4 h-4 animate-spin" />
            )}
            {loading ? "Logowanie..." : success ? "Zalogowano!" : "Zaloguj się"}

          </button>
        </form>
      </div>
    </div>
  )
}

