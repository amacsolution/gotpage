"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  // Unikamy błędów hydratacji przez renderowanie dzieci tylko po stronie klienta
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Podczas pierwszego renderowania na serwerze lub podczas hydratacji
    // zwracamy tylko dzieci bez providerów, aby uniknąć błędów hydratacji
    return <div suppressHydrationWarning>{children}</div>
  }

  return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
  )
}
