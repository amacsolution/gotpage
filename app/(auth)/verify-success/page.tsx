import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function VerifySuccessPage() {
  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Konto zweryfikowane!</CardTitle>
          <CardDescription>Twój adres email został pomyślnie zweryfikowany.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Dziękujemy za weryfikację adresu email. Możesz teraz w pełni korzystać z naszej platformy.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button>Zaloguj się</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
