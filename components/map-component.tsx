"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Building } from "lucide-react"

// Fix Leaflet icon issues in Next.js
const fixLeafletIcons = () => {
  // Only run on client side
  if (typeof window === "undefined") return

  // Fix Leaflet's icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  })
}

// Component to update map view
function MapUpdater({ center }: { center?: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 7)
    }
  }, [center, map])

  return null
}

// Main map component
interface Company {
  id: string
  name: string
  logo?: string
  rating: number
  location: string
  coordinates?: [number, number]
}

interface MapComponentProps {
  companies: Company[]
  center: { lat: number; lng: number }
}

export default function MapComponent({ companies, center }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Initialize Leaflet icons
  useEffect(() => {
    fixLeafletIcons()

    // Cleanup function to properly destroy the map when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      whenCreated={(map) => {
        mapRef.current = map
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {companies.map((company) =>
        company.coordinates ? (
          <Marker
            key={`marker-${company.id}`}
            position={company.coordinates}
            icon={L.divIcon({
              className: "custom-marker",
              html: `<div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">${company.name.charAt(0)}</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            })}
          >
            <Popup>
              <Card className="border-0 shadow-none">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {company.logo ? (
                        <img
                          src={company.logo || "/placeholder.svg"}
                          alt={company.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <Building className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{company.name}</h3>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3"
                            fill={i < Math.floor(company.rating) ? "currentColor" : "none"}
                            color={i < Math.floor(company.rating) ? "#FFB800" : "#D1D5DB"}
                          />
                        ))}
                        <span className="text-xs ml-1">{Number(company.rating).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{company.location}</p>
                  <Button size="sm" className="w-full text-xs" asChild>
                    <a href={`/profil/${company.id}`}>Zobacz profil</a>
                  </Button>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ) : null,
      )}
    </MapContainer>
  )
}
