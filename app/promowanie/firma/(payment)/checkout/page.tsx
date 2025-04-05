"use client"

import CheckoutForm from "@/components/checkout-form"
import { Metadata } from "next"

export default function CheckoutPage() {
  return (
    <div className="py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Kasa</h1>
      <CheckoutForm />
    </div>
  )
}

