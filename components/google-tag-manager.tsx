"use client"

import { useEffect } from "react"
import Script from "next/script"

interface GoogleTagManagerProps {
  gtmId: string
  gaId?: string
  enableOnLocalhost?: boolean
}

export default function GoogleTagManager({ gtmId, gaId, enableOnLocalhost = false }: GoogleTagManagerProps) {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

  const shouldLoadGTM = !isLocalhost || enableOnLocalhost

  useEffect(() => {
    if (shouldLoadGTM) {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || []

      // Jeśli mamy ID Google Analytics, dodajmy konfigurację GA4
      if (gaId) {
        window.dataLayer.push({
          "gtm.start": new Date().getTime(),
          event: "gtm.js",
          config: gaId,
        })
      }
    }
  }, [shouldLoadGTM, gaId])

  if (!shouldLoadGTM) {
    return null
  }

  return (
    <>
      {/* Google Tag Manager - Script for head */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />

      {/* Dodajemy bezpośrednio skrypt Google Analytics 4 */}
      {gaId && (
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `,
          }}
        />
      )}
    </>
  )
}

// Add this to make TypeScript happy
declare global {
  interface Window {
    dataLayer: any[]
    google_tag_manager?: any
    gtag?: (...args: any[]) => void
  }
}
