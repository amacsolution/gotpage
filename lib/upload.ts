import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"
import { mkdir, writeFile, unlink } from "fs/promises"

/**
 * Funkcja do przesyłania zdjęcia na serwer lokalny
 *
 * @param file Plik do przesłania
 * @returns URL przesłanego pliku
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Ścieżka do folderu, gdzie będą przechowywane zdjęcia
    const uploadDir = path.join(process.cwd(), "public", "adimages")

    // Sprawdzenie, czy folder istnieje, jeśli nie - utworzenie go
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generowanie unikalnej nazwy pliku
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // Konwersja File na Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Zapisanie pliku
    await writeFile(filePath, buffer)

    // Zwrócenie ścieżki URL do pliku
    return `/adimages/${fileName}`
  } catch (error) {
    console.error("Błąd podczas przesyłania zdjęcia:", error)
    throw new Error("Nie udało się przesłać zdjęcia")
  }
}

/**
 * Funkcja do usuwania zdjęcia z serwera lokalnego
 *
 * @param url URL zdjęcia do usunięcia
 * @returns true jeśli usunięto pomyślnie
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Wyciągnięcie nazwy pliku z URL
    const fileName = url.split("/").pop()
    if (!fileName) {
      throw new Error("Nieprawidłowy URL zdjęcia")
    }

    // Ścieżka do pliku
    const filePath = path.join(process.cwd(), "public", "adimages", fileName)

    // Sprawdzenie, czy plik istnieje
    if (!fs.existsSync(filePath)) {
      console.warn(`Plik ${filePath} nie istnieje`)
      return true
    }

    // Usunięcie pliku
    await unlink(filePath)

    return true
  } catch (error) {
    console.error("Błąd podczas usuwania zdjęcia:", error)
    throw new Error("Nie udało się usunąć zdjęcia")
  }
}

