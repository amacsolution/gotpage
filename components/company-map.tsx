"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import Leaflet components with no SSR
// This is crucial to avoid the "Map container is already initialized" error
const MapWithNoSSR = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

// Main map component
interface Company {
  id: string
  name: string
  logo?: string
  rating: number
  location: string
  coordinates?: [number, number]
}

interface CompanyMapProps {
  companies: Company[]
  isLoading: boolean
  center?: { lat: number; lng: number }
}

export default function CompanyMap({
  companies,
  isLoading,
  center = { lat: 52.0693, lng: 19.4803 }, // Warsaw as default center
}: CompanyMapProps) {
  const [mapCompanies, setMapCompanies] = useState<Company[]>([])
  const [mapKey, setMapKey] = useState(Date.now()) // Unique key for map reinitialization
  const [mapReady, setMapReady] = useState(false)

  // Process company data for the map
  useEffect(() => {
    if (!companies || companies.length === 0) return


    const fetchCoordinates = async () => {
      const processedCompanies = await Promise.all(
        companies.map(async (company) => {
          // If company already has coordinates, use them

          if (company.coordinates) {
            return company

          }

          const location = await getCoordinates(company.location)
          return {
            ...company,
            coordinates: location
              ? ([location.lat, location.lng] as [number, number])
              : ([center.lat, center.lng] as [number, number]),
          }
        }),
      )

      setMapCompanies(processedCompanies)
      // Update map key to force re-render when companies change
      setMapKey(Date.now())
      setMapReady(true)

    }

    fetchCoordinates()
  }, [companies, center])

  if (isLoading) {
    return (
      <div className="h-full w-full bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Ładowanie mapy...</span>
      </div>
    )
  }

  if (!mapReady) {
    return (
      <div className="h-full w-full bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <MapWithNoSSR key={`map-${mapKey}`} companies={mapCompanies} center={center} />
    </div>
  )
}

// Helper function to get coordinates from address
async function getCoordinates(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.length > 0) {
      return { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) }
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}
