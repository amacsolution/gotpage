import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Search, Tag, MessageSquare, CreditCard, Building, User, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: "Jak to działa | Gotpage",
  description: "Dowiedz się, jak działa serwis Gotpage - od rejestracji, przez dodawanie ogłoszeń, po promowanie firmy",
  keywords: "jak to działa, instrukcja, poradnik, ogłoszenia, dodawanie ogłoszeń, promowanie, gotpage",
  openGraph: {
    title: "Jak to działa | Gotpage",
    description: "Dowiedz się, jak działa serwis Gotpage - od rejestracji, przez dodawanie ogłoszeń, po promowanie firmy",
    type: "website",
    locale: "pl_PL",
    siteName: "Gotpage",
  },
}

export default function HowItWorksPage() {
  return (
    <>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Jak działa Gotpage?</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Poznaj krok po kroku, jak korzystać z naszego serwisu ogłoszeniowego
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Dodawaj ogłoszenia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Szybko i łatwo dodawaj ogłoszenia w różnych kategoriach. Dodaj zdjęcia, opis i cenę, aby przyciągnąć potencjalnych kupujących.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Przeglądaj oferty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Przeglądaj tysiące ogłoszeń w różnych kategoriach. Korzystaj z zaawansowanych filtrów, aby znaleźć dokładnie to, czego szukasz.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Promuj swoją firmę</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stwórz profil firmowy i promuj swoją działalność. Zdobywaj opinie klientów i buduj swoją reputację online.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Krok po kroku</h2>
        
        <div className="space-y-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <div className="bg-muted rounded-lg overflow-hidden">
                <Image 
                  src="/placeholder.svg?height=300&width=500&text=Rejestracja+konta" 
                  alt="Rejestracja konta" 
                  width={500} 
                  height={300} 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                Zarejestruj się
              </h3>
              <p className="text-muted-foreground mb-4">
                Rozpocznij od utworzenia konta w serwisie Gotpage. Możesz zarejestrować się jako osoba prywatna lub firma. Rejestracja jest bezpłatna i zajmuje tylko kilka minut.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Szybka rejestracja przez email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Możliwość utworzenia konta firmowego</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Pełna kontrola nad swoim profilem</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/2">
              <div className="bg-muted rounded-lg overflow-hidden">
                <Image 
                  src="/placeholder.svg?height=300&width=500&text=Dodawanie+ogłoszenia" 
                  alt="Dodawanie ogłoszenia" 
                  width={500} 
                  height={300} 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                Dodaj ogłoszenie
              </h3>
              <p className="text-muted-foreground mb-4">
                Dodawanie ogłoszenia jest proste i intuicyjne. Wypełnij formularz, dodaj zdjęcia i określ cenę. Twoje ogłoszenie będzie widoczne dla tysięcy potencjalnych kupujących.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Łatwy w obsłudze formularz</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Możliwość dodania do 10 zdjęć</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Szczegółowe kategorie i parametry</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <div className="bg-muted rounded-lg overflow-hidden">
                <Image 
                  src="/placeholder.svg?height=300&width=500&text=Komunikacja+z+kupującymi" 
                  alt="Komunikacja z kupującymi" 
                  width={500} 
                  height={300} 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                Komunikuj się z kupującymi
              </h3>
              <p className="text-muted-foreground mb-4">
                Odbieraj wiadomości od zainteresowanych kupujących i odpowiadaj na nie bezpośrednio przez nasz system wiadomości. Ustal szczegóły transakcji i finalizuj sprzedaż.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Wbudowany system wiadomości</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Powiadomienia o nowych wiadomościach</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Historia konwersacji</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/2">
              <div className="bg-muted rounded-lg overflow-hidden">
                <Image 
                  src="/placeholder.svg?height=300&width=500&text=Promowanie+ogłoszeń" 
                  alt="Promowanie ogłoszeń" 
                  width={500} 
                  height={300} 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
                Promuj swoje ogłoszenia
              </h3>
              <p className="text-muted-foreground mb-4">
                Zwiększ widoczność swoich ogłoszeń dzięki naszym pakietom promocyjnym. Promowane ogłoszenia są wyświetlane na górze listy wyszukiwania i mają większe szanse na szybką sprzedaż.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Wyróżnienie na liście ogłoszeń</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Wyświetlanie w sekcji polecanych</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Statystyki wyświetleń i kliknięć</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Dla firm</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Profil firmowy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Stwórz profesjonalny profil firmowy, który wyróżni Twoją działalność. Dodaj logo, opis firmy i kategorie działalności.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Wyróżniony profil w katalogu firm</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Możliwość dodawania zdjęć i portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Zbieranie opinii od klientów</span>
                </li>
              </ul>
              <Link href="/promocja/firmy">
                <Button variant="outline" className="w-full">Dowiedz się więcej</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pakiety promocyjne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Wybierz pakiet promocyjny, który najlepiej odpowiada potrzebom Twojej firmy. Zwiększ widoczność i przyciągnij więcej klientów.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Pakiety dostosowane do różnych potrzeb</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Priorytetowe wyświetlanie ogłoszeń</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Dostęp do rozszerzonych statystyk</span>
                </li>
              </ul>
              <Link href="/promocja">
                <Button variant="outline" className="w-full">Zobacz pakiety</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Gotowy, aby zacząć?</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Dołącz do tysięcy zadowolonych użytkowników i zacznij korzystać z Gotpage już dziś
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="min-w-[200px]">
              Zarejestruj się <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ogloszenia">
            <Button size="lg" variant="outline" className="min-w-[200px]">
              Przeglądaj ogłoszenia
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
