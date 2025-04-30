// Konfiguracja do wysyłania emaili
export const emailConfig = {
  // Dane SMTP
  smtp: {
    host: "s11.cyber-folks.pl",
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
    email: "kontakt@gotpage.pl",
  },

  // Adresy do testów
  testEmails: (process.env.EMAIL_TEST_ADDRESSES || "").split(","),

  // Czy wysyłać emaile w trybie testowym
  testMode: process.env.EMAIL_TEST_MODE === "true",

  // URL aplikacji (do linków w emailach)
  appUrl: "https://gotpage.pl",

  // Dane firmy
  company: {
    name: "Gotpage",
    address:  "ul. Łódzka 66, 99-200 Poddebice",
    vatId: "PL1234567890",
    phone: "+48 606 908 927",
    email: "kontakt@gotpage.pl",
  },
}
