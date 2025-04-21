import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface NewAdNotificationProps {
  userName: string
  adTitle: string
  adDescription: string
  adImageUrl?: string
  adUrl: string
}

export const NewAdNotification: React.FC<NewAdNotificationProps> = ({
  userName = "Użytkowniku",
  adTitle = "Tytuł ogłoszenia",
  adDescription = "Opis ogłoszenia...",
  adImageUrl,
  adUrl = "https://twojadomena.pl/ogloszenia/123",
}) => {
  return (
    <Layout title="Nowe ogłoszenie w Twojej kategorii" previewText={`Nowe ogłoszenie: ${adTitle}`}>
      <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        W Twojej obserwowanej kategorii pojawiło się nowe ogłoszenie, które może Cię zainteresować:
      </p>

      <div style={{ border: "1px solid #E5E5E5", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
        <h2 style={{ color: "#333333", fontSize: "20px", fontWeight: "bold", margin: "0 0 16px 0" }}>{adTitle}</h2>

        {adImageUrl && (
          <img
            src={adImageUrl || "/placeholder.svg"}
            alt={adTitle}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "200px",
              objectFit: "cover",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          />
        )}

        <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 16px 0" }}>
          {adDescription.length > 150 ? `${adDescription.substring(0, 150)}...` : adDescription}
        </p>
      </div>

      <Button href={adUrl}>Zobacz ogłoszenie</Button>

    </Layout>
  )
}
