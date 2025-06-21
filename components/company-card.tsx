"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Building, Clock, ExternalLink, Mail, MapPin, Phone, ShieldCheck, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"


interface CompanyItem {
  id: string
  name: string
  avatar: string
  bio: string
  location: string
  categories: string
  type: string
}

export interface CompanyCardProps {
  company: {
    id: string
    name: string
    avatar?: string
    logo: string | null
    description: string
    phone: string
    categories: string[]
    location: string
    rating: number
    reviewCount: number
    verified: boolean
  }
  featured?: boolean
}
export function CompanyCard({ company, featured = false }: CompanyCardProps) {
  const categories = Array.isArray(company.categories) ? company.categories : [];
  const router = useRouter();

  const handleMessage = async (userId: string) => {
    try {
      // Check if user is logged in
      const getUserData = async () => {
        const userData = await fetch("/api/auth/me").then((res) => res.json()) 
        return userData
      }

      const currentUser = await getUserData()
      if (!currentUser) {
        toast({
          title: "Wymagane logowanie",
          description: "Musisz być zalogowany, aby wysyłać wiadomości",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Create or get conversation
      const response = await fetch("/api/messages/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error creating conversation: ${response.status}`)
      }

      const data = await response.json()

      // Redirect to conversation
      router.push(`/wiadomosci`)
    } catch (err) {
      console.error("Error starting conversation:", err)
      toast({
        title: "Błąd",
        description: "Nie udało się rozpocząć konwersacji. Spróbuj ponownie później.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card
      className={`overflow-hidden hover:shadow-md  transition-all flex flex-col justify-between hover:scale-[1.01] ${
        featured ? "border-amber-300 hover:scale-105 shadow-amber-100" : ""
      }`}
    >
      <CardContent className="p-0 h-full">
        <div className="p-4 h-full flex justify-between flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {company.avatar !== "/placeholder-profile.svg?height=100&width=100" && company.avatar !== "/placeholder.svg?height=100&width=100" ? (
                  <img
                    src={company.avatar}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              {company.verified ? (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                  <ShieldCheck className="h-3 w-3" />
                </div>
              ) : ("")}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-lg truncate">{company.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{company.location}</span>
              </div>
              <div className="flex items-center mt-1">
                {company.rating > 0 ? (
                  <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < Math.floor(company.rating) ? "currentColor" : "none"}
                    color={i < Math.floor(company.rating) ? "#FFB800" : "#D1D5DB"}
                  />
                ))}
                <span className="text-sm ml-1">
                  {Number(company.rating).toFixed(1)} ({company.reviewCount})
                </span>
                  </>
                ) : "" }
                
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{company.description}</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <a href={`tel:${company.phone}`}>
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="h-3 w-3 mr-2" /> Zadzwoń
              </Button>
            </a>
            
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleMessage(company.id)}>
                <Mail className="h-3 w-3 mr-2" /> Napisz
              </Button>
          </div>
        </div>

        {featured && (
          <div className="bg-amber-50 p-2 border-t border-amber-100 flex items-center justify-between">
            <div className="flex items-center text-xs text-amber-700">
              <Clock className="h-3 w-3 mr-1" />
              <span>Firma wyróżniona</span>
            </div>
            <Link href="/promocja/firmy" className="text-xs text-primary flex items-center">
              Promuj swoją firmę <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-0">
        <Link href={`/profil/${company.id}`} className="w-full">
          <Button variant="default" className="w-full rounded-none">
            Zobacz profil
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

