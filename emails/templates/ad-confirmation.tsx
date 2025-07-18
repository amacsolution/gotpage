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
  const adUrl = `https://gotpage.pl/ogloszenia/${adId}`

  return (
    <Layout
      title="Twoje ogłoszenie zostało dodane"
      previewText={`Twoje ogłoszenie "${adTitle}" zostało pomyślnie dodane`}
      userName={userName}
    >
      {/* <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1> */}
      {/* Nagłówek z gradientem i elementami graficznymi */}
      <div
        style={{
          background: "linear-gradient(135deg, #e5308a 0%, #7c2ae8 100%)",
          borderRadius: "8px",
          padding: "32px 24px",
          marginBottom: "32px",
          textAlign: "center",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Elementy dekoracyjne w tle */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "5%",
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30%",
            left: "7%",
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 16px 0", position: "relative", zIndex: "2" }}>
          Cześć, {userName}!
        </h1>
        <p style={{ fontSize: "18px", margin: "0", position: "relative", zIndex: "2" }}>
          Twoje ogłoszenie już widnieje na naszej stronie!
        </p>
      </div>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Twoje ogłoszenie <strong>"{adTitle}"</strong> zostało pomyślnie dodane do naszego serwisu.
      </p>

      <div
        style={{
          backgroundColor: "#ffd7e1",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          borderLeft: "4px solid #f4436f",
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
