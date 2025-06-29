import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { emailExamples } from "@/emails/examples"
import { query } from "@/lib/db"

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

    // Sprawdź, czy tabela email_logs istnieje
    try {
      // Próba wykonania prostego zapytania do tabeli
      await query("SELECT 1 FROM email_logs LIMIT 1")
    } catch (error) {
      await query(`
        CREATE TABLE IF NOT EXISTS email_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email_to VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          template_type VARCHAR(50) NOT NULL,
          status VARCHAR(20) NOT NULL,
          error_message TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    // Pobierz komponent emaila
    const emailComponent = emailExamples[emailType as keyof typeof emailExamples]

    // Wyślij testowy email
    const result = await emailService.sendEmail({
      to,
      subject: `[TEST] Email typu: ${emailType}`,
      emailComponent,
    })

    // Ręcznie zapisz log, jeśli wysyłanie się powiodło, ale log nie został zapisany
    if (result.success) {
      try {
        await query(
          "INSERT INTO email_logs (email_to, subject, template_type, status, created_at) VALUES (?, ?, ?, ?, NOW())",
          [to, `[TEST] Email typu: ${emailType}`, emailType, "sent"],
        )
      } catch (logError) {
        console.error("Błąd podczas ręcznego zapisywania logu:", logError)
      }

      return NextResponse.json({
        success: true,
        message: `Email typu ${emailType} został wysłany na adres ${to}`,
        messageId: result.messageId,
      })
    } else {
      // Ręcznie zapisz log błędu
      try {
        const errorMessage = result.error instanceof Error ? result.error.message : String(result.error)
        await query(
          "INSERT INTO email_logs (email_to, subject, template_type, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
          [to, `[TEST] Email typu: ${emailType}`, emailType, "error", errorMessage],
        )
      } catch (logError) {
        console.error("Błąd podczas ręcznego zapisywania logu błędu:", logError)
      }

      return NextResponse.json(
        {
          success: false,
          error: "Błąd podczas wysyłania emaila",
          details: result.error instanceof Error ? result.error.message : String(result.error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Błąd podczas przetwarzania żądania:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Błąd serwera",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
