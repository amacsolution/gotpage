import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface AdExpirationProps {
  userName: string
  adTitle: string
  expirationDate: string
  renewUrl: string
}

export const AdExpiration: React.FC<AdExpirationProps> = ({
  userName = "Użytkowniku",
  adTitle = "Tytuł ogłoszenia",
  expirationDate = "15.05.2023",
  renewUrl = "https://twojadomena.pl/renew/123",
}) => {
  return (
    <Layout
      title="Twoje ogłoszenie wkrótce wygaśnie"
      previewText={`Ogłoszenie "${adTitle}" wygaśnie ${expirationDate}`}
    >
      <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Twoje ogłoszenie <strong>"{adTitle}"</strong> wygaśnie dnia <strong>{expirationDate}</strong>.
      </p>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Jeśli chcesz, aby Twoje ogłoszenie było nadal widoczne dla potencjalnych klientów, przedłuż jego ważność
        klikając w poniższy przycisk:
      </p>

      <Button href={renewUrl}>Przedłuż ogłoszenie</Button>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Po wygaśnięciu ogłoszenie zostanie automatycznie ukryte i nie będzie widoczne dla innych użytkowników.
      </p>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Pozdrawiamy,
        <br />
        Zespół Serwisu Ogłoszeniowego
      </p>
    </Layout>
  )
}
