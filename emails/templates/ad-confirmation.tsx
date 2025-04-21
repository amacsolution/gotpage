import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface AdConfirmationProps {
  userName: string
  adTitle: string
  adId: string
  isPromoted: boolean
  promotionUrl?: string
}

export const AdConfirmation: React.FC<AdConfirmationProps> = ({
  userName = "Użytkowniku",
  adTitle = "Tytuł ogłoszenia",
  adId = "123",
  isPromoted = false,
  promotionUrl,
}) => {
  const adUrl = `/ogloszenia/${adId}`

  return (
    <Layout
      title="Twoje ogłoszenie zostało dodane"
      previewText={`Twoje ogłoszenie "${adTitle}" zostało pomyślnie dodane`}
    >
      <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Twoje ogłoszenie <strong>"{adTitle}"</strong> zostało pomyślnie dodane do naszego serwisu.
      </p>

      <div
        style={{
          backgroundColor: "#F0F9FF",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          borderLeft: "4px solid #3B82F6",
        }}
      >
        <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0" }}>
          <strong>Status ogłoszenia:</strong> Aktywne
          <br />
          <strong>Promocja:</strong> {isPromoted ? "Aktywna" : "Brak"}
        </p>
      </div>

      <Button href={adUrl}>Zobacz swoje ogłoszenie</Button>

      {!isPromoted && promotionUrl && (
        <>
          <p
            style={{
              color: "#4B5563",
              fontSize: "16px",
              lineHeight: "24px",
              margin: "24px 0 16px 0",
              fontWeight: "bold",
            }}
          >
            Zwiększ zasięg swojego ogłoszenia!
          </p>

          <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 16px 0" }}>
            Promowane ogłoszenia otrzymują nawet 5x więcej wyświetleń i kontaktów. Wybierz pakiet promocyjny i zwiększ
            swoje szanse na szybką sprzedaż.
          </p>

          <Button href={promotionUrl} backgroundColor="#FF4081">
            Promuj ogłoszenie
          </Button>
        </>
      )}

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Dziękujemy za korzystanie z naszego serwisu!
      </p>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Pozdrawiamy,
        <br />
        Zespół Serwisu Ogłoszeniowego
      </p>
    </Layout>
  )
}
