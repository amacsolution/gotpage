import type * as React from "react"

interface HeaderProps {
  logoUrl?: string
  logoAlt?: string
  websiteUrl?: string
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl = "https://gotpage.pl/logo.png?text=Gotpage",
  logoAlt = "Logo firmy",
  websiteUrl = "https://gotpage.pl",
}) => {
  return (
    <table style={{ width: "100%", marginBottom: "24px" }}>
      <tr>
        <td style={{ textAlign: "center" }}>
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
            <img src={logoUrl} alt={logoAlt} style={{ maxWidth: "100px", height: "auto" }} />
          </a>
        </td>
      </tr>
    </table>
  )
}
