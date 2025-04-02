import type React from "react"
import Link from "next/link"
import Image from "next/legacy/image"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "./footer"

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Gotpage Logo" width={24} height={24} className="h-6 w-auto" />
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gotpage. Wszelkie prawa zastrzeżone.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/regulamin" className="text-sm text-muted-foreground hover:underline">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="text-sm text-muted-foreground hover:underline">
              Polityka prywatności
            </Link>
            <Link href="/kontakt" className="text-sm text-muted-foreground hover:underline">
              Kontakt
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}

