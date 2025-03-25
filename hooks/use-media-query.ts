"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Ustaw początkową wartość
    setMatches(media.matches)

    // Callback do aktualizacji stanu
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Dodaj nasłuchiwanie na zmiany
    media.addEventListener("change", listener)

    // Cleanup
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

