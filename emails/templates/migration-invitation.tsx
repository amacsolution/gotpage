import type * as React from "react"
import { Layout } from "../components/layout"
import { Button } from "../components/button"

interface MigrationInvitationProps {
  userName?: string
  registrationUrl: string
  oldServiceName?: string
  newServiceName?: string
}

export const MigrationInvitation: React.FC<MigrationInvitationProps> = ({
  userName = "Drogi Użytkowniku",
  registrationUrl = "https://gotpage.pl/register",
  oldServiceName = "gotpage",
  newServiceName = "Nowy Serwis Ogłoszeniowy",
}) => {
  return (
    <Layout
      title="Zaproszenie do nowej odsłony Gotpage"
      previewText="Odkryj nowy, szybszy i lepszy serwis gotpage z ogłoszeniami, aktualnościami i katalogiem firm!"
      headerProps={{
        logoUrl: "https://gotpage.pl/logo-emails.png?text=Gotpage",
        logoAlt: "Logo gotpage",
      }}
    >
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
          Witaj, {userName}!
        </h1>
        <p style={{ fontSize: "18px", margin: "0", position: "relative", zIndex: "2" }}>
          Mamy dla Ciebie coś wyjątkowego!
        </p>
      </div>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
        Dziękujemy za korzystanie z serwisu <strong>{oldServiceName}</strong> przez te wszystkie lata. Doceniamy Twoje
        zaufanie i chcemy zaprosić Cię do naszego nowego, ulepszonego serwisu z jeszcze lepszymi funkcjami.
      </p>

      {/* Sekcja z funkcjami strony */}
      <div
        style={{
          background: "#F9FAFB",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "24px",
          border: "1px solid #E5E7EB",
        }}
      >
        <h2 style={{ color: "#111827", fontSize: "20px", fontWeight: "bold", margin: "0 0 16px 0" }}>
          Co znajdziesz na nowej stronie {oldServiceName}?
        </h2>

        {/* Ogłoszenia */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "16px",
            padding: "12px",
            background: "white",
            borderRadius: "6px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "rgba(124, 42, 232, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📢</span>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold", color: "#111827" }}>Ogłoszenia</h3>
            <p style={{ margin: "0", fontSize: "14px", color: "#4B5563" }}>
              Przeglądaj i dodawaj ogłoszenia w różnych kategoriach. Szybkie wyszukiwanie i intuicyjne filtry.
            </p>
          </div>
        </div>

        {/* Aktualności */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "16px",
            padding: "12px",
            background: "white",
            borderRadius: "6px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "rgba(229, 48, 138, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📰</span>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold", color: "#111827" }}>Aktualności</h3>
            <p style={{ margin: "0", fontSize: "14px", color: "#4B5563" }}>
              Bądź na bieżąco z najnowszymi informacjami i wydarzeniami. Zawsze aktualne wiadomości.
            </p>
          </div>
        </div>

        {/* Katalog firm */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "8px",
            padding: "12px",
            background: "white",
            borderRadius: "6px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              minWidth: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "rgba(59, 130, 246, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🏢</span>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold", color: "#111827" }}>
              Katalog firm
            </h3>
            <p style={{ margin: "0", fontSize: "14px", color: "#4B5563" }}>
              Znajdź lub dodaj swoją firmę do katalogu. Zwiększ widoczność i pozyskaj nowych klientów.
            </p>
          </div>
        </div>
      </div>

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
          Dlaczego warto przejść na nowy {oldServiceName}?
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
            <strong>Szybszy i bardziej responsywny</strong> - nowy silnik zapewnia błyskawiczne ładowanie stron
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Nowoczesny design</strong> - odświeżony interfejs dla lepszego doświadczenia użytkownika
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Zaawansowane funkcje</strong> - nowe narzędzia do zarządzania ogłoszeniami i profilami firm
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Lepsza widoczność</strong> - Twoje ogłoszenia i firma dotrą do większej liczby potencjalnych
            klientów
          </li>
          <li>
            <strong>Bezpieczeństwo</strong> - ulepszone zabezpieczenia dla Twoich danych
          </li>
        </ul>
      </div>

      {/* Sekcja promocyjna */}
      <div
        style={{
          textAlign: "center",
          margin: "32px 0",
          padding: "24px",
          background: "linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(229, 48, 138, 0.1) 100%)",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        {/* Elementy dekoracyjne */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            fontSize: "24px",
          }}
        >
          🎁
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            fontSize: "24px",
          }}
        >
          🚀
        </div>

        <p style={{ color: "#111827", fontSize: "18px", fontWeight: "bold", margin: "0 0 16px 0" }}>
          Specjalna oferta dla użytkowników {oldServiceName}!
        </p>
        <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "0 0 24px 0" }}>
          Zarejestruj się do końca miesiąca i otrzymaj <strong>1 miesiąc premium za darmo</strong>!
        </p>
      </div>

      {/* Przycisk CTA z efektem cienia */}
      <div style={{ textAlign: "center", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "100%",
            background: "rgba(124, 42, 232, 0.3)",
            filter: "blur(10px)",
            borderRadius: "8px",
            zIndex: "1",
          }}
        />
        <div style={{ position: "relative", zIndex: "2" }}>
          <Button href={registrationUrl} backgroundColor="#7c2ae8" width="80%">
            Przejdź do nowego serwisu teraz
          </Button>
        </div>
      </div>

      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          borderRadius: "8px",
          backgroundColor: "rgba(124, 42, 232, 0.1)",
          borderLeft: "4px solid #7c2ae8",
        }}
      >
        <p style={{ color: "#4B5563", fontSize: "14px", lineHeight: "20px", margin: "0" }}>
          <strong>Uwaga:</strong> Po rejestracji w nowym serwisie przy użyciu tego samego adresu e-mail, Twoje dane z 
          {oldServiceName} nie zostaną automatycznie przeniesione.
        </p>
      </div>

      <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
        Masz pytania? Skontaktuj się z nami pod adresem{" "}
        <a href="mailto:kontakt@gotpage.pl" style={{ color: "#7c2ae8", textDecoration: "none" }}>
          kontakt@gotpage.pl
        </a>
      </p>
    </Layout>
  )
}
