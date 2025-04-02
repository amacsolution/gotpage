import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Konfiguracja transportera nodemailer
// W środowisku produkcyjnym użyj rzeczywistych danych SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "s11.cyber-folks.pl",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "no-reply@gotpage.pl",
    pass: process.env.SMTP_PASSWORD || "UcHxI5R-8%RH-jv!",
  },
})

export async function POST(request: NextRequest) {
  try {
    // Pobierz dane z formularza
    const formData = await request.formData()
    const name = formData.get("name")?.toString()
    const email = formData.get("email")?.toString()
    const subject = formData.get("subject")?.toString()
    const message = formData.get("message")?.toString()
    const phone = formData.get("phone")?.toString() || "Nie podano"

    // Walidacja danych
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Wymagane pola: imię, email i wiadomość",
        },
        { status: 400 },
      )
    }

    // Walidacja adresu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Podany adres email jest nieprawidłowy",
        },
        { status: 400 },
      )
    }

    // Przygotowanie wiadomości do administratora
    const adminMailOptions = {
      from: `"Gotpage" <${process.env.SMTP_USER || "no-reply@gotpage.pl"}>`,
      to: process.env.ADMIN_EMAIL || "no-reply@gotpage.pl",
      subject: `Nowa wiadomość: ${subject || "Formularz kontaktowy"}`,
      html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię i nazwisko:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Temat:</strong> ${subject || "Nie podano"}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    }

    // Przygotowanie wiadomości potwierdzającej dla użytkownika
    const userMailOptions = {
      from: `"GotPage" <${process.env.SMTP_USER || "no-reply@gotpage.pl"}>`,
      to: email,
      subject: "Potwierdzenie otrzymania wiadomości - GotPage",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Dziękujemy za kontakt!</h2>
          
          <p>Witaj ${name},</p>
          
          <p>Dziękujemy za skontaktowanie się z nami poprzez formularz na stronie GotPage. Otrzymaliśmy Twoją wiadomość i postaramy się odpowiedzieć najszybciej jak to możliwe.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Temat:</strong> ${subject || "Formularz kontaktowy"}</p>
            <p><strong>Treść wiadomości:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          
          <p>Jeśli masz jakiekolwiek pytania, możesz odpowiedzieć bezpośrednio na tego e-maila.</p>
          
          <p>Z poważaniem,<br>Zespół GotPage</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 12px;">
            <p>© ${new Date().getFullYear()} GotPage. Wszelkie prawa zastrzeżone.</p>
            <p>Ta wiadomość została wygenerowana automatycznie, prosimy na nią nie odpowiadać.</p>
          </div>
        </div>
      `,
    }

    // Wysłanie wiadomości do administratora
    try {
      await transporter.sendMail(adminMailOptions)
      console.log("Wiadomość do administratora wysłana pomyślnie")
    } catch (error) {
      console.error("Błąd podczas wysyłania wiadomości do administratora:", error)
      // Kontynuujemy, aby wysłać potwierdzenie do użytkownika
    }

    // Wysłanie potwierdzenia do użytkownika
    try {
      await transporter.sendMail(userMailOptions)
      console.log("Potwierdzenie wysłane do użytkownika")
    } catch (error) {
      console.error("Błąd podczas wysyłania potwierdzenia do użytkownika:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Wiadomość została odebrana, ale wystąpił problem z wysłaniem potwierdzenia",
        },
        { status: 500 },
      )
    }

    // Zapisanie wiadomości do bazy danych (opcjonalnie)
    // W rzeczywistej aplikacji tutaj można dodać kod zapisujący wiadomość do bazy danych

    // Zwróć sukces
    return NextResponse.json({
      success: true,
      message: "Wiadomość została wysłana. Dziękujemy za kontakt! Potwierdzenie zostało wysłane na Twój adres email.",
    })
  } catch (error) {
    console.error("Błąd podczas przetwarzania formularza kontaktowego:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Wystąpił błąd podczas przetwarzania formularza. Spróbuj ponownie później.",
      },
      { status: 500 },
    )
  }
}

