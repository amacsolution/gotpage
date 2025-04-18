import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { emailExamples } from "@/emails/examples"

// Hasło administratora z zmiennych środowiskowych
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request: NextRequest) {
  try {
    const { password, emailType, to } = await request.json()

    // Sprawdź hasło administratora
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: "Nieprawidłowe hasło" }, { status: 401 })
    }

    // Sprawdź, czy podano typ emaila
    if (!emailType || !emailExamples[emailType as keyof typeof emailExamples]) {
      return NextResponse.json(
        {
          success: false,
          error: "Nieprawidłowy typ emaila",
          availableTypes: Object.keys(emailExamples),
        },
        { status: 400 },
      )
    }

    // Sprawdź, czy podano adres email
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json({ success: false, error: "Nieprawidłowy adres email" }, { status: 400 })
    }

    // Pobierz komponent emaila
    const emailComponent = emailExamples[emailType as keyof typeof emailExamples]

    // Wyślij testowy email
    const result = await emailService.sendEmail({
      to,
      subject: `[TEST] Email typu: ${emailType}`,
      emailComponent,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email typu ${emailType} został wysłany na adres ${to}`,
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Błąd podczas wysyłania emaila", details: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Błąd podczas przetwarzania żądania:", error)
    return NextResponse.json({ success: false, error: "Błąd serwera" }, { status: 500 })
  }
}
