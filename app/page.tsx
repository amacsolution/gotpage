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

// Dodajemy metadane dla SEO
export const metadata: Metadata = {
  title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
  description:
    "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu. Znajdź to, czego szukasz lub sprzedaj to, co chcesz.",
  keywords: "ogłoszenia, sprzedaż, kupno, platforma ogłoszeniowa, gotpage",
  openGraph: {
    title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
    description:
      "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu. Znajdź to, czego szukasz lub sprzedaj to, co chcesz.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gotpage - Nowoczesna platforma ogłoszeniowa",
      },
    ],
    type: "website",
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

// Mock data dla firm
const featuredCompanies = [
  {
    id: 1,
    name: "Auto Serwis Kowalski",
    logo: "/placeholder.svg?height=100&width=100&text=Auto+Serwis",
    description:
      "Profesjonalny serwis samochodowy z wieloletnim doświadczeniem. Oferujemy naprawy mechaniczne, elektryczne, diagnostykę komputerową oraz wymianę opon.",
    categories: ["Motoryzacja", "Usługi"],
    location: "Warszawa",
    rating: 4.8,
    reviewCount: 124,
    verified: true,
  },
  {
    id: 2,
    name: "Nieruchomości XYZ",
    logo: "/placeholder.svg?height=100&width=100&text=XYZ",
    description:
      "Biuro nieruchomości specjalizujące się w sprzedaży i wynajmie mieszkań, domów oraz lokali użytkowych. Działamy na rynku od 15 lat.",
    categories: ["Nieruchomości"],
    location: "Kraków",
    rating: 4.5,
    reviewCount: 87,
    verified: true,
  },
  {
    id: 3,
    name: "IT Solutions Sp. z o.o.",
    logo: "/placeholder.svg?height=100&width=100&text=IT",
    description:
      "Firma informatyczna oferująca usługi programistyczne, tworzenie stron internetowych, aplikacji mobilnych oraz wsparcie IT dla firm.",
    categories: ["Usługi", "Elektronika"],
    location: "Poznań",
    rating: 4.9,
    reviewCount: 93,
    verified: true,
  },
  {
    id: 4,
    name: "Salon Fryzjerski Elegancja",
    logo: "/placeholder.svg?height=100&width=100&text=Fryzjer",
    description:
      "Profesjonalny salon fryzjerski oferujący strzyżenie, koloryzację, stylizację oraz zabiegi pielęgnacyjne dla włosów.",
    categories: ["Usługi", "Moda"],
    location: "Gdańsk",
    rating: 4.7,
    reviewCount: 142,
    verified: true,
  },
]

export default function HomePage() {


  return (
    <PageLayout>
      <div className="relative overflow-visible ">
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
            <Link href="/ogloszenia/dodaj">
              <Button size="lg">Dodaj ogłoszenie</Button>
            </Link>
            <Link href="/ogloszenia">
              <Button variant="outline" size="lg">
                Przeglądaj ogłoszenia
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <h2 className="mb-6 text-2xl font-bold">Kategorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="flex flex-col items-center justify-center p-4 rounded-lg transition-all hover:scale-105"
            >
              <div className={`p-4 rounded-full ${category.color} ${category.textColor} mb-2`}>{category.icon}</div>
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container py-8 bg-muted/30 rounded-lg">
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
            <Link href="/ogloszenia/promuj">
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
            <Link href="/profil?tab=promotion">
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
      </div>

      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Najnowsze ogłoszenia</h2>
          <Link href="/ogloszenia" className="text-primary hover:underline flex items-center">
            Zobacz wszystkie <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <AdFeed />
      </div>

      <CompaniesFeedLimit />
    </PageLayout>
  )
}

