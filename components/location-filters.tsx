import { Checkbox } from "@/components/ui/checkbox"

interface LocationFiltersProps {
  locations: string[]
  selectedLocations: string[]
  onLocationToggle: (location: string) => void
}

export function LocationFilters({ locations, selectedLocations, onLocationToggle }: LocationFiltersProps) {
  return (
    <div>
      <h3 className="font-medium mb-2">Lokalizacja</h3>
      <div className="space-y-1">
        {locations.map((location) => (
          <div key={location} className="flex items-center">
            <Checkbox
              id={`location-${location}`}
              checked={selectedLocations.includes(location)}
              onCheckedChange={() => onLocationToggle(location)}
            />
            <label htmlFor={`location-${location}`} className="ml-2 text-sm">
              {location}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

