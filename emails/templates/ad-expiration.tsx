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
  userName = "Antoni Maciejowski",
  adTitle = "Tytuł ogłoszenia",
  expirationDate = "15.05.2023",
  renewUrl = "https://gotpage.pl/renew/123",
}) => {
  return (
    <Layout
      title="Twoje ogłoszenie wkrótce wygaśnie"
      previewText={`Ogłoszenie "${adTitle}" wygaśnie ${expirationDate}`}
      userName={userName}
    >
      {/* <h1 style={{ color: "#333333", fontSize: "24px", fontWeight: "bold", margin: "0 0 24px 0" }}>
        Cześć, {userName}!
      </h1> */}

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


      <Button href="https://gotpage.pl/promowanie/ogloszenia" >Promuj ogłoszenie</Button>

      {/* Sekcja z korzyściami */}
      <div
        style={{
          background: "linear-gradient(to right, rgba(124, 42, 232, 0.05), rgba(229, 48, 138, 0.05))",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "24px",
          border: "1px solid #E5E7EB",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Elementy dekoracyjne */}
        <div
          style={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(124, 42, 232, 0.1)",
            zIndex: "1",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "-20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(229, 48, 138, 0.1)",
            zIndex: "1",
          }}
        />

        <h2
          style={{
            color: "#111827",
            fontSize: "20px",
            fontWeight: "bold",
            margin: "0 0 16px 0",
            position: "relative",
            zIndex: "2",
          }}
        >
          Dlaczego warto promować swoje ogłoszenie?
        </h2>
        <ul
          style={{
            color: "#4B5563",
            fontSize: "16px",
            lineHeight: "24px",
            margin: "0 0 16px 0",
            paddingLeft: "20px",
            position: "relative",
            zIndex: "2",
          }}
        >
          <li style={{ marginBottom: "8px" }}>
            <strong>Daj się zobaczyć</strong> - dzięki promowaniu Twoje ogłoszenie dotrze do większej liczby
            potencjalnych klientów
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Udostępnianie</strong> - twoje ogłoszenie będzie łatwiejsze do znalezienia i udostępnienia
            przez innych użytkowników
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Zaawansowane funkcje</strong> - otrzymasz dostęp do dodatkowych narzędzi i funkcji, które
            pomogą Ci lepiej zarządzać swoimi ogłoszeniami
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Lepsza widoczność</strong> - Twoje ogłoszenia będą wyswietlane w google i innych
            wyszukiwarkach, co zwiększy ich szanse na znalezienie przez potencjalnych klientów
          </li>
        </ul>
      </div>
    </Layout>
  )
}
