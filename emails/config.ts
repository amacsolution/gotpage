// Konfiguracja do wysyłania emaili
export const emailConfig = {
  // Dane SMTP
  smtp: {
    host: process.env.EMAIL_SMTP_HOST || "",
    port: Number.parseInt(process.env.EMAIL_SMTP_PORT || "587"),
    secure: process.env.EMAIL_SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SMTP_USER || "",
      pass: process.env.EMAIL_SMTP_PASSWORD || "",
    },
  },

  // Dane nadawcy
  from: {
    name: process.env.EMAIL_FROM_NAME || "Serwis Ogłoszeniowy",
    email: process.env.EMAIL_FROM_ADDRESS || "noreply@twojadomena.pl",
  },

  // Adresy do testów
  testEmails: (process.env.EMAIL_TEST_ADDRESSES || "").split(","),

  // Czy wysyłać emaile w trybie testowym
  testMode: process.env.EMAIL_TEST_MODE === "true",

  // URL aplikacji (do linków w emailach)
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://twojadomena.pl",

  // Dane firmy
  company: {
    name: process.env.COMPANY_NAME || "Nazwa Twojej Firmy",
    address: process.env.COMPANY_ADDRESS || "ul. Przykładowa 123, 00-000 Warszawa",
    vatId: process.env.COMPANY_VAT_ID || "PL1234567890",
    phone: process.env.COMPANY_PHONE || "+48 123 456 789",
    email: process.env.COMPANY_EMAIL || "kontakt@twojadomena.pl",
  },
}
