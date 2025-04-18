import type * as React from "react"

interface FooterProps {
  companyName?: string
  companyAddress?: string
  unsubscribeUrl?: string
}

export const Footer: React.FC<FooterProps> = ({
  companyName = "Nazwa Twojej Firmy",
  companyAddress = "ul. Przykładowa 123, 00-000 Warszawa",
  unsubscribeUrl = "#",
}) => {
  return (
    <table style={{ width: "100%", borderTop: "1px solid #E5E5E5", paddingTop: "16px", marginTop: "16px" }}>
      <tr>
        <td style={{ textAlign: "center", color: "#706F6F", fontSize: "12px", fontFamily: "Arial, sans-serif" }}>
          <p>
            © {new Date().getFullYear()} {companyName}. Wszelkie prawa zastrzeżone.
          </p>
          <p>{companyAddress}</p>
          <p>
            <a href={unsubscribeUrl} style={{ color: "#706F6F", textDecoration: "underline" }}>
              Wypisz się z newslettera
            </a>
          </p>
        </td>
      </tr>
    </table>
  )
}
