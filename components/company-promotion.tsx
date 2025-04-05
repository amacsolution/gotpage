"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'
import { CheckCircle } from 'lucide-react'
import { PricingTable } from "@/components/pricing-table"

interface CompanyPromotionProps {
 isPromoted?: boolean
 promotionEndDate?: string
 promotionPlan?: string
}

export function CompanyPromotion({ isPromoted = false, promotionEndDate, promotionPlan }: CompanyPromotionProps) {
 const [selectedPlan, setSelectedPlan] = useState<string>("standard")
 const [isLoading, setIsLoading] = useState(false)
 const { toast } = useToast()

 const plans = [
   {
     id: "standard",
     name: "Standard",
     price: 49.99,
     features: ["Wyróżnienie firmy w katalogu", "Priorytetowe wyświetlanie ogłoszeń", "30 dni promocji"],
   },
   {
     id: "premium",
     name: "Premium",
     price: 99.99,
     features: [
       "Wszystkie funkcje planu Standard",
       "Oznaczenie jako Zweryfikowana Firma",
       "Wyświetlanie w sekcji polecanych firm",
       "60 dni promocji",
     ],
   },
   {
     id: "vip",
     name: "VIP",
     price: 199.99,
     features: [
       "Wszystkie funkcje planu Premium",
       "Dedykowany baner na stronie głównej",
       "Priorytetowa obsługa klienta",
       "90 dni promocji",
     ],
   },
 ]

 const handlePromotion = async () => {
   setIsLoading(true)

   try {
     // Tutaj będzie integracja z systemem płatności Stripe
     toast({
       title: "Przekierowanie do płatności",
       description: "Za chwilę zostaniesz przekierowany do systemu płatności",
     })

     // Symulacja opóźnienia
     await new Promise((resolve) => setTimeout(resolve, 1500))

     // Przekierowanie do Stripe (w rzeczywistej implementacji)
     window.location.href = `/api/stripe/create-checkout?plan=${selectedPlan}&promotionType=company`
   } catch (error) {
     toast({
       title: "Błąd",
       description: "Wystąpił błąd podczas przetwarzania płatności",
       variant: "destructive",
     })
   } finally {
     setIsLoading(false)
   }
 }

 return (
   <div className="space-y-6">
     <div>
       <h2 className="text-xl font-semibold mb-2">Promowanie firmy</h2>
       <p className="text-muted-foreground">
         Promuj swoją firmę, aby zwiększyć widoczność i przyciągnąć więcej klientów.
       </p>
     </div>

     {isPromoted && promotionEndDate ? (
       <Card className="bg-primary/5 border-primary/20">
         <CardHeader>
           <CardTitle>Aktywna promocja</CardTitle>
           <CardDescription>
             Twoja firma jest obecnie promowana w planie <strong>{promotionPlan || "Standard"}</strong>
           </CardDescription>
         </CardHeader>
         <CardContent>
           <p>
             Promocja aktywna do: <strong>{new Date(promotionEndDate).toLocaleDateString()}</strong>
           </p>
           <p className="mt-4">
             Dzięki promocji Twoja firma jest wyróżniona w katalogu firm, a Twoje ogłoszenia mają wyższy priorytet
             wyświetlania.
           </p>
         </CardContent>
         <CardFooter>
           <Button variant="outline" onClick={() => (window.location.href = "/firmy")}>
             Zobacz swój profil w katalogu
           </Button>
         </CardFooter>
       </Card>
     ) : (
       <>
         <PricingTable
           plans={plans}
           onSelect={setSelectedPlan}
           selectedPlan={selectedPlan}
           isLoading={isLoading}
           handlePromotion={handlePromotion}
         />
       </>
     )}
   </div>
 )
}