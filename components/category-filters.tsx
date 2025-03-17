"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight } from "lucide-react"

interface Category {
  id: number
  name: string
  subcategories: string[]
}

interface CategoryFiltersProps {
  categories: Category[]
  selectedCategory: string
  selectedSubcategories: string[]
  expandedCategories: number[]
  onCategoryChange: (category: string) => void
  onSubcategoryToggle: (subcategory: string) => void
  onCategoryExpansion: (categoryId: number) => void
}

export function CategoryFilters({
  categories,
  selectedCategory,
  selectedSubcategories,
  expandedCategories,
  onCategoryChange,
  onSubcategoryToggle,
  onCategoryExpansion,
}: CategoryFiltersProps) {
  return (
    <div>
      <h3 className="font-medium mb-2">Kategorie</h3>
      <div className="space-y-1">
        <div className="flex items-center">
          <Checkbox
            id="all-categories"
            checked={selectedCategory === ""}
            onCheckedChange={() => {
              onCategoryChange("")
            }}
          />
          <label htmlFor="all-categories" className="ml-2 text-sm font-medium">
            Wszystkie kategorie
          </label>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategory === category.name}
                onCheckedChange={() => {
                  onCategoryChange(selectedCategory === category.name ? "" : category.name)
                }}
              />
              <label htmlFor={`category-${category.id}`} className="ml-2 text-sm font-medium flex-grow">
                {category.name}
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onCategoryExpansion(category.id)}
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="ml-6 space-y-1">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory} className="flex items-center">
                    <Checkbox
                      id={`subcategory-${subcategory}`}
                      checked={selectedSubcategories.includes(subcategory)}
                      onCheckedChange={() => onSubcategoryToggle(subcategory)}
                    />
                    <label htmlFor={`subcategory-${subcategory}`} className="ml-2 text-sm">
                      {subcategory}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

