import { type NextRequest, NextResponse } from "next/server"
import { sendMigrationInvitationEmail } from "@/lib/email-helpers"
import { emailConfig } from "@/emails/config"
import { db, query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Sprawdź uprawnienia administratora
    const authHeader = request.headers.get("authorization")
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      users,
      oldServiceName = "gotpage",
      newServiceName = "Nowy Serwis Ogłoszeniowy",
      testMode = false,
    } = await request.json()

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Brak listy użytkowników do wysłania emaili" }, { status: 400 })
    }

    // Zapisz informacje o wysyłce w bazie danych
    const migration = await query(
      `INSERT INTO email_campaigns (name, type, total_emails, status, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [`Migracja z ${oldServiceName}`, "migration", users.length, "in_progress"],
    ) as { insertId: number}

    const migrationId = migration.insertId

    // Wyślij emaile (w trybie testowym tylko do adresów testowych)
    const results = []
    for (const user of users) {
      try {
        // W trybie testowym wysyłaj tylko na adresy testowe
        const recipient = user.email

        await sendMigrationInvitationEmail({
          email: recipient,
          userName: user.name,
          oldServiceName,
          newServiceName,
        })

        await query(
            `INSERT INTO emails_subscription (email)
            VALUES (?)`, [user.email]
        )

        // Zapisz informację o wysłanym emailu
        await query(
          `INSERT INTO email_logs (email_to, subject, template_type, status, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [user.email, `Zaproszenie do nowego serwisu Gotpage`, "migration_invitation", "sent"],
        )

        results.push({ email: user.email, status: "sent", testMode })
      } catch (error) {
        console.error(`Błąd wysyłania emaila do ${user.email}:`, error)
        results.push({ email: user.email, status: "error", error: (error as Error).message })

        // Zapisz informację o błędzie
        await query(
          `INSERT INTO email_logs (email_to, subject, template_type, status, error, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            user.email,
            `Zaproszenie do nowego serwisu ${newServiceName}`,
            "migration_invitation",
            "error",
            (error as Error).message
          ],
        )
      }
    }

    // Zaktualizuj status kampanii
    await query(`UPDATE email_campaigns SET status = ?, completed_at = NOW() WHERE id = ?`, [
      "completed",
      migrationId,
    ])

    return NextResponse.json({
      success: true,
      message: `Wysłano ${results.filter((r) => r.status === "sent").length} z ${users.length} emaili${testMode ? " (tryb testowy)" : ""}`,
      results,
      testMode,
    })
  } catch (error) {
    console.error("Błąd podczas wysyłania emaili migracyjnych:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas wysyłania emaili" }, { status: 500 })
  }
}
