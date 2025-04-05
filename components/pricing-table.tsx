"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'
import { CheckCircle } from 'lucide-react'

interface PricingTableProps {
 plans: {
   id: string
   name: string
   price: number
   features: string[]
 }[]
 onSelect: (plan: string) => void
 selectedPlan: string
 isLoading: boolean
 handlePromotion: () => void
}

export function PricingTable({ plans, onSelect, selectedPlan, isLoading, handlePromotion }: PricingTableProps) {
 return (
   <div className="grid gap-6 md:grid-cols-3">
     {plans.map((plan) => (
       <Card
         key={plan.id}
         className={`${
           selectedPlan === plan.id ? "border-primary" : ""
         } cursor-pointer hover:border-primary/50 transition-colors`}
         onClick={() => onSelect(plan.id)}
       >
         <CardHeader>
           <CardTitle>{plan.name}</CardTitle>
           <CardDescription>
             <span className="text-xl font-bold">{plan.price} PLN</span> / miesiąc
           </CardDescription>
         </CardHeader>
         <CardContent>
           <RadioGroup value={selectedPlan} onValueChange={onSelect}>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value={plan.id} id={plan.id} />
               <Label htmlFor={plan.id}>Wybierz plan {plan.name}</Label>
             </div>
           </RadioGroup>
           <ul className="mt-4 space-y-2 text-sm">
             {plan.features.map((feature, index) => (
               <li key={index} className="flex items-center">
                 <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                 {feature}
               </li>
             ))}
           </ul>
         </CardContent>
         <CardFooter>
           <Button className="w-full" onClick={handlePromotion} disabled={isLoading}>
             {isLoading ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Przetwarzanie...
               </>
             ) : (
               "Wybierz ten plan"
             )}
           </Button>
         </CardFooter>
       </Card>
     ))}
   </div>
 )
}