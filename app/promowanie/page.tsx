"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Building, Tag } from "lucide-react"

export default function PromotionPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <PageLayout>
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Promowanie na Gotpage</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Wybierz rodzaj promocji, który najlepiej odpowiada Twoim potrzebom
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Promocja ogłoszeń */}
          <div className="relative">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : (
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-primary/90 to-primary/50 rounded-t-lg"></div>
                <CardHeader className="relative z-10 pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-full shadow-md">
                      <Tag className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center">Promuj ogłoszenie</CardTitle>
                </CardHeader>
                <CardContent className="text-center mt-5">
                  <p className="mb-6">
                    Wyróżnij swoje ogłoszenie na tle innych, zwiększ jego widoczność i sprzedaj szybciej.
                  </p>
                  <ul className="text-left space-y-2 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Wyższe pozycjonowanie
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Oznaczenie jako "Promowane"
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Więcej wyświetleń i kliknięć
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Szybsza sprzedaż
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                  <Link href="/promowanie/ogloszenia">
                    <Button className="gap-2 group">
                      Promuj ogłoszenie{" "}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Promocja firm */}
          <div className="relative">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full rounded-lg" />
            ) : (
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-t-lg"></div>
                <CardHeader className="relative z-10 pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-full shadow-md">
                      <Building className="h-8 w-8 text-blue-700" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center">Promuj firmę</CardTitle>
                </CardHeader>
                <CardContent className="text-center mt-5">
                  <p className="mb-6">
                    Zwiększ widoczność swojej firmy, buduj zaufanie klientów i rozwijaj swój biznes.
                  </p>
                  <ul className="text-left space-y-2 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-700">✓</span> Wyróżniony profil firmy
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-700">✓</span> Oznaczenie jako "Zweryfikowana Firma"
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-700">✓</span> Więcej klientów i zapytań
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-700">✓</span> Statystyki i analityka
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                  <Link href="/promowanie/firma">
                    <Button className="gap-2 bg-blue-700 hover:bg-blue-800 group">
                      Promuj firmę <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>

        {/* Dodatkowa sekcja z licznikiem odwiedzających */}
        {!isLoading && (
          <div className="mt-16 rounded-lg p-8 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Dołącz do tysięcy zadowolonych klientów</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className=" transition-all hover:shadow-lg hover:shadow-foreground/10 p-4 rounded-lg ">
                <div className="text-3xl font-bold text-primary mb-2 counter" id="visitors-counter">
                  12,458
                </div>
                <p className="text-sm text-muted-foreground">Aktywnych użytkowników</p>
              </div>
              <div className="transition-all hover:shadow-lg hover:shadow-foreground/10  p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2 counter" id="ads-counter">
                  45,721
                </div>
                <p className="text-sm text-muted-foreground">Opublikowanych ogłoszeń</p>
              </div>
              <div className="transition-all hover:shadow-lg hover:shadow-foreground/10  p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2 counter" id="companies-counter">
                  3,892
                </div>
                <p className="text-sm text-muted-foreground">Zweryfikowanych firm</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Dołącz do naszej społeczności i skorzystaj z możliwości, jakie daje promocja na Gotpage!
            </p>
          </div>
        )}

        {/* Dodatkowa sekcja z informacjami o promocji */}
        {!isLoading && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Dlaczego warto promować się na Gotpage?</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <p>Docierasz do większej liczby potencjalnych klientów dzięki lepszej widoczności.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <p>Budujesz zaufanie dzięki oznaczeniom premium i weryfikacji.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <p>Zwiększasz swoje szanse na szybką sprzedaż lub pozyskanie nowych klientów.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <p>
                      Otrzymujesz dostęp do szczegółowych statystyk i analiz, które pomogą Ci optymalizować działania.
                    </p>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Jak działa promocja?</h2>
                <ol className="space-y-3 list-decimal pl-5">
                  <li>
                    <p>Wybierz rodzaj promocji - dla ogłoszenia lub dla firmy.</p>
                  </li>
                  <li>
                    <p>Wybierz pakiet, który najlepiej odpowiada Twoim potrzebom.</p>
                  </li>
                  <li>
                    <p>Dokonaj płatności online - szybko i bezpiecznie.</p>
                  </li>
                  <li>
                    <p>Twoje ogłoszenie lub profil firmy zostanie natychmiast wyróżniony.</p>
                  </li>
                  <li>
                    <p>Śledź wyniki i ciesz się zwiększonym zainteresowaniem!</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dodanie prostego skryptu do animacji liczników */}
      {!isLoading && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const counters = document.querySelectorAll('.counter');
              counters.forEach(counter => {
                const target = parseInt(counter.innerText.replace(/,/g, ''));
                const increment = target / 100;
                let current = 0;
                const updateCounter = () => {
                  if (current < target) {
                    current += increment;
                    counter.innerText = Math.ceil(current).toLocaleString();
                    setTimeout(updateCounter, 10);
                  } else {
                    counter.innerText = target.toLocaleString();
                  }
                };
                updateCounter();
              });
            });
          `,
          }}
        />
      )}
    </PageLayout>
  )
}

