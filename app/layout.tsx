import type React from "react"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CookieConsent } from "@/components/cookie-consent"
import GoogleTagManager from "@/components/google-tag-manager" // Dodany import
import "./globals.css"
import { UserProvider } from "@/lib/user-context"
import { initUploadsFolder } from "@/lib/init-upload"
import { Providers } from "@/components/providers"


// Dodaj wywołanie funkcji przed deklaracją komponentu RootLayout
// Inicjalizacja folderu na zdjęcia
initUploadsFolder()
  .catch((error) => console.error("Błąd inicjalizacji folderu na zdjęcia:", error))

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
  description: "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu",
  keywords: "ogłoszenia, sprzedaż, kupno, wynajem, usługi, praca, nieruchomości, motoryzacja",
  authors: [{ name: "Antoni Maciejowski" }],
  creator: "Antoni Maciejowski",
  publisher: "Gotpage",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gotpage.pl"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
    description: "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu",
    url: "https://gotpage.pl",
    siteName: "Gotpage",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "https://gotpage.pl/logo.png",
        width: 1200,
        height: 630,
        alt: "Gotpage Logo",
      },
    ],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gotpage - Nowoczesna platforma ogłoszeniowa",
    description: "Publikuj i przeglądaj ogłoszenia w nowoczesnym stylu",
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={inter.className}>
        {/* Dodany komponent Google Tag Manager */}
        <GoogleTagManager
          gtmId={process.env.NEXT_PUBLIC_GTM_ID || "default-gtm-id"} // Replace "default-gtm-id" with a valid fallback ID or handle missing value
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} // Zastąp swoim rzeczywistym ID GA4
        />
        <Providers>
          <UserProvider>{children}</UserProvider>
          <Toaster />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}