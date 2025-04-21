// Konfiguracja do wysyłania emaili
export const emailConfig = {
  // Dane SMTP
  smtp: {
    host: process.env.EMAIL_SMTP_HOST ,
    port: Number.parseInt(process.env.EMAIL_SMTP_PORT!),
    secure: process.env.EMAIL_SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASSWORD,
    },
  },

  // Dane nadawcy
  from: {
    name: "Gotpage",
    email: "no-reply@gotpage.pl",
  },

  // Adresy do testów
  testEmails: (process.env.EMAIL_TEST_ADDRESSES || "").split(","),

  // Czy wysyłać emaile w trybie testowym
  testMode: process.env.EMAIL_TEST_MODE === "true",

  // URL aplikacji (do linków w emailach)
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://gotpage.pl",

  // Dane firmy
  company: {
    name: "Gotpage",
    address:  "ul. Łódzka 66, 99-200 Poddebice",
    vatId: "PL1234567890",
    phone: "+48 606 908 927",
    email: "kontakt@gotpage.pl",
  },
}
