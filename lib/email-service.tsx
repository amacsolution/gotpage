import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import type { ReactElement } from "react"
import { emailConfig } from "@/emails/config"
import { db } from "@/lib/db"

interface SendEmailOptions {
  to: string | string[]
  subject: string
  emailComponent: ReactElement
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig.smtp)
  }

  /**
   * Wysyła email z komponentem React
   */
  async sendEmail({
    to,
    subject,
    emailComponent,
    cc,
    bcc,
    attachments,
  }: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: any }> {
    try {
      // Pobierz typ szablonu z nazwy komponentu
      const templateType = emailComponent.type.name || "unknown"

      // Sprawdź, czy jesteśmy w trybie testowym
      if (emailConfig.testMode) {
        console.log(`[EMAIL TEST MODE] Email do: ${to}, temat: ${subject}`)
        to = emailConfig.testEmails
        subject = `[TEST] ${subject}`
      }

      // Renderuj komponent React do HTML - WAŻNA ZMIANA: dodajemy await
      const html = await render(emailComponent)

      // Wyślij email
      const info = await this.transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
      })

      console.log(`Email wysłany: ${info.messageId}`)

      // Zapisz log w bazie danych
      await this.logEmail({
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        templateType,
        status: "sent",
      })

      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("Błąd podczas wysyłania emaila:", error)

      // Zapisz log błędu w bazie danych
      await this.logEmail({
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        templateType: emailComponent.type.name || "unknown",
        status: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
      })

      return { success: false, error }
    }
  }

  /**
   * Zapisuje log wysłania emaila w bazie danych
   */
  private async logEmail({
    to,
    subject,
    templateType,
    status,
    errorMessage,
  }: {
    to: string
    subject: string
    templateType: string
    status: "sent" | "error"
    errorMessage?: string
  }) {
    try {
      console.log(`Zapisywanie logu emaila: ${to}, ${subject}, ${templateType}, ${status}`)

      // Sprawdź, czy tabela email_logs istnieje
      try {
        await db.query("SELECT 1 FROM email_logs LIMIT 1")
      } catch (error) {
        console.log("Tabela email_logs nie istnieje, tworzenie...")
        await db.query(`
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

      // Zapisz log do bazy danych
      const result = await db.query(
        "INSERT INTO email_logs (email_to, subject, template_type, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [to, subject, templateType, status, errorMessage || null],
      ) as { rows?: { insertId: number } }

      console.log("Log emaila zapisany pomyślnie, ID:", result.rows?.insertId)
    } catch (logError) {
      console.error("Błąd podczas zapisywania logu emaila:", logError)
    }
  }

  /**
   * Sprawdza połączenie z serwerem SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error("Błąd połączenia z serwerem SMTP:", error)
      return false
    }
  }
}

// Singleton instance
export const emailService = new EmailService()
