import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Walidacja NIP
export function validateNIP(nip: string) {
  // Usunięcie wszystkich znaków niebędących cyframi
  const cleanedNIP = nip.replace(/[^0-9]/g, "")

  // Sprawdzenie długości
  if (cleanedNIP.length !== 10) {
    return false
  }

  // Wagi dla poszczególnych cyfr NIP
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]

  // Obliczenie sumy kontrolnej
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanedNIP[i]) * weights[i]
  }

  // Obliczenie cyfry kontrolnej
  const checkDigit = sum % 11

  // Jeśli cyfra kontrolna jest równa 10, NIP jest nieprawidłowy
  if (checkDigit === 10) {
    return false
  }

  // Sprawdzenie, czy obliczona cyfra kontrolna zgadza się z ostatnią cyfrą NIP
  return checkDigit === Number.parseInt(cleanedNIP[9])
}

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^\w\s.-]/g, "") // Usuń wszystkie znaki oprócz liter, cyfr, podkreśleń, kropek, myślników i spacji
    .replace(/\s+/g, "_") // Zamień spacje na podkreślenia
    .toLowerCase() // Konwertuj na małe litery
}
