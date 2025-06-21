import { type NextRequest, NextResponse } from "next/server"
import { db, query } from "@/lib/db"

// Hasło administratora z zmiennych środowiskowych
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Sprawdź hasło administratora
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: "Nieprawidłowe hasło" }, { status: 401 })
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

    // Spróbuj zapisać testowy log
    const result = await query(
      "INSERT INTO email_logs (email_to, subject, template_type, status, created_at) VALUES (?, ?, ?, ?, NOW())",
      ["test@example.com", "Test zapisu do tabeli", "test", "sent"],
    ) as {rows?: { insertId: number }}

    return NextResponse.json({
      success: true,
      message: "Testowy log został zapisany pomyślnie",
      insertId: result.rows?.insertId,
    })
  } catch (error) {
    console.error("Błąd podczas testowania zapisu logu:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Błąd podczas testowania zapisu logu",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
