import type * as React from "react"

interface ButtonProps {
  href: string
  children: React.ReactNode
  color?: string
  backgroundColor?: string
  width?: string
}

export const Button: React.FC<ButtonProps> = ({
  href,
  children,
  color = "#FFFFFF",
  backgroundColor = "#3B82F6",
  width = "auto",
}) => {
  return (
    <table style={{ width: "100%", marginTop: "16px", marginBottom: "16px" }}>
      <tr>
        <td style={{ textAlign: "center" }}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor,
              color,
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
              width,
              textAlign: "center",
              fontSize: "16px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  )
}
