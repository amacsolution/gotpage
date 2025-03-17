"use client"

import { Button } from "@/components/ui/button"

interface SubcategorySelectorProps {
  category: string
  subcategories: string[]
  selectedSubcategories: string[]
  onSubcategorySelect: (subcategory: string) => void
}

export function SubcategorySelector({
  category,
  subcategories,
  selectedSubcategories,
  onSubcategorySelect,
}: SubcategorySelectorProps) {
  if (!category) return null

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-medium">Podkategorie w {category}:</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedSubcategories.length === 0 ? "default" : "outline"}
          size="sm"
          onClick={() => onSubcategorySelect("")}
        >
          Wszystko
        </Button>

        {subcategories.map((subcategory) => (
          <Button
            key={subcategory}
            variant={selectedSubcategories.includes(subcategory) ? "default" : "outline"}
            size="sm"
            onClick={() => onSubcategorySelect(subcategory)}
          >
            {subcategory}
          </Button>
        ))}
      </div>
    </div>
  )
}

