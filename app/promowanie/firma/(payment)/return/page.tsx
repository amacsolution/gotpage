"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ReturnPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    // W Next.js musimy używać obiektu window tylko po zamontowaniu komponentu
    if (typeof window !== "undefined") {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const sessionId = urlParams.get("session_id")

      if (sessionId) {
        fetch(`/api/session-status?session_id=${sessionId}`)
          .then((res) => res.json())
          .then((data) => {
            setStatus(data.status)
            setCustomerEmail(data.customer_email)
          })
      }
    }
  }, [])

  if (status === "open") {
    router.push("/checkout")
    return null
  }

  if (status === "complete") {
    return (
      <section id="success" className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">Dziękujemy za zakup!</h2>
        <p className="text-gray-700 mb-4">
          Doceniamy Twój biznes! Email z potwierdzeniem zostanie wysłany na adres {customerEmail}.
        </p>
        <p className="text-gray-700">
          Jeśli masz jakiekolwiek pytania, napisz do nas:{" "}
          <a href="mailto:kontakt@gotpage.pl" className="text-emerald-600 hover:underline">
            kontakt@gotpage.pl
          </a>
          .
        </p>
      </section>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  )
}

