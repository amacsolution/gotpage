import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertTriangle, Lock, Eye, UserCheck, CreditCard, MessageSquare, Flag, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: "Bezpieczeństwo | Gotpage",
  description: "Dowiedz się, jak bezpiecznie korzystać z serwisu Gotpage. Poznaj nasze zasady bezpieczeństwa, porady dotyczące bezpiecznych transakcji i ochrony danych osobowych.",
  keywords: "bezpieczeństwo, ochrona danych, bezpieczne transakcje, oszustwa, prywatność, gotpage",
}

export default function SecurityPage() {
  const securityTips = [
    {
      title: "Sprawdzaj profil sprzedającego",
      description: "Zwróć uwagę na datę rejestracji, oceny i opinie innych użytkowników. Zweryfikowani sprzedawcy są oznaczeni specjalną ikoną.",
      icon: <UserCheck className="h-8 w-8 text-primary" />,
      do: [
        "Sprawdź datę rejestracji konta",
        "Przeczytaj opinie innych użytkowników",
        "Zwróć uwagę na oznaczenie 'Zweryfikowany'",
        "Sprawdź inne ogłoszenia sprzedającego"
      ],
      dont: [
        "Nie ufaj kontom założonym niedawno bez żadnych opinii",
        "Nie ignoruj negatywnych opinii od innych użytkowników"
      ]
    },
    {
      title: "Zachowaj ostrożność przy płatnościach",
      description: "Unikaj płatności z góry, zwłaszcza przelewów na nieznane konta. Preferuj płatność przy odbiorze lub bezpieczne metody płatności.",
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      do: [
        "Preferuj płatność przy odbiorze",
        "Korzystaj z bezpiecznych metod płatności",
        "Zachowaj potwierdzenia transakcji",
        "Unikaj przelewów na prywatne konta"
      ],
      dont: [
        "Nie wysyłaj pieniędzy z góry nieznanym osobom",
        "Nie korzystaj z podejrzanych systemów płatności",
        "Nie podawaj danych karty na niezaufanych stronach"
      ]
    },
    {
      title: "Komunikuj się przez platformę",
      description: "Korzystaj z wbudowanego systemu wiadomości Gotpage, aby mieć historię rozmów i dodatkową ochronę.",
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      do: [
        "Używaj systemu wiadomości Gotpage",
        "Zachowaj historię rozmów",
        "Wyjaśnij wszystkie szczegóły przed spotkaniem",
        "Bądź uprzejmy i profesjonalny"
      ],
      dont: [
        "Nie podawaj zbyt szybko swojego numeru telefonu",
        "Nie klikaj w podejrzane linki przesłane przez innych użytkowników",
        "Nie zgadzaj się na rozmowy poza platformą na wczesnym etapie"
      ]
    },
    {
      title: "Uważaj na podejrzane oferty",
      description: "Jeśli oferta wydaje się zbyt dobra, aby była prawdziwa, prawdopodobnie tak jest. Unikaj ogłoszeń z nienaturalnie niskimi cenami.",
      icon: <AlertTriangle className="h-8 w-8 text-primary" />,
      do: [
        "Porównuj ceny z podobnymi ofertami",
        "Pytaj o szczegóły i dodatkowe zdjęcia",
        "Sprawdzaj dokładnie opis i zdjęcia",
        "Zweryfikuj autentyczność produktu przed zakupem"
      ],
      dont: [
        "Nie daj się zwieść nienaturalnie niskim cenom",
        "Nie ignoruj błędów w opisie lub niskiej jakości zdjęć",
        "Nie pomijaj sprawdzenia szczegółów oferty"
      ]
    },
    {
      title: "Zgłaszaj podejrzane ogłoszenia",
      description: "Jeśli zauważysz podejrzane ogłoszenie lub zachowanie innego użytkownika, zgłoś to do naszego zespołu moderacji. Pomożesz w ten sposób chronić innych użytkowników.",
      icon: <Flag className="h-8 w-8 text-primary" />,
      do: [
        "Zgłaszaj podejrzane ogłoszenia",
        "Informuj o nieuczciwych praktykach",
        "Podaj szczegółowy powód zgłoszenia",
        "Zachowaj dowody oszustwa (np. zrzuty ekranu)"
      ],
      dont: [
        "Nie ignoruj podejrzanych zachowań",
        "Nie wdawaj się w konflikty z podejrzanymi użytkownikami",
        "Nie podawaj swoich danych osobom, które wzbudzają Twoje podejrzenia"
      ]
    },
  ]

  const warningSignals = [
    "Nienaturalnie niska cena w porównaniu do wartości rynkowej",
    "Sprzedający nalega na szybką płatność z góry",
    "Sprzedający nie chce spotkać się osobiście lub pokazać produktu",
    "Sprzedający prosi o dane osobowe lub bankowe, które nie są potrzebne do transakcji",
    "Ogłoszenie zawiera błędy językowe lub jest napisane w dziwny sposób",
    "Zdjęcia są niskiej jakości, skopiowane z internetu lub nie pokazują faktycznego stanu produktu",
    "Sprzedający proponuje transakcję poza platformą Gotpage",
    "Sprzedający twierdzi, że mieszka za granicą i prosi o przesłanie pieniędzy",
    "Sprzedający wywiera presję i pośpiech przy podejmowaniu decyzji"
  ]

  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bezpieczeństwo na Gotpage</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Dowiedz się, jak bezpiecznie korzystać z naszego serwisu i chronić swoje dane osobowe
        </p>
      </div>

      {/* Główne zasady bezpieczeństwa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-4">Nasze zasady bezpieczeństwa</h2>
          <p className="text-lg text-muted-foreground">
            W Gotpage bezpieczeństwo naszych użytkowników jest priorytetem. Stosujemy najnowsze technologie i procedury, aby chronić Twoje dane i zapewnić bezpieczne korzystanie z serwisu.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Ochrona danych osobowych</h3>
                <p className="text-muted-foreground">
                  Twoje dane są szyfrowane i przechowywane zgodnie z najwyższymi standardami bezpieczeństwa.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Bezpieczne płatności</h3>
                <p className="text-muted-foreground">
                  Wszystkie transakcje są zabezpieczone i przetwarzane przez zaufanych partnerów płatniczych.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Monitorowanie ogłoszeń</h3>
                <p className="text-muted-foreground">
                  Nasz zespół moderatorów regularnie sprawdza ogłoszenia, aby wykrywać i usuwać podejrzane treści.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg?height=400&width=600&text=Bezpieczeństwo"
            alt="Bezpieczeństwo"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Porady bezpieczeństwa */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Porady bezpieczeństwa</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Poznaj nasze wskazówki, które pomogą Ci bezpiecznie korzystać z serwisu Gotpage
          </p>
        </div>

        <Tabs defaultValue="buyers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="buyers">Dla kupujących</TabsTrigger>
            <TabsTrigger value="sellers">Dla sprzedających</TabsTrigger>
          </TabsList>
          <TabsContent value="buyers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityTips.map((tip, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {tip.icon}
                      </div>
                      <CardTitle>{tip.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base">{tip.description}</CardDescription>
                    
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" /> Co robić
                      </h4>
                      <ul className="space-y-1 pl-6 text-sm">
                        {tip.do.map((item, i) => (
                          <li key={i} className="list-disc text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" /> Czego unikać
                      </h4>
                      <ul className="space-y-1 pl-6 text-sm">
                        {tip.dont.map((item, i) => (
                          <li key={i} className="list-disc text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sellers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <UserCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Weryfikuj kupujących</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    Sprawdzaj profile kupujących, ich historię i opinie. Bądź ostrożny wobec podejrzanych zapytań.
                  </CardDescription>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Co robić
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Sprawdzaj profil kupującego przed finalizacją transakcji</li>
                      <li className="list-disc text-muted-foreground">Zadawaj pytania, aby zweryfikować intencje kupującego</li>
                      <li className="list-disc text-muted-foreground">Zachowaj całą historię rozmów</li>
                      <li className="list-disc text-muted-foreground">Ustal jasne warunki transakcji</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" /> Czego unikać
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Nie wysyłaj produktu przed otrzymaniem płatności</li>
                      <li className="list-disc text-muted-foreground">Nie akceptuj czeków ani podejrzanych form płatności</li>
                      <li className="list-disc text-muted-foreground">Nie podawaj danych osobowych, które nie są niezbędne do transakcji</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Bezpieczne płatności</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    Wybieraj bezpieczne metody płatności i zawsze wydawaj potwierdzenia. Unikaj podejrzanych propozycji płatności.
                  </CardDescription>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Co robić
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Preferuj płatności przy odbiorze lub przez bezpieczne platformy</li>
                      <li className="list-disc text-muted-foreground">Zawsze wydawaj potwierdzenia płatności</li>
                      <li className="list-disc text-muted-foreground">Dokładnie sprawdzaj otrzymane przelewy</li>
                      <li className="list-disc text-muted-foreground">Informuj o dostępnych metodach płatności w opisie ogłoszenia</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" /> Czego unikać
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Nie akceptuj płatności z podejrzanych źródeł</li>
                      <li className="list-disc text-muted-foreground">Nie zgadzaj się na płatności w ratach bez zabezpieczenia</li>
                      <li className="list-disc text-muted-foreground">Nie wysyłaj produktu przed zaksięgowaniem płatności</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Jasna komunikacja</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    Komunikuj się jasno i profesjonalnie. Podawaj dokładne informacje o produkcie i warunkach sprzedaży.
                  </CardDescription>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Co robić
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Dokładnie opisuj produkty, w tym wady</li>
                      <li className="list-disc text-muted-foreground">Dodawaj wysokiej jakości zdjęcia</li>
                      <li className="list-disc text-muted-foreground">Szybko odpowiadaj na pytania</li>
                      <li className="list-disc text-muted-foreground">Jasno określaj warunki sprzedaży, dostawy i zwrotów</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" /> Czego unikać
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Nie ukrywaj wad produktu</li>
                      <li className="list-disc text-muted-foreground">Nie używaj wprowadzających w błąd opisów lub zdjęć</li>
                      <li className="list-disc text-muted-foreground">Nie ignoruj pytań potencjalnych kupujących</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Bezpieczne spotkania</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    Jeśli spotykasz się z kupującym osobiście, wybieraj bezpieczne, publiczne miejsca i zachowaj ostrożność.
                  </CardDescription>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Co robić
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Wybieraj publiczne miejsca na spotkania</li>
                      <li className="list-disc text-muted-foreground">Informuj bliskich o planowanym spotkaniu</li>
                      <li className="list-disc text-muted-foreground">Spotykaj się w ciągu dnia</li>
                      <li className="list-disc text-muted-foreground">Miej przy sobie telefon</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" /> Czego unikać
                    </h4>
                    <ul className="space-y-1 pl-6 text-sm">
                      <li className="list-disc text-muted-foreground">Nie spotykaj się w odludnych miejscach</li>
                      <li className="list-disc text-muted-foreground">Nie zapraszaj nieznajomych do domu</li>
                      <li className="list-disc text-muted-foreground">Nie pokazuj, że masz przy sobie dużo gotówki</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sygnały ostrzegawcze */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sygnały ostrzegawcze</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Poznaj sygnały ostrzegawcze, które mogą wskazywać na próbę oszustwa
          </p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Uwaga</AlertTitle>
          <AlertDescription>
            Jeśli zauważysz którykolwiek z poniższych sygnałów ostrzegawczych, zachowaj szczególną ostrożność i rozważ rezygnację z transakcji.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warningSignals.map((signal, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p>{signal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Zgłaszanie problemów */}
      <div className="mt-20 bg-muted/30 p-8 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Zgłaszanie problemów</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Jeśli zauważysz podejrzane ogłoszenie lub zachowanie, zgłoś to do naszego zespołu moderacji
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/centrum-pomocy#kontakt">
              <Flag className="mr-2 h-5 w-5" />
              Zgłoś problem
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/centrum-pomocy">
              Centrum pomocy
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
