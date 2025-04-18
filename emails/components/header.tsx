import type * as React from "react"

interface HeaderProps {
  logoUrl?: string
  logoAlt?: string
  websiteUrl?: string
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl = "https://via.placeholder.com/150x50?text=Logo",
  logoAlt = "Logo firmy",
  websiteUrl = "https://twojadomena.pl",
}) => {
  return (
    <table style={{ width: "100%", marginBottom: "24px" }}>
      <tr>
        <td style={{ textAlign: "center" }}>
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
            <img src={logoUrl || "/placeholder.svg"} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} />
          </a>
        </td>
      </tr>
    </table>
  )
}
