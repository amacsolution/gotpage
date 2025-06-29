import React from "react"

interface FooterProps {
  companyName?: string
  companyAddress?: string
  unsubscribeUrl?: string
  appUrl?: string
}

export const Footer: React.FC<FooterProps> = ({
  companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Gotpage",
  companyAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "ul. Łódzka 66, 99-200 Poddebice",
  unsubscribeUrl = "#",
  appUrl = "https://gotpage.pl",
}) => {
  // Linki do stron prawnych i informacyjnych
  const legalLinks = [
    { name: "O serwisie", url: `${appUrl}/o-serwisie` },
    { name: "Jak to działa", url: `${appUrl}/jak-to-dziala` },
    { name: "Regulamin", url: `${appUrl}/regulamin` },
    { name: "Polityka prywatności", url: `${appUrl}/polityka-prywatnosci` },
    { name: "Polityka cookies", url: `${appUrl}/polityka-cookies` },
    { name: "RODO", url: `${appUrl}/rodo` },
    { name: "Bezpieczeństwo", url: `${appUrl}/bezpieczenstwo` },
    { name: "Pomoc", url: `${appUrl}/pomoc` },
  ]

  return (
    <table style={{ width: "100%", borderTop: "1px solid #E5E5E5", paddingTop: "16px", marginTop: "16px" }}>
      <tr>
        <td style={{ textAlign: "center", color: "#706F6F", fontSize: "12px", fontFamily: "Arial, sans-serif" }}>
          <p>
            © {new Date().getFullYear()} {companyName}. Wszelkie prawa zastrzeżone.
          </p>
          <p>{companyAddress}</p>

          {/* Linki do stron prawnych i informacyjnych */}
          <table style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
            <tr>
              <td style={{ textAlign: "center", paddingBottom: "12px" }}>
                {legalLinks.map((link, index) => (
                  <React.Fragment key={link.name}>
                    <a
                      href={link.url}
                      style={{
                        color: "#706F6F",
                        textDecoration: "underline",
                        fontSize: "11px",
                        padding: "2px 6px",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.name}
                    </a>
                    {index < legalLinks.length - 1 && <span style={{ color: "#706F6F", fontSize: "11px" }}>|</span>}
                  </React.Fragment>
                ))}
              </td>
            </tr>
          </table>

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
