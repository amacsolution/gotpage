"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  // Sprawdź ważność tokenu przy ładowaniu strony
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password/validate?token=${token}`)
        const data = await response.json()

        if (response.ok && data.valid) {
          setIsTokenValid(true)
        } else {
          setIsTokenValid(false)
          setStatus("error")
          setMessage(data.error || "Token resetowania hasła jest nieprawidłowy lub wygasł.")
        }
      } catch (error) {
        setIsTokenValid(false)
        setStatus("error")
        setMessage("Wystąpił błąd podczas weryfikacji tokenu.")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Sprawdź, czy hasła są zgodne
    if (password !== confirmPassword) {
      setStatus("error")
      setMessage("Hasła nie są zgodne.")
      return
    }

    // Sprawdź, czy hasło spełnia wymagania
    if (password.length < 8) {
      setStatus("error")
      setMessage("Hasło musi mieć co najmniej 8 znaków.")
      return
    }

    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/auth/reset-password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Hasło zostało pomyślnie zresetowane.")

        // Przekieruj do strony logowania po 3 sekundach
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Wystąpił błąd podczas resetowania hasła.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Wystąpił błąd podczas komunikacji z serwerem.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="container flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Resetowanie hasła</CardTitle>
            <CardDescription>Weryfikacja tokenu resetowania hasła...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="container flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Resetowanie hasła</CardTitle>
            <CardDescription>Nieprawidłowy token resetowania hasła</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Błąd</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/reset-password/request")}>
              Wróć do formularza resetowania hasła
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Resetowanie hasła</CardTitle>
          <CardDescription>Wprowadź nowe hasło dla swojego konta.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nowe hasło</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">Hasło musi mieć co najmniej 8 znaków.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {status === "success" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Sukces</AlertTitle>
                  <AlertDescription>{message} Za chwilę zostaniesz przekierowany do strony logowania.</AlertDescription>
                </Alert>
              )}

              {status === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Błąd</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetowanie hasła...
                </>
              ) : (
                "Zresetuj hasło"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
