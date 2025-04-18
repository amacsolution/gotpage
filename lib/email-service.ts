import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import type { ReactElement } from "react"
import { emailConfig } from "@/emails/config"

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
      // Sprawdź, czy jesteśmy w trybie testowym
      if (emailConfig.testMode) {
        console.log(`[EMAIL TEST MODE] Email do: ${to}, temat: ${subject}`)
        to = emailConfig.testEmails
        subject = `[TEST] ${subject}`
      }

      // Renderuj komponent React do HTML
      const html = render(emailComponent)

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
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("Błąd podczas wysyłania emaila:", error)
      return { success: false, error }
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
