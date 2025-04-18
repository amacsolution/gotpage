import type { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { ContactForm } from "@/components/contact-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Kontakt - Gotpage",
  description: "Skontaktuj się z nami. Odpowiemy na wszystkie Twoje pytania.",
}

export default function ContactPage() {
  return (
    <PageLayout>
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Kontakt</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Masz pytania? Skontaktuj się z nami. Odpowiemy najszybciej jak to możliwe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Telefon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">+48 606 908 927</p>
                <p className="text-sm text-muted-foreground mt-1">Pon-Pt: 9:00 - 17:00</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">kontakt@gotpage.pl</p>
                <p className="text-sm text-muted-foreground mt-1">Odpowiadamy w ciągu 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Adres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">ul. Łódzka 66</p>
                <p className="text-sm text-muted-foreground mt-1">99-200 Poddebice</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formularz kontaktowy</CardTitle>
              <CardDescription>Wypełnij poniższy formularz, aby się z nami skontaktować.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

