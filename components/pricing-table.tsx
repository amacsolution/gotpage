"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge, CheckCircle2, Loader2 } from 'lucide-react'
import { CheckCircle } from 'lucide-react'
import { useRouter } from "next/navigation"

interface PricingTableProps {
 plans: {
   id: string
   name: string
   price: number
   features: string[]
   popular?: boolean
   color: string
    icon: React.ReactNode
    duration: string
 }[]
 onSelect: (plan: string) => void
 selectedPlan: string
 isLoading: boolean
 handlePromotion: () => void
}



export function PricingTable({ plans, selectedPlan}: PricingTableProps) {
const [selectedPlanId, setSelectedPlanId] = useState<string>("business")
const router = useRouter()
const { toast } = useToast()

const handlePromote = () => {
  toast({
    title: "Przekierowanie do płatności",
    description: "Za chwilę zostaniesz przekierowany do systemu płatności",
  })
  window.location.href = `/checkout?plan=${selectedPlan}&type=company`
  router.push(`/checkout?plan=${selectedPlan}&type=company`)
}

 return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {plans.map((plan) => (
    <div key={plan.id} className="relative cursor-pointer" onClick={() => setSelectedPlanId(plan.id)}>
      <Card
        className={`h-full border-2 transition-all duration-300 ${selectedPlan === plan.id ? "border-primary shadow-lg scale-105 z-10" : "border-muted hover:border-primary/50"}`} 
      >
        {plan.popular && (
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <Badge className="bg-primary">Najpopularniejszy</Badge>
          </div>
        )}
        <CardHeader className={`${plan.color} text-white rounded-t-lg`}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            {plan.icon}
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{plan.price} PLN</span>
            <span className="text-white/80 ml-1">/ {plan.duration}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className={`w-full ${selectedPlan === plan.id ? "bg-primary" : "bg-muted-foreground/80"}`}
            onClick={handlePromote}
          >
            {selectedPlan === plan.id ? "Wybierz ten pakiet" : "Wybierz"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  ))}
</div>
 )
}