"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer } from "react-leaflet"
import { useMap } from "react-leaflet/hooks"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"

// Komponent do aktualizacji widoku mapy
function MapUpdater({ center }: { center?: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, 12)
    }
  }, [center, map])

  return null
}

// Komponent do obsługi klastrów markerów
function MarkerClusterHandler({ ads }: { ads: any[] }) {
  const map = useMap()
  const clusterGroupRef = useRef<any>(null)

  useEffect(() => {
    // Dynamiczne importowanie biblioteki leaflet.markercluster
    const setupMarkerCluster = async () => {
      try {
        // Importuj bibliotekę
        const markerCluster = await import("leaflet.markercluster")

        // Dodaj style CSS
        if (!document.getElementById("marker-cluster-css")) {
          const link1 = document.createElement("link")
          link1.id = "marker-cluster-css"
          link1.rel = "stylesheet"
          link1.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
          document.head.appendChild(link1)

          const link2 = document.createElement("link")
          link2.id = "marker-cluster-default-css"
          link2.rel = "stylesheet"
          link2.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
          document.head.appendChild(link2)

          // Dodaj niestandardowe style dla klastrów
          const style = document.createElement("style")
          style.id = "custom-marker-cluster-css"
          style.textContent = `
            .marker-cluster-small {
              background-color: rgb(244 67 111 / 60%);
            }
            .marker-cluster-small div {
                 background-color: rgb(244 67 111);
            }
            .marker-cluster-medium {
              background-color: rgba(245, 158, 11, 0.6);
            }
            .marker-cluster-medium div {
              background-color: rgba(217, 119, 6, 0.8);
            }
            .marker-cluster-large {
              background-color: rgba(239, 68, 68, 0.6);
            }
            .marker-cluster-large div {
              background-color: rgba(220, 38, 38, 0.8);
            }
            .custom-marker {
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .custom-marker div {
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
              .leaflet-popup-content-wrapper {
              background: hsl(var(--background))!important;
              padding: 2px !important;
              overflow: hidden;
            }

            .leaflet-popup-content {
              margin: 0;
              width: auto !important;
            }

            .leaflet-container a.leaflet-popup-close-button {
              color: hsl(var(--muted-foreground));
              padding: 8px 8px 0 0;
            }

            .leaflet-container a.leaflet-popup-close-button:hover {
              color: hsl(var(--foreground));
            }

          `
          document.head.appendChild(style)
        }

        // Usuń poprzednią grupę klastrów, jeśli istnieje
        if (clusterGroupRef.current) {
          map.removeLayer(clusterGroupRef.current)
        }

        // Utwórz nową grupę klastrów
        const clusterGroup = L.markerClusterGroup({
          maxClusterRadius: 60,
          iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount()
            let size, className

            // Określ rozmiar i klasę na podstawie liczby ogłoszeń
            if (count < 10) {
              size = "small"
              className = "marker-cluster-small"
            } else if (count < 50) {
              size = "medium"
              className = "marker-cluster-medium"
            } else {
              size = "large"
              className = "marker-cluster-large"
            }

            // Utwórz ikonę klastra
            return L.divIcon({
              html: `<div><span>${count}</span></div>`,
              className: `marker-cluster ${className}`,
              iconSize: L.point(40, 40),
            })
          },
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          zoomToBoundsOnClick: true,
        })

        // Dodaj markery do grupy klastrów
        ads.forEach((ad) => {
          if (ad.coordinates && ad.coordinates[0] && ad.coordinates[1]) {
            // Utwórz niestandardowy marker
            const marker = L.marker([ad.coordinates[0], ad.coordinates[1]], {
              icon: L.divIcon({
                className: "custom-marker",
                html: `<div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md">${ad.category.charAt(0)}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              }),
            })

            // Utwórz zawartość popupu
            const formattedDate = formatDistanceToNow(new Date(ad.createdAt), {
              addSuffix: true,
              locale: pl,
            })

            console.log("Formatted date:", formattedDate)
            console.log("Ad data:", ad)

            const popupContent = `
              <div class="popup-content p-2 min-w-[200px]">
                <div class="mb-2 overflow-hidden rounded-md">
                  ${
                    
                       `<img src="${ad.image || "/placeholder.svg"}" alt="${ad.title}" class="h-24 w-full object-cover" />`
                      
                  }
                </div>
                <h3 class="font-medium text-sm text-foreground">${ad.title}</h3>
                <div class="flex items-center text-xs text-muted-foreground mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>${ad.location}</span>
                </div>
                <div class="flex items-center text-xs text-muted-foreground mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>${formattedDate}</span>
                </div>
                <div class="font-medium text-sm mt-2 text-foreground">
                  ${ad.price ? `${ad.price.toLocaleString()} zł` : "Cena do negocjacji"}
                </div>
                <a href="/ogloszenia/${ad.id}" class="mt-2 inline-block w-full rounded-md bg-primary px-3 py-1.5 text-center text-xs font-medium text-foreground! hover:bg-primary/90">
                  Zobacz szczegóły
                </a>
              </div>
            `

            marker.bindPopup(popupContent)
            clusterGroup.addLayer(marker)
          }
        })

        // Dodaj grupę klastrów do mapy
        map.addLayer(clusterGroup)
        clusterGroupRef.current = clusterGroup
      } catch (error) {
        console.error("Błąd podczas ładowania klastrów markerów:", error)
      }
    }

    if (ads.length > 0) {
      setupMarkerCluster()
    }

    // Czyszczenie przy odmontowaniu komponentu
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
      }
    }
  }, [map, ads])

  return null
}

// Funkcja do pobierania współrzędnych na podstawie adresu
const getCoordinates = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.length > 0) {
      return { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) }
    } else {
      console.warn("Nie znaleziono współrzędnych dla adresu:", address)
      return null
    }
  } catch (error) {
    console.error("Błąd podczas pobierania współrzędnych:", error)
    return null
  }
}

// Główny komponent mapy
interface AdsMapProps {
  ads: any[]
  isLoading: boolean
  center?: { lat: number; lng: number }
}

export default function AdsMap({
  ads = [],
  isLoading = false,
  center = { lat: 52.2297, lng: 21.0122 }, // Warszawa jako domyślne centrum
}: AdsMapProps) {
  const [mapAds, setMapAds] = useState<any[]>([])
  const leafletInitialized = useRef(false)

  // Inicjalizacja ikon Leaflet
  useEffect(() => {
    if (!leafletInitialized.current && typeof window !== "undefined") {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      })

      leafletInitialized.current = true
    }
  }, [])

  // Przetwarzanie danych ogłoszeń dla mapy
  useEffect(() => {
    if (!ads || ads.length === 0) return

    const fetchCoordinates = async () => {
      const processedAds = await Promise.all(
        ads.map(async (ad) => {
          // Jeśli ogłoszenie ma już współrzędne, użyj ich
          if (ad.coordinates) {
            return ad
          }

          // W przeciwnym razie pobierz współrzędne na podstawie lokalizacji
          const location = await getCoordinates(ad.location)
          return {
            ...ad,
            coordinates: location
              ? [location.lat, location.lng]
              : [
                  // Jeśli nie można pobrać współrzędnych, wygeneruj losowe w pobliżu centrum
                  center.lat + (Math.random() - 0.5) * 0.1,
                  center.lng + (Math.random() - 0.5) * 0.1,
                ],
          }
        }),
      )

      setMapAds(processedAds)
    }

    fetchCoordinates()
  }, [ads, center])

  if (typeof window === "undefined") {
    return null // Zwróć null podczas SSR
  }

  if (isLoading) {
    return (
      <div className="h-full w-full bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {/* Komponent obsługujący klastry markerów */}
      <MarkerClusterHandler ads={mapAds} />
    </MapContainer>
  )
}

