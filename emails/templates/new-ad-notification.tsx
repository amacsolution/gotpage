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
  adUrl = `https://gotpage/ogloszenia/1`,
}) => {
  return (
    <Layout userName={userName} title="Nowe ogłoszenie w Twojej kategorii" previewText={`Nowe ogłoszenie: ${adTitle}`}>
      {/* <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        W Twojej obserwowanej kategorii pojawiło się nowe ogłoszenie, które może Cię zainteresować:
      </p> 
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
        {/* Elementy dekoracyjne w tle
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
          W Twojej obserwowanej kategorii pojawiło się nowe ogłoszenie, które może Cię zainteresować:
        </p>
      </div> */}

      <div style={{ border: "1px solid #fff", borderRadius: "8px", padding: "16px", marginBottom: "24px", boxShadow: "0 0 4px 0px #ffffff" }}>
        <h2 style={{ color: "#333333", fontSize: "20px", fontWeight: "bold", margin: "0 0 16px 0" }}>{adTitle}</h2>

        {adImageUrl && (
          <img
            src={adImageUrl}
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
