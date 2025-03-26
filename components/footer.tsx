import React from 'react'
import Image from "next/legacy/image"
import { Link } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

const Footer = () => {
  return (
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
  )
}

export default Footer