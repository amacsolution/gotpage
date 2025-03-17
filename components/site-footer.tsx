import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteFooter() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/logo.svg" alt="Gotpage Logo" width={32} height={32} className="h-8 w-auto" />
            <span className="font-bold text-xl">Gotpage</span>
          </div>
          <p className="text-muted-foreground mb-4 max-w-md">
            Gotpage to nowoczesna platforma ogłoszeniowa, która łączy sprzedających i kupujących w intuicyjnym i
            przejrzystym interfejsie.
          </p>
          <div className="flex gap-4">
            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </div>
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4">Ogłoszenia</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/ogloszenia" className="text-muted-foreground hover:text-foreground">
                Przeglądaj ogłoszenia
              </Link>
            </li>
            <li>
              <Link href="/ogloszenia/dodaj" className="text-muted-foreground hover:text-foreground">
                Dodaj ogłoszenie
              </Link>
            </li>
            <li>
              <Link href="/ogloszenia/promuj-pakiet" className="text-muted-foreground hover:text-foreground">
                Promuj ogłoszenia
              </Link>
            </li>
            <li>
              <Link href="/kategorie" className="text-muted-foreground hover:text-foreground">
                Kategorie
              </Link>
            </li>
            <li>
              <Link href="/ogloszenia?local=true" className="text-muted-foreground hover:text-foreground">
                Ogłoszenia lokalne
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Dla firm</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/firmy" className="text-muted-foreground hover:text-foreground">
                Katalog firm
              </Link>
            </li>
            <li>
              <Link href="/auth/register?type=business" className="text-muted-foreground hover:text-foreground">
                Załóż profil firmy
              </Link>
            </li>
            <li>
              <Link href="/profil?tab=promotion" className="text-muted-foreground hover:text-foreground">
                Promuj firmę
              </Link>
            </li>
            <li>
              <Link href="/dla-firm/cennik" className="text-muted-foreground hover:text-foreground">
                Cennik usług
              </Link>
            </li>
            <li>
              <Link href="/dla-firm/wsparcie" className="text-muted-foreground hover:text-foreground">
                Wsparcie dla firm
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Informacje</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/o-nas" className="text-muted-foreground hover:text-foreground">
                O nas
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="text-muted-foreground hover:text-foreground">
                Kontakt
              </Link>
            </li>
            <li>
              <Link href="/regulamin" className="text-muted-foreground hover:text-foreground">
                Regulamin
              </Link>
            </li>
            <li>
              <Link href="/polityka-prywatnosci" className="text-muted-foreground hover:text-foreground">
                Polityka prywatności
              </Link>
            </li>
            <li>
              <Link href="/pomoc" className="text-muted-foreground hover:text-foreground">
                Centrum pomocy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mt-8 pt-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Gotpage. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/mapa-strony" className="text-sm text-muted-foreground hover:underline">
              Mapa strony
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:underline">
              Polityka cookies
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}

