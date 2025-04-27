import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface WelcomeEmailProps {
  userName: string
  verificationUrl: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName = "Nowy Użytkowniku",
  verificationUrl = "https://gotpage.pl/verify",
}) => {
  return (
    <Layout
      title="Witamy w serwisie ogłoszeniowym"
      previewText="Dziękujemy za rejestrację w naszym serwisie ogłoszeniowym!"
    >
      <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Witaj, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Dziękujemy za rejestrację w naszym serwisie ogłoszeniowym. Cieszymy się, że dołączyłeś/aś do naszej
        społeczności!
      </p>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Aby w pełni korzystać z naszego serwisu, potwierdź swój adres email klikając w poniższy przycisk:
      </p>

      <Button href={verificationUrl}>Potwierdź adres email</Button>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Jeśli nie zakładałeś/aś konta w naszym serwisie, zignoruj tę wiadomość.
      </p>
    </Layout>
  )
}
