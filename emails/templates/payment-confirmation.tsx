import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface PaymentConfirmationProps {
  userName: string
  orderNumber: string
  paymentDate: string
  amount: string
  currency?: string
  packageName: string
  packageDuration: string
  invoiceUrl?: string
  accountUrl: string
  vatNumber?: string
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  userName = "Użytkowniku",
  orderNumber = "ORD-12345",
  paymentDate = "01.05.2023",
  amount = "49.99",
  currency = "PLN",
  packageName = "Premium",
  packageDuration = "30 dni",
  invoiceUrl,
  accountUrl = "https://twojadomena.pl/konto",
  vatNumber,
}) => {
  return (
    <Layout
      title="Dziękujemy za płatność"
      previewText={`Potwierdzenie płatności za pakiet ${packageName} - ${orderNumber}`}
    >
      <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Dziękujemy za płatność, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Twoja płatność została zrealizowana pomyślnie. Poniżej znajdziesz szczegóły transakcji:
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          border: "1px solid #E5E5E5",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <tr style={{ backgroundColor: "#F9FAFB" }}>
          <td
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #E5E5E5",
              color: "#6B7280",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Numer zamówienia:
          </td>
          <td
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #E5E5E5",
              color: "#111827",
              fontSize: "14px",
              textAlign: "right",
            }}
          >
            {orderNumber}
          </td>
        </tr>
        <tr>
          <td
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #E5E5E5",
              color: "#6B7280",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Data płatności:
          </td>
          <td
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #E5E5E5",
              color: "#111827",
              fontSize: "14px",
              textAlign: "right",
            }}
          >
            {paymentDate}
          </td>
        </tr>
        <tr style={{ backgroundColor: "#F9FAFB" }}>
          <td
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #E5E5E5",
              color: "#6B7280",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Pakiet:
          </td>
          <td
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #E5E5E5",
              color: "#111827",
              fontSize: "14px",
              textAlign: "right",
            }}
          >
            {packageName} ({packageDuration})
          </td>
        </tr>
        <tr>
          <td
            style={{
              padding: "12px 16px",
              color: "#6B7280",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Kwota:
          </td>
          <td
            style={{
              padding: "12px 16px",
              color: "#111827",
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            {amount} {currency}
          </td>
        </tr>
        {vatNumber && (
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <td
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #E5E5E5",
                color: "#6B7280",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              NIP:
            </td>
            <td
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #E5E5E5",
                color: "#111827",
                fontSize: "14px",
                textAlign: "right",
              }}
            >
              {vatNumber}
            </td>
          </tr>
        )}
      </table>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Twój pakiet <strong>{packageName}</strong> został aktywowany i będzie ważny przez{" "}
        <strong>{packageDuration}</strong>. Dzięki niemu Twoje ogłoszenia będą wyświetlane na wyższych pozycjach i dotrą
        do większej liczby potencjalnych klientów.
      </p>

      {invoiceUrl && (
        <Button href={invoiceUrl} backgroundColor="#10B981">
          Pobierz fakturę
        </Button>
      )}

      <Button href={accountUrl} backgroundColor="#f4436f">
        Przejdź do konta
      </Button>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        W razie jakichkolwiek pytań dotyczących płatności lub pakietu, skontaktuj się z naszym działem obsługi klienta.
      </p>

    </Layout>
  )
}
