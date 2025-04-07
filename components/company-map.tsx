"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useMap } from "react-leaflet/hooks"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Building } from "lucide-react"

// Naprawienie ikon Leaflet w Next.js

// Komponent do aktualizacji widoku mapy
function MapUpdater({ center }: { center?: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, 7)
    }
  }, [center, map])

  return null
}

// Główny komponent mapy
interface Company {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  location: string;
}

interface CompanyMapProps {
  companies: Company[];
  isLoading: boolean;
  center?: { lat: number; lng: number };
}

const getCoordinates = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  
    try {
      const response = await fetch(url)
      const data = await response.json()
  
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      } else {
        console.warn("Nie znaleziono współrzędnych dla adresu:", address)
        return null
      }
    } catch (error) {
      console.error("Błąd podczas pobierania współrzędnych:", error)
      return null
    }
  }

export default function CompanyMap({
  companies,
  isLoading,
  center = { lat: 52.2297, lng: 21.0122 }, // Warszawa jako domyślne centrum
}: CompanyMapProps) {
  const [mapCompanies, setMapCompanies] = useState<any[]>([])
  const leafletInitialized = useRef(false)

  useEffect(() => {
    if (!leafletInitialized.current) {
      // No need to delete _getIconUrl as it does not exist

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      })

      leafletInitialized.current = true
    }
  }, [])

  // Przetwarzanie danych firm dla mapy
  useEffect(() => {
    if (!companies || companies.length === 0) return
  
    const fetchCoordinates = async () => {
      const processedCompanies = await Promise.all(
        companies.map(async (company) => {
          const location = await getCoordinates(company.location) // Pobierz współrzędne na podstawie adresu
          return {
            ...company,
            coordinates: location ? [location.lat, location.lng] : [center.lat, center.lng], // Domyślnie ustaw środek mapy, jeśli brak danych
          }
        })
      )
  
      setMapCompanies(processedCompanies)
    }
  
    fetchCoordinates()
  }, [companies, center])
  

  if (isLoading) {
    return <div className="h-full w-full bg-muted/30 flex items-center justify-center">Ładowanie mapy...</div>
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {mapCompanies.map((company) => (
        <Marker
          key={company.id}
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
                <Button size="sm" className="w-full text-xs text-foreground" asChild>
                  <a href={`/profil/${company.id}`}>Zobacz profil</a>
                </Button>
              </CardContent>
            </Card>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

