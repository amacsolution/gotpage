"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

interface CookieSettings {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Sprawdź, czy użytkownik już zaakceptował pliki cookie
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // Pokaż banner po krótkim opóźnieniu
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    setSettings({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
  }

  const handleAcceptSelected = () => {
    saveConsent(settings)
  }

  const saveConsent = (consentSettings: CookieSettings) => {
    localStorage.setItem("cookie-consent", JSON.stringify(consentSettings))
    setOpen(false)

    // Tutaj możesz dodać kod do ustawienia odpowiednich plików cookie
    // w zależności od wybranych ustawień
  }

  if (!open) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle>Ustawienia plików cookie</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Zamknij</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showDetails ? (
            <Tabs defaultValue="informacje">
              <TabsList className="mb-4">
                <TabsTrigger value="informacje">Informacje</TabsTrigger>
                <TabsTrigger value="ustawienia">Ustawienia</TabsTrigger>
              </TabsList>
              <TabsContent value="informacje">
                <div className="space-y-4">
                  <p>
                    Używamy plików cookie, aby zapewnić najlepsze doświadczenia na naszej stronie. Pliki cookie to małe
                    pliki tekstowe, które są przechowywane na Twoim urządzeniu, gdy odwiedzasz naszą stronę.
                  </p>
                  <h3 className="text-lg font-medium">Rodzaje plików cookie, których używamy:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Niezbędne:</strong> Te pliki cookie są wymagane do działania podstawowych funkcji strony i
                      nie mogą być wyłączone.
                    </li>
                    <li>
                      <strong>Funkcjonalne:</strong> Te pliki cookie umożliwiają zapamiętanie Twoich preferencji i
                      ustawień.
                    </li>
                    <li>
                      <strong>Analityczne:</strong> Te pliki cookie pomagają nam zrozumieć, w jaki sposób odwiedzający
                      korzystają z naszej strony.
                    </li>
                    <li>
                      <strong>Marketingowe:</strong> Te pliki cookie są używane do śledzenia odwiedzających na stronach
                      internetowych w celu wyświetlania odpowiednich reklam.
                    </li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="ustawienia">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Niezbędne pliki cookie</h3>
                      <p className="text-sm text-muted-foreground">
                        Te pliki cookie są wymagane i nie mogą być wyłączone.
                      </p>
                    </div>
                    <Switch checked={settings.necessary} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Funkcjonalne pliki cookie</h3>
                      <p className="text-sm text-muted-foreground">Umożliwiają zapamiętanie Twoich preferencji.</p>
                    </div>
                    <Switch
                      checked={settings.functional}
                      onCheckedChange={(checked) => setSettings({ ...settings, functional: checked })}
                      id="functional"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Analityczne pliki cookie</h3>
                      <p className="text-sm text-muted-foreground">
                        Pomagają nam zrozumieć, jak korzystasz z naszej strony.
                      </p>
                    </div>
                    <Switch
                      checked={settings.analytics}
                      onCheckedChange={(checked) => setSettings({ ...settings, analytics: checked })}
                      id="analytics"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Marketingowe pliki cookie</h3>
                      <p className="text-sm text-muted-foreground">Używane do wyświetlania odpowiednich reklam.</p>
                    </div>
                    <Switch
                      checked={settings.marketing}
                      onCheckedChange={(checked) => setSettings({ ...settings, marketing: checked })}
                      id="marketing"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <p>
              Nasza strona używa plików cookie, aby zapewnić najlepsze doświadczenia. Możesz zaakceptować wszystkie
              pliki cookie lub dostosować swoje preferencje.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Ukryj szczegóły" : "Pokaż szczegóły"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAcceptSelected}>
              Akceptuj wybrane
            </Button>
            <Button onClick={handleAcceptAll}>Akceptuj wszystkie</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

