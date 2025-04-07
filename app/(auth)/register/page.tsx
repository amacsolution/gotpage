import type { Metadata } from "next"
import RegisterClientPage from "./RegisterClientPage"

export const metadata: Metadata = {
  title: "Rejestracja | Gotpage",
  description: "Utwórz nowe konto w serwisie Gotpage",
}

export default function RegisterPage() {
  return <RegisterClientPage />
}

