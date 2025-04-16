import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"
import { mkdir, writeFile, unlink } from "fs/promises"

/**
 * Funkcja do przesyłania zdjęcia do `uploads/` (nie do `public/`)
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const uploadDir = path.join(process.cwd(), "uploads")

    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await writeFile(filePath, buffer, { mode: 0o644 })

    console.log("Zapisano obrazek:", filePath)

    // Zwracamy ścieżkę do API route serwującego zdjęcia
    return `/api/uploads/${fileName}`
  } catch (error) {
    console.error("Błąd podczas przesyłania zdjęcia:", error)
    throw new Error("Nie udało się przesłać zdjęcia")
  }
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    const fileName = url.split("/").pop()
    if (!fileName) {
      throw new Error("Nieprawidłowy URL zdjęcia")
    }

    const filePath = path.join(process.cwd(), "uploads", fileName)

    if (!fs.existsSync(filePath)) {
      console.warn(`Plik ${filePath} nie istnieje`)
      return true
    }

    await unlink(filePath)

    return true
  } catch (error) {
    console.error("Błąd podczas usuwania zdjęcia:", error)
    throw new Error("Nie udało się usunąć zdjęcia")
  }
}
