import fs from "fs"
import path from "path"
import { mkdir } from "fs/promises"

/**
 * Funkcja inicjalizująca folder na przesyłane zdjęcia
 */
export async function initUploadsFolder() {
  try {
    // Ścieżka do folderu, gdzie będą przechowywane zdjęcia
    const uploadDir = path.join(process.cwd(), "public", "adimages")

    // Sprawdzenie, czy folder istnieje, jeśli nie - utworzenie go
    if (!fs.existsSync(uploadDir)) {
      console.log(`Tworzenie folderu na zdjęcia: ${uploadDir}`)
      await mkdir(uploadDir, { recursive: true })
    }
  } catch (error) {
    console.error("Błąd podczas inicjalizacji folderu na zdjęcia:", error)
  }
}

