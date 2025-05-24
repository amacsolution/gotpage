import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdFeed } from "@/components/ad-feed"
import { PageLayout } from "@/components/page-layout"
import { HeroAnimation } from "@/components/hero-animations"
import {
  MapPin,
  Building,
  Car,
  HomeIcon,
  Smartphone,
  Briefcase,
  ShoppingBag,
  Scissors,
  ArrowRight,
  Rocket,
} from "lucide-react"
import type { Metadata } from "next"
import CompaniesFeedLimit from "@/components/companies-feed"
import { UserProfiles } from "@/components/user-profiles"
import { Suspense } from "react"
import { SiteConfig } from "@/config/site"

// Dodajemy metadane dla SEO
export const metadata: Metadata = {
  title: `${SiteConfig.name} - Nowoczesna platforma ogłoszeniowa | Znajdź lub sprzedaj`,
  description:
    "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu. Znajdź to, czego szukasz lub sprzedaj to, co chcesz. Dołącz do społeczności Gotpage już dziś!",
  keywords: "ogłoszenia, sprzedaż, kupno, platforma ogłoszeniowa, gotpage, lokalne ogłoszenia, darmowe ogłoszenia",
  authors: [{ name: SiteConfig.name, url: SiteConfig.url }],
  creator: SiteConfig.name,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: SiteConfig.url,
    title: `${SiteConfig.name} - Nowoczesna platforma ogłoszeniowa`,
    description:
      "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu. Znajdź to, czego szukasz lub sprzedaj to, co chcesz.",
    siteName: SiteConfig.name,
    images: [
      {
        url: `${SiteConfig.url}/logo.png`,
        width: 1200,
        height: 630,
        alt: `${SiteConfig.name} - Nowoczesna platforma ogłoszeniowa`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SiteConfig.name} - Nowoczesna platforma ogłoszeniowa`,
    description:
      "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu. Znajdź to, czego szukasz lub sprzedaj to, co chcesz.",
    images: [`${SiteConfig.url}/logo.png`],
    creator: "@gotpage",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SiteConfig.url,
    languages: {
      "pl-PL": `${SiteConfig.url}/pl`,
      "en-US": `${SiteConfig.url}/en`,
    },
  },
  verification: {
    google: "verification_token",
    yandex: "verification_token",
  },
}

// Kategorie w stylu OLX
const categories = [
  {
    name: "Motoryzacja",
    icon: <Car className="h-6 w-6" />,
    href: "/ogloszenia?category=Motoryzacja",
    color: "bg-blue-100 dark:bg-blue-900",
    textColor: "text-blue-500 dark:text-blue-300",
  },
  {
    name: "Nieruchomości",
    icon: <HomeIcon className="h-6 w-6" />,
    href: "/ogloszenia?category=Nieruchomości",
    color: "bg-green-100 dark:bg-green-900",
    textColor: "text-green-500 dark:text-green-300",
  },
  {
    name: "Elektronika",
    icon: <Smartphone className="h-6 w-6" />,
    href: "/ogloszenia?category=Elektronika",
    color: "bg-purple-100 dark:bg-purple-900",
    textColor: "text-purple-500 dark:text-purple-300",
  },
  {
    name: "Praca",
    icon: <Briefcase className="h-6 w-6" />,
    href: "/ogloszenia?category=Praca",
    color: "bg-yellow-100 dark:bg-yellow-900",
    textColor: "text-yellow-500 dark:text-yellow-300",
  },
  {
    name: "Moda",
    icon: <ShoppingBag className="h-6 w-6" />,
    href: "/ogloszenia?category=Moda",
    color: "bg-pink-100 dark:bg-pink-900",
    textColor: "text-pink-500 dark:text-pink-300",
  },
  {
    name: "Usługi",
    icon: <Scissors className="h-6 w-6" />,
    href: "/ogloszenia?category=Usługi",
    color: "bg-orange-100 dark:bg-orange-900",
    textColor: "text-orange-500 dark:text-orange-300",
  },
  {
    name: "Firmy",
    icon: <Building className="h-6 w-6" />,
    href: "/firmy",
    color: "bg-indigo-100 dark:bg-indigo-900",
    textColor: "text-indigo-500 dark:text-indigo-300",
  },
  {
    name: "Lokalne",
    icon: <MapPin className="h-6 w-6" />,
    href: "/ogloszenia?local=true",
    color: "bg-red-100 dark:bg-red-900",
    textColor: "text-red-500 dark:text-red-300",
  },
]

export default function HomePage() {
  return (
    <PageLayout>
      {/* Hero Section z danymi strukturalnymi dla SEO */}
      <section className="relative overflow-visible" itemScope itemType="https://schema.org/WebPage">
        <meta itemProp="name" content="Gotpage - Nowoczesna platforma ogłoszeniowa" />
        <meta itemProp="description" content="Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu." />

        <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10 relative">
          <HeroAnimation />
          <div className="flex max-w-[980px] flex-col items-start gap-2 z-10">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Gotpage - nowoczesna platforma ogłoszeniowa <br className="hidden sm:inline" />
              dla firm i osób prywatnych
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Publikuj ogłoszenia, przeglądaj oferty i nawiązuj kontakty w nowoczesnym i przejrzystym interfejsie.
            </p>
          </div>
          <div className="flex gap-4 z-10 flex-wrap">
            <Link href="/ogloszenia/dodaj" aria-label="Dodaj nowe ogłoszenie">
              <Button size="lg">Dodaj ogłoszenie</Button>
            </Link>
            <Link href="/ogloszenia" aria-label="Przeglądaj dostępne ogłoszenia">
              <Button variant="outline" size="lg">
                Przeglądaj ogłoszenia
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Kategorie z danymi strukturalnymi */}
      <section className="container py-8" itemScope itemType="https://schema.org/ItemList">
        <h2 className="mb-6 text-2xl font-bold" itemProp="name">
          Kategorie
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={category.href}
              className="flex flex-col items-center justify-center p-4 rounded-lg transition-all hover:scale-105"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={`${index + 1}`} />
              <div className={`p-4 rounded-full ${category.color} ${category.textColor} mb-2`}>{category.icon}</div>
              <span className="text-sm font-medium" itemProp="name">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sekcja promocji */}
      <section className="container py-8 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Promuj swoje ogłoszenia</h2>
          <Link href="/ogloszenia/promuj" className="text-primary hover:underline flex items-center">
            Sprawdź szczegóły <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background p-6 rounded-lg border shadow-sm">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 w-fit mb-4">
              <Rocket className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Większa widoczność</h3>
            <p className="text-muted-foreground mb-4">
              Twoje ogłoszenia będą wyświetlane na górze listy wyszukiwania, co zwiększa szansę na szybką sprzedaż.
            </p>
            <Link href="/promowanie/ogloszenia">
              <Button variant="outline" className="w-full">
                Promuj ogłoszenia
              </Button>
            </Link>
          </div>
          <div className="bg-background p-6 rounded-lg border shadow-sm">
            <div className="p-3 rounded-full bg-green-100 text-green-500 w-fit mb-4">
              <Building className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Promuj firmę</h3>
            <p className="text-muted-foreground mb-4">
              Wyróżnij swój profil firmowy, aby przyciągnąć więcej klientów i zwiększyć rozpoznawalność marki.
            </p>
            <Link href="/promowanie/firma">
              <Button variant="outline" className="w-full">
                Promuj firmę
              </Button>
            </Link>
          </div>
          <div className="bg-background p-6 rounded-lg border shadow-sm">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 w-fit mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pakiety promocyjne</h3>
            <p className="text-muted-foreground mb-4">
              Skorzystaj z pakietów promocyjnych i oszczędzaj nawet do 40% przy promocji wielu ogłoszeń.
            </p>
            <Link href="/ogloszenia/promuj-pakiet">
              <Button variant="outline" className="w-full">
                Sprawdź pakiety
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Najnowsze ogłoszenia z danymi strukturalnymi */}
      <section className="container py-8" itemScope itemType="https://schema.org/ItemList">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" itemProp="name">
            Najnowsze ogłoszenia
          </h2>
          <Link href="/ogloszenia" className="text-primary hover:underline flex items-center">
            Zobacz wszystkie <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <Suspense fallback={<div className="text-center py-10">Ładowanie ogłoszeń...</div>}>
          <AdFeed />
        </Suspense>
      </section>

      {/* Sekcja firm */}
      <Suspense fallback={<div className="text-center py-10">Ładowanie firm...</div>}>
        <CompaniesFeedLimit />
      </Suspense>

      {/* Nowa sekcja: Profile użytkowników */}
      <section className="container py-8 bg-muted/30 rounded-lg my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Poznaj naszych użytkowników</h2>
          {/* <Link href="/uzytkownicy" className="text-primary hover:underline flex items-center">
            Zobacz wszystkich <ArrowRight className="ml-1 h-4 w-4" />
          </Link> */}
        </div>
        <Suspense fallback={<div className="text-center py-10">Ładowanie profili użytkowników...</div>}>
          <UserProfiles />
        </Suspense>
      </section>

      {/* Nowa sekcja: CTA i angażująca treść */}
      <section className="container py-12 my-8">
        <div className="bg-gradient-to-r from-primary/80 to-primary rounded-xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Dołącz do naszej społeczności już dziś!</h2>
            <p className="text-lg mb-8">
              Ponad 10,000 użytkowników korzysta z naszej platformy każdego dnia. Znajdź to, czego szukasz, sprzedaj
              niepotrzebne rzeczy lub nawiąż nowe kontakty biznesowe.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">50K+</div>
                <p>Aktywnych ogłoszeń</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">15K+</div>
                <p>Zarejestrowanych użytkowników</p>
              </div>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">5K+</div>
                <p>Transakcji miesięcznie</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Zarejestruj się za darmo
                </Button>
              </Link>
              <Link href="/ogloszenia">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Przeglądaj ogłoszenia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section dla SEO */}
      <section className="container py-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Często zadawane pytania</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" itemScope itemType="https://schema.org/FAQPage">
          <div
            className="bg-background p-6 rounded-lg border shadow-sm"
            itemScope
            itemType="https://schema.org/Question"
          >
            <h3 className="text-xl font-bold mb-2" itemProp="name">
              Jak dodać ogłoszenie?
            </h3>
            <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
              <p className="text-muted-foreground" itemProp="text">
                Aby dodać ogłoszenie, zaloguj się na swoje konto, kliknij przycisk "Dodaj ogłoszenie", wypełnij
                formularz z opisem, zdjęciami i ceną, a następnie opublikuj.
              </p>
            </div>
          </div>
          <div
            className="bg-background p-6 rounded-lg border shadow-sm"
            itemScope
            itemType="https://schema.org/Question"
          >
            <h3 className="text-xl font-bold mb-2" itemProp="name">
              Czy korzystanie z serwisu jest darmowe?
            </h3>
            <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
              <p className="text-muted-foreground" itemProp="text">
                Podstawowe funkcje serwisu są całkowicie darmowe. Oferujemy również płatne opcje promocji ogłoszeń,
                które zwiększają ich widoczność.
              </p>
            </div>
          </div>
          <div
            className="bg-background p-6 rounded-lg border shadow-sm"
            itemScope
            itemType="https://schema.org/Question"
          >
            <h3 className="text-xl font-bold mb-2" itemProp="name">
              Jak kontaktować się ze sprzedającym?
            </h3>
            <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
              <p className="text-muted-foreground" itemProp="text">
                Na stronie ogłoszenia znajdziesz przycisk "Napisz wiadomość", który pozwoli Ci rozpocząć konwersację ze
                sprzedającym bezpośrednio przez naszą platformę.
              </p>
            </div>
          </div>
          <div
            className="bg-background p-6 rounded-lg border shadow-sm"
            itemScope
            itemType="https://schema.org/Question"
          >
            <h3 className="text-xl font-bold mb-2" itemProp="name">
              Jak promować swoje ogłoszenia?
            </h3>
            <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
              <p className="text-muted-foreground" itemProp="text">
                Oferujemy różne pakiety promocyjne, które wyróżnią Twoje ogłoszenia. Możesz wybrać opcję "Promuj" przy
                swoim ogłoszeniu lub skorzystać z pakietów promocyjnych dla wielu ogłoszeń.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
