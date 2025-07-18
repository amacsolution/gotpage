import type * as React from "react"
import { Header } from "./header"
import { Footer } from "./footer"

interface LayoutProps {
  children: React.ReactNode
  title?: string
  previewText?: string
  headerProps?: React.ComponentProps<typeof Header>
  footerProps?: React.ComponentProps<typeof Footer>
  userName: string | null
}

export const Layout: React.FC<LayoutProps> = ({ userName, children, title, previewText = "", headerProps, footerProps }) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{title}</title>
        {previewText && <meta name="description" content={previewText} />}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media only screen and (max-width: 600px) {
            .main-container {
              width: 100% !important;
            }
          }
        `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#F5F5F5", fontFamily: "Arial, sans-serif" }}>
        <div
          style={{
            display: "none",
            fontSize: "1px",
            color: "#FFFFFF",
            lineHeight: "1px",
            maxHeight: "0px",
            maxWidth: "0px",
            opacity: 0,
            overflow: "hidden",
          }}
        >
          {previewText}
        </div>
        <table
          className="main-container"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: "#F5F5F5", padding: "40px 0" }}
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: "rgb(225, 222, 231)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <tr>
                  <td style={{ padding: "32px" }}>
                    <Header {...headerProps} />
                    {children}
                    <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "24px", margin: "24px 0 0 0" }}>
                      Pozdrawiamy,
                      <br />
                      Zespół Gotpage
                    </p>
                    <Footer {...footerProps} />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}
