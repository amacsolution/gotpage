"use client"

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import React, { useEffect } from 'react'

interface GoogleTagManagerProps {
  gtmId: string
  gaId?: string
}

export default function GoogleTagManager({ gtmId, gaId }: GoogleTagManagerProps) {
    const pathname = usePathname()
  
    return (
      <React.Suspense fallback={null}>
        <GoogleTagManagerContent gtmId={gtmId} gaId={gaId} pathname={pathname} />
      </React.Suspense>
    )
  }
  
  function GoogleTagManagerContent({ gtmId, gaId, pathname }: GoogleTagManagerProps & { pathname: string }) {
    const searchParams = useSearchParams()
  
    useEffect(() => {
      if (pathname) {
        // Wysyłanie zdarzenia wyświetlenia strony do dataLayer przy zmianie ścieżki
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: 'page_view',
          page: pathname,
        })
      }
    }, [pathname, searchParams])
  
    return (
    <>
      {/* Bazowy skrypt GTM - inicjalizacja dataLayer */}
      <Script
        id="gtm-base"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
          `,
        }}
      />
      
      {/* Skrypt GTM */}
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
      
      {/* Skrypt GA4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      
      {/* GTM noscript iframe */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="gtm"
        />
      </noscript>
    </>
  )
}

declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}