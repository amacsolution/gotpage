import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface PasswordResetProps {
  userName: string
  resetUrl: string
  expirationTime?: string
}

export const PasswordReset: React.FC<PasswordResetProps> = ({
  userName = "Użytkowniku",
  resetUrl = "https://gotpage.pl/reset-password",
  expirationTime = "1 godzinę",
}) => {
  return (
    <Layout title="Resetowanie hasła" previewText="Instrukcje resetowania hasła do Twojego konta" userName={userName}>
      <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta. Jeśli to Ty, kliknij w poniższy przycisk, aby ustawić
        nowe hasło:
      </p>

      <Button href={resetUrl} backgroundColor="#f4436f" color="#ffffff">Resetuj hasło</Button>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Link jest ważny przez {expirationTime} od momentu wysłania tej wiadomości.
      </p>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Jeśli nie prosiłeś/aś o reset hasła, zignoruj tę wiadomość lub skontaktuj się z naszym zespołem wsparcia.
      </p>

    </Layout>
  )
}
