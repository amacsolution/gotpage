"use client"

import { Slider } from "@/components/ui/slider"

interface PriceFilterProps {
  priceRange: number[]
  onPriceChange: (value: number[]) => void
}

export function PriceFilter({ priceRange, onPriceChange }: PriceFilterProps) {
  return (
    <div>
      <h3 className="font-medium mb-2">Cena (PLN)</h3>
      <div className="pt-6 px-2">
        <Slider defaultValue={[0, 10000]} max={10000} step={100} value={priceRange} onValueChange={onPriceChange} />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>{priceRange[0]} PLN</span>
          <span>{priceRange[1]} PLN</span>
        </div>
      </div>
    </div>
  )
}

