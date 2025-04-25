"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"

type MetaData = {
  ogTitle?: string
  ogDescription?: string
  ogImage?: { url: string } | Array<{ url: string; width?: string; height?: string; type?: string }>
  ogUrl?: string
  requestUrl?: string
  success?: boolean
  error?: string
}

// Ulepszona funkcja do wykrywania i czyszczenia linków
const extractUrl = (text: string): string | null => {
  // Podstawowe wyrażenie regularne do wykrywania linków
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?(:\d+)?(\/[^\s]*)?)/gi

  const matches = text.match(urlRegex)

  if (matches && matches.length > 0) {
    let url = matches[0]

    // Czyszczenie zduplikowanych domen (np. gotpage.plgotpage.pl)
    const domainRegex = /([a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+/g
    const domains = url.match(domainRegex)

    if (domains && domains.length > 0) {
      // Sprawdź, czy domena zawiera duplikaty
      const domain = domains[0]
      const parts = domain.split(".")

      // Tablica do przechowywania unikalnych części
      const uniqueParts: string[] = []

      // Usuwanie duplikatów
      parts.forEach((part) => {
        if (!uniqueParts.includes(part)) {
          uniqueParts.push(part)
        }
      })

      // Odbudowanie domeny bez duplikatów
      const cleanDomain = uniqueParts.join(".")

      // Zastąpienie oryginalnej domeny oczyszczoną
      url = url.replace(domain, cleanDomain)
    }

    // Sprawdź, czy URL zaczyna się od protokołu
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // Jeśli zaczyna się od www, dodaj https://
      if (url.startsWith("www.")) {
        url = "https://" + url
      } else {
        // W przeciwnym razie dodaj https:// przed URL
        url = "https://" + url
      }
    }

    return url
  }

  return null
}

const LinkPreview = ({ text }: { text: string }) => {
  const [metadata, setMetadata] = useState<MetaData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const extractedUrl = extractUrl(text)
    setUrl(extractedUrl)

    if (extractedUrl) {
      setLoading(true)
      setError(null)

      // Dodajemy timestamp, aby uniknąć cachowania
      const timestamp = new Date().getTime()
      fetch(`/api/fetchMetadata?url=${encodeURIComponent(extractedUrl)}&t=${timestamp}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error)
            setMetadata(null)
          } else {
            setMetadata(data)
            setError(null)
          }
        })
        .catch((err) => {
          setError("Nie udało się pobrać podglądu linku")
          setMetadata(null)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [text])

  // Jeśli nie ma URL, nie wyświetlaj nic
  if (!url) {
    return null
  }

  // Podczas ładowania pokaż skeleton
  if (loading) {
    return (
      <Card className="mt-3 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col">
            <Skeleton className="h-40 w-full" />
            <div className="p-3">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Jeśli wystąpił błąd lub nie ma metadanych, pokaż prosty link
  if (error || !metadata) {
    return (
      <Card className="mt-3 overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {url}
          </a>
        </CardContent>
      </Card>
    )
  }

  // Tytuł strony - użyj ogTitle lub domyślnej nazwy
  const title = metadata.ogTitle || "Link do strony"

  // Opis strony - użyj ogDescription lub pustego stringa
  const description = metadata.ogDescription || ""

  // URL obrazka - obsługa zarówno pojedynczego obiektu jak i tablicy
  let imageUrl = null
  if (metadata.ogImage) {
    if (Array.isArray(metadata.ogImage)) {
      // Jeśli ogImage to tablica, weź URL pierwszego elementu
      imageUrl = metadata.ogImage[0]?.url
    } else {
      // Jeśli ogImage to pojedynczy obiekt, weź jego URL
      imageUrl = metadata.ogImage.url
    }
  }

  // URL strony - użyj ogUrl, requestUrl lub oryginalnego URL
  const pageUrl = metadata.ogUrl || metadata.requestUrl || url

  // Nazwa domeny
  const domain = pageUrl ? new URL(pageUrl).hostname : ""

  return (
    <Card className="mt-3 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" aria-label={title} className="block">
            <div className="flex flex-row">
            {imageUrl && (
                <div className="relative h-30 w-40 aspect-square overflow-hidden">
                <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={title}
                    className="object-cover"
                    loading="lazy"
                    onError={(e) => {
                    // Jeśli obrazek nie załaduje się, ukryj go
                    ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                />
                </div>
            )}
            <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{title}</h3>
                {description && <p className="text-muted-foreground text-xs line-clamp-2 mb-2">{description}</p>}
                <div className="flex items-center text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 mr-1" />
                <span className="truncate">{domain}</span>
                </div>
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  )
}

export default LinkPreview

