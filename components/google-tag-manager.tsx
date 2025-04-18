"use client"

import { useEffect } from "react"
import Script from "next/script"

export default function GoogleTagManager({ gtmId }: { gtmId: string }) {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
  }, [])

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
    </>
  )
}

// Add this to make TypeScript happy
declare global {
  interface Window {
    dataLayer: any[]
  }
}
