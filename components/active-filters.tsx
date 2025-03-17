"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ActiveFiltersProps {
  selectedCategory: string
  selectedSubcategories: string[]
  selectedLocations: string[]
  priceRange: number[]
  onCategoryRemove: () => void
  onSubcategoryRemove: (subcategory: string) => void
  onLocationRemove: (location: string) => void
  onPriceReset: () => void
  onResetAll: () => void
}

export function ActiveFilters({
  selectedCategory,
  selectedSubcategories,
  selectedLocations,
  priceRange,
  onCategoryRemove,
  onSubcategoryRemove,
  onLocationRemove,
  onPriceReset,
  onResetAll,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    selectedCategory ||
    selectedSubcategories.length > 0 ||
    selectedLocations.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000

  if (!hasActiveFilters) return null

  return (
    <div className="mb-4 p-3 bg-muted rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Aktywne filtry:</h3>
        <Button variant="ghost" size="sm" onClick={onResetAll}>
          Wyczyść wszystkie
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedCategory && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {selectedCategory}
            <X className="h-3 w-3 cursor-pointer" onClick={onCategoryRemove} />
          </Badge>
        )}

        {selectedSubcategories.map((subcategory) => (
          <Badge key={subcategory} variant="secondary" className="flex items-center gap-1">
            {subcategory}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onSubcategoryRemove(subcategory)} />
          </Badge>
        ))}

        {selectedLocations.map((location) => (
          <Badge key={location} variant="secondary" className="flex items-center gap-1">
            {location}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onLocationRemove(location)} />
          </Badge>
        ))}

        {(priceRange[0] > 0 || priceRange[1] < 10000) && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {priceRange[0]} - {priceRange[1]} PLN
            <X className="h-3 w-3 cursor-pointer" onClick={onPriceReset} />
          </Badge>
        )}
      </div>
    </div>
  )
}

