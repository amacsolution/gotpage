"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Server, Database } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestEmailsPage() {
  const [password, setPassword] = useState("")
  const [emailType, setEmailType] = useState("welcome")
  const [to, setTo] = useState("")
  const [loading, setLoading] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [testingLog, setTestingLog] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    error?: string
    details?: string
    config?: any
    insertId?: number
  } | null>(null)

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
        setResult({
          success: false,
          error: data.error || "Wystąpił błąd podczas wysyłania emaila",
          details: data.details,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Wystąpił błąd podczas wysyłania żądania",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const testSmtpConnection = async () => {
    setTestingSmtp(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/test-smtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          config: data.config,
        })
      } else {
        setResult({
          success: false,
          error: data.error || "Wystąpił błąd podczas testowania połączenia SMTP",
          details: data.details,
          config: data.config,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Wystąpił błąd podczas testowania połączenia SMTP",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setTestingSmtp(false)
    }
  }

  const testLogDatabase = async () => {
    setTestingLog(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/test-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          insertId: data.insertId,
        })
      } else {
        setResult({
          success: false,
          error: data.error || "Wystąpił błąd podczas testowania zapisu logu",
          details: data.details,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Wystąpił błąd podczas testowania zapisu logu",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setTestingLog(false)
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
          <CardTitle>Testowanie emaili</CardTitle>
          <CardDescription>Testuj połączenie SMTP i wysyłanie emaili</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

            <Tabs defaultValue="send">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="send">Wyślij email</TabsTrigger>
                <TabsTrigger value="test">Test SMTP</TabsTrigger>
                <TabsTrigger value="log">Test logów</TabsTrigger>
              </TabsList>
              <TabsContent value="send">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wysyłanie...
                      </>
                    ) : (
                      "Wyślij testowy email"
                    )}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="test" className="space-y-4 mt-4">
                <p className="text-sm text-gray-500">
                  Kliknij przycisk poniżej, aby przetestować połączenie z serwerem SMTP.
                </p>
                <Button onClick={testSmtpConnection} disabled={testingSmtp} className="w-full">
                  {testingSmtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testowanie...
                    </>
                  ) : (
                    <>
                      <Server className="mr-2 h-4 w-4" /> Testuj połączenie SMTP
                    </>
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="log" className="space-y-4 mt-4">
                <p className="text-sm text-gray-500">
                  Kliknij przycisk poniżej, aby przetestować zapis do tabeli email_logs.
                </p>
                <Button onClick={testLogDatabase} disabled={testingLog} className="w-full">
                  {testingLog ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testowanie...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" /> Testuj zapis do bazy danych
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Sukces" : "Błąd"}</AlertTitle>
                <AlertDescription>
                  {result.success ? result.message : result.error}
                  {result.insertId && (
                    <div className="mt-2">
                      ID zapisanego logu: <strong>{result.insertId}</strong>
                    </div>
                  )}
                  {result.details && (
                    <div className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      {result.details}
                    </div>
                  )}
                  {result.config && (
                    <div className="mt-2 text-xs overflow-auto max-h-48 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <pre>{JSON.stringify(result.config, null, 2)}</pre>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
