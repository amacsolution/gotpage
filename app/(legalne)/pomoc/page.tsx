import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, HelpCircle, FileText, Shield, User, MessageSquare, CreditCard, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: "Centrum Pomocy | Gotpage",
  description: "Znajdź odpowiedzi na najczęściej zadawane pytania, poradniki i wskazówki dotyczące korzystania z serwisu Gotpage",
  keywords: "pomoc, FAQ, pytania, odpowiedzi, poradniki, wskazówki, gotpage, ogłoszenia, konto, płatności",
  openGraph: {
    title: "Centrum Pomocy | Gotpage",
    description: "Znajdź odpowiedzi na najczęściej zadawane pytania, poradniki i wskazówki dotyczące korzystania z serwisu Gotpage",
    type: "website",
    locale: "pl_PL",
    siteName: "Gotpage",
  },
}

export default function HelpCenterPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Centrum Pomocy</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Znajdź odpowiedzi na najczęściej zadawane pytania i dowiedz się, jak najlepiej korzystać z Gotpage
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Wyszukaj w centrum pomocy..." 
            className="pl-10 py-6 text-lg"
          />
        </div>
      </div>

      <Tabs defaultValue="faq" className="max-w-5xl  mx-auto">
        <TabsList className="grid grid-cols-4 h-auto mb-8">
          <TabsTrigger value="faq" className="flex flex-col items-center gap-2 py-3">
            <HelpCircle className="h-5 w-5" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex flex-col items-center gap-2 py-3">
            <FileText className="h-5 w-5" />
            <span>Poradniki</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex flex-col items-center gap-2 py-3">
            <User className="h-5 w-5" />
            <span>Konto</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex flex-col items-center gap-2 py-3">
            <CreditCard className="h-5 w-5" />
            <span>Płatności</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Najczęściej zadawane pytania</CardTitle>
              <CardDescription>
                Odpowiedzi na najczęściej zadawane pytania dotyczące korzystania z serwisu Gotpage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Jak dodać ogłoszenie?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Aby dodać ogłoszenie, wykonaj następujące kroki:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Zaloguj się na swoje konto (lub zarejestruj się, jeśli jeszcze nie masz konta)</li>
                      <li>Kliknij przycisk "Dodaj ogłoszenie" w górnym menu</li>
                      <li>Wypełnij formularz, dodając tytuł, opis, cenę i zdjęcia</li>
                      <li>Wybierz odpowiednią kategorię i lokalizację</li>
                      <li>Kliknij "Opublikuj ogłoszenie"</li>
                    </ol>
                    <p className="mt-2">Twoje ogłoszenie zostanie opublikowane natychmiast po zatwierdzeniu.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Jak edytować lub usunąć ogłoszenie?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Aby edytować lub usunąć ogłoszenie:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Zaloguj się na swoje konto</li>
                      <li>Przejdź do zakładki "Moje ogłoszenia" w panelu użytkownika</li>
                      <li>Znajdź ogłoszenie, które chcesz edytować lub usunąć</li>
                      <li>Kliknij przycisk "Edytuj" lub "Usuń" przy wybranym ogłoszeniu</li>
                    </ol>
                    <p className="mt-2">Pamiętaj, że po usunięciu ogłoszenia nie będzie można go przywrócić.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Jak promować ogłoszenie?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Promowanie ogłoszenia zwiększa jego widoczność i szanse na szybką sprzedaż:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Przejdź do swojego ogłoszenia</li>
                      <li>Kliknij przycisk "Promuj ogłoszenie"</li>
                      <li>Wybierz jeden z dostępnych pakietów promocyjnych</li>
                      <li>Dokonaj płatności za wybrany pakiet</li>
                    </ol>
                    <p className="mt-2">Promowane ogłoszenia są wyświetlane na górze listy wyszukiwania i oznaczone specjalną etykietą "Promowane".</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Jak bezpiecznie kupować i sprzedawać?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Aby bezpiecznie korzystać z serwisu:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Zawsze spotykaj się w miejscach publicznych</li>
                      <li>Sprawdzaj towar przed zakupem</li>
                      <li>Unikaj przedpłat na konto, zwłaszcza przy drogich przedmiotach</li>
                      <li>Zachowaj dowód zakupu lub potwierdzenie transakcji</li>
                      <li>Zgłaszaj podejrzane ogłoszenia do administracji serwisu</li>
                    </ul>
                    <p className="mt-2">Więcej informacji znajdziesz w sekcji <Link href="/bezpieczenstwo" className="text-primary hover:underline">Bezpieczeństwo</Link>.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Jak założyć konto firmowe?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Aby założyć konto firmowe:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Kliknij "Zarejestruj się" w górnym menu</li>
                      <li>Wybierz opcję "Firma" podczas rejestracji</li>
                      <li>Wypełnij formularz, podając dane firmy, w tym NIP</li>
                      <li>Potwierdź adres email</li>
                      <li>Uzupełnij profil firmy, dodając logo, opis i kategorie działalności</li>
                    </ol>
                    <p className="mt-2">Konto firmowe daje dostęp do dodatkowych funkcji, takich jak wyróżniony profil w katalogu firm i możliwość promowania firmy.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Dodawanie ogłoszeń
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Dowiedz się, jak tworzyć skuteczne ogłoszenia, które przyciągną uwagę potencjalnych kupujących.</p>
                <Link href="/pomoc/poradniki/dodawanie-ogloszen">
                  <Button variant="outline">Czytaj więcej</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Komunikacja z kupującymi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Poznaj najlepsze praktyki komunikacji z potencjalnymi kupującymi i zwiększ swoje szanse na sprzedaż.</p>
                <Link href="/pomoc/poradniki/komunikacja">
                  <Button variant="outline">Czytaj więcej</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Bezpieczne transakcje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Poznaj zasady bezpiecznych transakcji i unikaj potencjalnych zagrożeń podczas kupna i sprzedaży.</p>
                <Link href="/pomoc/poradniki/bezpieczne-transakcje">
                  <Button variant="outline">Czytaj więcej</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Promowanie ogłoszeń i firm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Dowiedz się, jak skutecznie promować swoje ogłoszenia i firmę, aby dotrzeć do większej liczby potencjalnych klientów.</p>
                <Link href="/pomoc/poradniki/promowanie">
                  <Button variant="outline">Czytaj więcej</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Zarządzanie kontem</CardTitle>
              <CardDescription>
                Informacje dotyczące zarządzania kontem użytkownika
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="account-1">
                  <AccordionTrigger>Jak zmienić dane w profilu?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Aby zmienić dane w profilu:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Zaloguj się na swoje konto</li>
                      <li>Przejdź do zakładki "Profil"</li>
                      <li>Kliknij przycisk "Edytuj profil"</li>
                      <li>Wprowadź nowe dane i kliknij "Zapisz zmiany"</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="account-2">
                  <AccordionTrigger>Jak zmienić hasło?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Aby zmienić hasło:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Zaloguj się na swoje konto</li>
                      <li>Przejdź do zakładki "Profil"</li>
                      <li>Kliknij przycisk "Zmień hasło"</li>
                      <li>Wprowadź aktualne hasło, a następnie nowe hasło dwukrotnie</li>
                      <li>Kliknij "Zapisz zmiany"</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="account-3">
                  <AccordionTrigger>Co zrobić, gdy zapomnę hasła?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Jeśli zapomniałeś hasła:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Kliknij "Zaloguj się" w górnym menu</li>
                      <li>Kliknij link "Zapomniałeś hasła?" pod formularzem logowania</li>
                      <li>Wprowadź adres email powiązany z Twoim kontem</li>
                      <li>Sprawdź swoją skrzynkę email i postępuj zgodnie z instrukcjami w wiadomości</li>
                    </ol>
                    <p className="mt-2">Link do resetowania hasła jest ważny przez 24 godziny.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="account-4">
                  <AccordionTrigger>Jak usunąć konto?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Aby usunąć konto:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Zaloguj się na swoje konto</li>
                      <li>Przejdź do zakładki "Profil"</li>
                      <li>Przewiń na dół strony i kliknij "Usuń konto"</li>
                      <li>Potwierdź chęć usunięcia konta, wprowadzając swoje hasło</li>
                    </ol>
                    <p className="mt-2 text-red-500">Uwaga: Usunięcie konta jest nieodwracalne. Wszystkie Twoje ogłoszenia, wiadomości i dane zostaną trwale usunięte.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Płatności i promocje</CardTitle>
              <CardDescription>
                Informacje dotyczące płatności, promocji ogłoszeń i firm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="payments-1">
                  <AccordionTrigger>Jakie metody płatności są dostępne?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">W serwisie Gotpage akceptujemy następujące metody płatności:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Karty płatnicze (Visa, Mastercard)</li>
                      <li>BLIK</li>
                      <li>Przelewy online</li>
                      <li>Google Pay</li>
                      <li>Apple Pay</li>
                    </ul>
                    <p className="mt-2">Wszystkie płatności są przetwarzane przez bezpieczny system Stripe.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="payments-2">
                  <AccordionTrigger>Ile kosztuje promowanie ogłoszenia?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Oferujemy trzy pakiety promocji ogłoszeń:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Basic:</strong> 9,99 zł za 7 dni promocji</li>
                      <li><strong>Standard:</strong> 19,99 zł za 14 dni promocji</li>
                      <li><strong>Premium:</strong> 39,99 zł za 30 dni promocji</li>
                    </ul>
                    <p className="mt-2">Każdy pakiet oferuje różne korzyści, takie jak wyróżnienie na liście ogłoszeń, wyświetlanie w sekcji polecanych i odświeżanie ogłoszenia.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="payments-3">
                  <AccordionTrigger>Ile kosztuje promowanie firmy?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Oferujemy trzy pakiety promocji firm:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Business:</strong> 99 zł miesięcznie</li>
                      <li><strong>Professional:</strong> 199 zł miesięcznie</li>
                      <li><strong>Enterprise:</strong> 399 zł miesięcznie</li>
                    </ul>
                    <p className="mt-2">Każdy pakiet oferuje różne korzyści, takie jak wyróżniony profil firmy, priorytetowe wyświetlanie ogłoszeń i dostęp do rozszerzonych statystyk.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="payments-4">
                  <AccordionTrigger>Czy mogę otrzymać fakturę za płatność?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Tak, możesz otrzymać fakturę za każdą płatność dokonaną w serwisie Gotpage:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Po dokonaniu płatności, przejdź do zakładki "Historia płatności" w panelu użytkownika</li>
                      <li>Znajdź płatność, za którą chcesz otrzymać fakturę</li>
                      <li>Kliknij przycisk "Pobierz fakturę" lub "Wygeneruj fakturę"</li>
                      <li>Wprowadź dane do faktury, jeśli nie zostały wcześniej podane</li>
                    </ol>
                    <p className="mt-2">Faktury są generowane automatycznie i dostępne do pobrania w formacie PDF.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Nie znalazłeś odpowiedzi na swoje pytanie?</h2>
        <p className="text-muted-foreground mb-6">Skontaktuj się z naszym zespołem wsparcia, który chętnie Ci pomoże</p>
        <Link href="/kontakt">
          <Button size="lg">Skontaktuj się z nami</Button>
        </Link>
      </div>
    </>
  )
}
