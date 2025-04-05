'use client'

import type React from "react"
import { loadStripe } from "@stripe/stripe-js"
import { CheckoutProvider } from "@stripe/react-stripe-js"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51R9mzkQDAXdhlL91j5TGcxcw5JhRISJhdDkW6fPq7Lb444zvhjE24mR2qnVQD11ixMiju4bpM49zH48NayhtgC1V0025MNZOpU",
)

const fetchClientSecret = () =>
  fetch("/api/create-checkout-session", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => data.clientSecret)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const appearance = {
    theme: "stripe" as "flat" | "stripe" | "night",
  }

  const options = {
    fetchClientSecret,
    elementsOptions: { appearance },
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <CheckoutProvider stripe={stripePromise} options={options}>
          <div className="App">{children}</div>
        </CheckoutProvider>
      </body>
    </html>
  )
}

