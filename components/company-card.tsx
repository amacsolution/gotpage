import Link from "next/link"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface CompanyCardProps {
  company: {
    id: number
    name: string
    logo: string
    description: string
    categories: string[]
    location: string
    rating: number
    reviewCount: number
    verified: boolean
  }
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/firmy/${company.id}`}>
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="relative h-16 w-16 rounded-md overflow-hidden">
                <Image
                  src={company.logo || "/placeholder.svg?height=100&width=100"}
                  alt={company.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base hover:text-primary transition-colors">{company.name}</h3>
                {company.verified && (
                  <span className="text-primary text-xs" title="Zweryfikowana">
                    ✓
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1 text-xs">
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1">{company.rating}</span>
                  <span className="text-muted-foreground ml-1">({company.reviewCount})</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {company.location}
                </div>
              </div>

              <p className="text-muted-foreground text-xs line-clamp-2 mb-2">{company.description}</p>

              <div className="flex flex-wrap gap-1">
                {company.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

