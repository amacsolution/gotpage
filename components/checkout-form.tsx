"use client"

import type React from "react"
import { useState } from "react"
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js"

interface EmailValidationResult {
  isValid: boolean
  message: string | null
}

const validateEmail = async (email: string, checkout: any): Promise<EmailValidationResult> => {
  const updateResult = await checkout.updateEmail(email)
  const isValid = updateResult.type !== "error"

  return { isValid, message: !isValid ? updateResult.error.message : null }
}

interface EmailInputProps {
  email: string
  setEmail: (email: string) => void
  error: string | null
  setError: (error: string | null) => void
}

const EmailInput = ({ email, setEmail, error, setError }: EmailInputProps) => {
  const checkout = useCheckout()

  const handleBlur = async () => {
    if (!email) {
      return
    }

    const { isValid, message } = await validateEmail(email, checkout)
    if (!isValid) {
      setError(message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setEmail(e.target.value)
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        Email
        <input
          id="email"
          type="text"
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="twoj@przyklad.pl"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </label>
      {error && (
        <div id="email-errors" className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

const CheckoutForm = () => {
  const checkout = useCheckout()

  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    const { isValid, message } = await validateEmail(email, checkout)
    if (!isValid) {
      setEmailError(message)
      setMessage(message)
      setIsLoading(false)
      return
    }

    const confirmResult = await checkout.confirm()

    if (confirmResult.type === "error") {
      setMessage(confirmResult.error.message)
    }

    // Ten punkt zostanie osiągnięty tylko wtedy, gdy wystąpi natychmiastowy błąd podczas
    // potwierdzania płatności. W przeciwnym razie klient zostanie przekierowany do
    // Twojego `return_url`. W przypadku niektórych metod płatności, takich jak iDEAL, klient
    // zostanie najpierw przekierowany na stronę pośrednią w celu autoryzacji płatności,
    // a następnie przekierowany do `return_url`.
    // Remove undefined error handling block

    setIsLoading(false)
  }

  return (
    <div className="max-w-md w-full mx-auto bg-background p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Formularz płatności</h2>

      <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
        <EmailInput email={email} setEmail={setEmail} error={emailError} setError={setEmailError} />

        <div className="pt-2">
          <h4 className="text-lg font-medium text-foreground mb-3">Płatność</h4>
          <div className="bg-background p-4 rounded-md">
            <PaymentElement id="payment-element" />
          </div>
        </div>

        <button
          disabled={isLoading}
          id="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-foreground font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span id="button-text" className="flex justify-center items-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-muted-foreground" id="spinner"></div>
            ) : (
              `Zapłać ${checkout.total?.total?.amount || ""} teraz`
            )}
          </span>
        </button>

        {/* Pokaż komunikaty o błędach lub sukcesie */}
        {message && (
          <div id="payment-message" className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default CheckoutForm

