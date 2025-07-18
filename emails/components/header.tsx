import type * as React from "react"

interface HeaderProps {
  logoUrl?: string
  logoAlt?: string
  websiteUrl?: string
  userName?: string
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl = "https://gotpage.pl/logo-emails.png?text=Gotpage",
  logoAlt = "Logo firmy",
  websiteUrl = "https://gotpage.pl",
  userName
}) => {
  return (

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
      <table style={{ width: "100%", marginBottom: "24px" }}>
        <tr style={{
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          borderRadius: "5px"
        }}
        >
          <td style={{ textAlign: "center" }}>
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
              <img src={logoUrl} alt={logoAlt} style={{ width: "auto", maxHeight: "100px" }} />
            </a>
          </td>
        </tr>
      </table>
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

      {userName && (<h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 16px 0", position: "relative", zIndex: "2" }}>
        Cześć, {userName}!
      </h1>)}
      {/* <p style={{ fontSize: "18px", margin: "0", position: "relative", zIndex: "2" }}>
        W Twojej obserwowanej kategorii pojawiło się nowe ogłoszenie, które może Cię zainteresować:
      </p> */}
    </div>

  )
}
