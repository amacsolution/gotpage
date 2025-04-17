import type { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Informacje | Gotpage",
  description: "Informacje o serwisie Gotpage - Twoje miejsce na ogłoszenia i promocję firmy",
  keywords: "pomoc, informacje, jak to działa, bezpieczeństwo, o serwisie, gotpage",
}

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageLayout>
      <div className="bg-gradient-to-b from-primary/10 to-background py-8">
        <div className="container">
          {children}
        </div>
      </div>
    </PageLayout>
  )
}
