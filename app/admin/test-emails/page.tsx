"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function TestEmailsPage() {
  const [password, setPassword] = useState("")
  const [emailType, setEmailType] = useState("welcome")
  const [to, setTo] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, emailType, to }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, error: data.error || "Wystąpił błąd podczas wysyłania emaila" })
      }
    } catch (error) {
      setResult({ success: false, error: "Wystąpił błąd podczas wysyłania żądania" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Panel testowania emaili</h1>
      <p className="text-gray-500 mb-8">
        Ta strona służy do testowania szablonów emaili. Dostęp tylko dla administratorów.
      </p>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Wyślij testowy email</CardTitle>
          <CardDescription>Wybierz typ emaila i podaj adres docelowy</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Hasło administratora</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Wprowadź hasło administratora"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailType">Typ emaila</Label>
              <Select value={emailType} onValueChange={setEmailType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ emaila" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Email powitalny</SelectItem>
                  <SelectItem value="passwordReset">Reset hasła</SelectItem>
                  <SelectItem value="newAd">Nowe ogłoszenie</SelectItem>
                  <SelectItem value="adExpiration">Wygasające ogłoszenie</SelectItem>
                  <SelectItem value="messageNotification">Nowa wiadomość</SelectItem>
                  <SelectItem value="paymentConfirmation">Potwierdzenie płatności</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">Adres email</Label>
              <Input
                id="to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                placeholder="Wprowadź adres email"
              />
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Sukces" : "Błąd"}</AlertTitle>
                <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wysyłanie...
                </>
              ) : (
                "Wyślij testowy email"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
