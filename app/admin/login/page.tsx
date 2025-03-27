"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

//   useEffect(() => {
//     // Sprawdź, czy użytkownik jest już zalogowany
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/admin/check", {
//           method: "GET",
//           credentials: "include", // Dołącz ciasteczka
//         })

//         const data = await response.json()

//         if (response.ok && data.isAdmin) {
//           router.push("/admin")
//         }
//       } catch (err) {
//         console.error("Error checking auth:", err)
//       }
//     }

//     checkAuth()
//   }, [router])

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
        setTimeout(() => {
          router.push("/admin")
        }, 1000)
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Panel Administracyjny</h1>
          <p className="mt-2 text-gray-600">Wprowadź hasło, aby uzyskać dostęp</p>
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
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Logowanie..." : success ? "Zalogowano!" : "Zaloguj się"}
          </button>
        </form>
      </div>
    </div>
  )
}

