"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/verify")
        const data = await res.json()

        if (!data.authenticated) {
          router.push("/admin/login")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Błąd weryfikacji:", error)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Ładowanie...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ustawienia</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ustawienia strony</CardTitle>
          <CardDescription>Zarządzaj podstawowymi ustawieniami strony</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Nazwa strony</Label>
            <Input id="site-name" defaultValue="Social Media Clone" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Opis strony</Label>
            <Input id="site-description" defaultValue="Platforma społecznościowa" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="registration">Rejestracja użytkowników</Label>
              <p className="text-sm text-gray-500">Włącz lub wyłącz możliwość rejestracji nowych użytkowników</p>
            </div>
            <Switch id="registration" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments">Komentarze</Label>
              <p className="text-sm text-gray-500">Włącz lub wyłącz możliwość komentowania postów</p>
            </div>
            <Switch id="comments" defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Zapisz zmiany</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

