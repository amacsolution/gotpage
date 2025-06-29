import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import type { ReactElement } from "react"
import { emailConfig } from "@/emails/config"
import { query } from "@/lib/db"

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
      const templateType =
        typeof emailComponent.type === "string"
          ? emailComponent.type
          : emailComponent.type.name || "unknown"

      // Sprawdź, czy jesteśmy w trybie testowym
      if (emailConfig.testMode) {
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
        templateType: typeof emailComponent.type === "string"
          ? emailComponent.type
          : emailComponent.type.name || "unknown",
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

      // Zapisz log do bazy danych
      await query(
        "INSERT INTO email_logs (email_to, subject, template_type, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [to, subject, templateType, status, errorMessage || null],
      ) as { rows?: { insertId: number } }

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
