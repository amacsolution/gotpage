import type React from "react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "./footer"
import GoogleTagManager from "@/components/google-tag-manager"
import GoogleTagManagerNoScript from "@/components/google-tag-manager-noscript"

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  // Get the Google Tag Manager ID from environment variables
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-NDMHS7S8" // Using the ID from your screenshot as default

  return (
    <div className="flex min-h-screen flex-col">
      {/* Add Google Tag Manager script */}
      <GoogleTagManager gtmId={gtmId} />

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
        </div>
      </header>

      {/* Add Google Tag Manager noscript right after body opening */}
      <GoogleTagManagerNoScript gtmId={gtmId} />

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
