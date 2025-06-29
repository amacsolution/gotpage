'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from './ui/use-toast'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CompanyCard } from './company-card'

const CompaniesFeedLimit = () => {
  const [companies, setFeaturedCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {

        // Fetch featured companies
        const res = await fetch("/api/companies?promoted=true&limit=4")
        if (res.ok) {
          const featuredData = await res.json()
          setFeaturedCompanies(featuredData.companies || [])
        } else {
          throw new Error("Nie udało się pobrać firm")
        }

      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych. Spróbuj ponownie później.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  if (isLoading && companies.length === 0) {
    // Loading state when no companies are available
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Polecane firmy</h2>
          <Link href="/firmy" className="text-primary hover:underline flex items-center">
            Zobacz wszystkie <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((company) => (
            <div key={company} className="bg-muted h-25 w-35 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }



  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Polecane firmy</h2>
        <Link href="/firmy" className="text-primary hover:underline flex items-center">
          Zobacz wszystkie <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  )
  //   )}
}

export default CompaniesFeedLimit