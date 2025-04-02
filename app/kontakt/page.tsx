"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({
    type: null,
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus({ type: null, message: "" })

    try {
      // Przygotowanie danych formularza
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
      })

      // Wysłanie danych do API
      const response = await fetch("/api/contact", {
        method: "POST",
        body: form,
      })

      const data = await response.json()

      if (response.ok) {
        // Sukces
        setFormStatus({
          type: "success",
          message: data.message,
        })
        // Resetowanie formularza
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        // Błąd
        setFormStatus({
          type: "error",
          message: data.message || "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.",
        })
      }
    } catch (error) {
      console.error("Błąd podczas wysyłania formularza:", error)
      setFormStatus({
        type: "error",
        message: "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.",
      })
    } finally {
      setIsSubmitting(false)
      // Przewinięcie do góry formularza, aby użytkownik zobaczył komunikat
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Kontakt z GotPage</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Formularz kontaktowy */}
        <Card>
          <CardHeader>
            <CardTitle>Napisz do nas</CardTitle>
            <CardDescription>Wypełnij formularz, a odpowiemy najszybciej jak to możliwe.</CardDescription>
          </CardHeader>
          <CardContent>
            {formStatus.type && (
              <Alert
                className={`mb-6 ${formStatus.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
              >
                {formStatus.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{formStatus.type === "success" ? "Sukces!" : "Błąd!"}</AlertTitle>
                <AlertDescription>{formStatus.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jan Kowalski"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jan.kowalski@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numer telefonu</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+48 123 456 789"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Temat</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Temat wiadomości"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Wiadomość *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Treść wiadomości..."
                  rows={5}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="text-sm text-gray-500">
                Pola oznaczone * są wymagane. Wysyłając formularz, zgadzasz się na przetwarzanie Twoich danych zgodnie z
                naszą
                <a href="/polityka-prywatnosci" className="text-blue-600 hover:underline">
                  {" "}
                  Polityką Prywatności
                </a>
                .
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  "Wyślij wiadomość"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informacje kontaktowe */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
              <CardDescription>Możesz skontaktować się z nami również bezpośrednio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">E-mail</h3>
                  <p className="text-gray-600">kontakt@gotpage.pl</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Telefon</h3>
                  <p className="text-gray-600">+48 123 456 789</p>
                  <p className="text-sm text-gray-500">Pon-Pt, 9:00-17:00</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Adres</h3>
                  <p className="text-gray-600">
                    GotPage Sp. z o.o.
                    <br />
                    ul. Przykładowa 123
                    <br />
                    00-001 Warszawa
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Godziny pracy</h3>
                  <p className="text-gray-600">
                    Poniedziałek - Piątek: 9:00 - 17:00
                    <br />
                    Sobota - Niedziela: Zamknięte
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dane firmy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>GotPage Sp. z o.o.</strong>
              </p>
              <p>NIP: 1234567890</p>
              <p>REGON: 123456789</p>
              <p>KRS: 0000123456</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

