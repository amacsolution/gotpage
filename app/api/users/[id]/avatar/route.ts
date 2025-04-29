import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("Avatar upload started for user ID:", params.id)

    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Parsowanie formularza
    console.log("Parsing form data...")
    const formData = await request.formData()
    const avatarFile = formData.get("avatar") as File

    if (!avatarFile) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 })
    }

    console.log("File received:", avatarFile.name, "Size:", avatarFile.size, "Type:", avatarFile.type)

    // Sprawdzenie typu pliku
    if (!avatarFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Nieprawidłowy format pliku. Akceptowane są tylko obrazy." }, { status: 400 })
    }

    // Sprawdzenie rozmiaru pliku (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (avatarFile.size > maxSize) {
      return NextResponse.json({ error: "Plik jest zbyt duży. Maksymalny rozmiar to 10MB." }, { status: 400 })
    }

    // Pobranie aktualnego avatara użytkownika
    console.log("Fetching current avatar...")
    const [currentAvatarResult] = (await query("SELECT avatar FROM users WHERE id = ?", [userId])) as any[]
    const currentAvatar = currentAvatarResult?.avatar
    console.log("Current avatar:", currentAvatar)

    // Próba zapisu pliku bez użycia sharp
    try {
      console.log("Trying direct file save...")

      // Utworzenie ścieżki do folderu z avatarami
      const uploadDir = path.join(process.cwd(), "uploads", "avatars")
      console.log("Upload directory:", uploadDir)

      // Sprawdzenie, czy folder istnieje, jeśli nie - utworzenie go
      if (!existsSync(uploadDir)) {
        try {
          console.log("Creating directory:", uploadDir)
          await mkdir(uploadDir, { recursive: true })
          console.log("Directory created successfully")
        } catch (error) {
          console.error("Error creating directory:", error)

          // Próba zapisu w alternatywnych lokalizacjach
          const altDirs = [
            path.join(process.cwd(), "public", "uploads", "avatars"),
            path.join(process.cwd(), "public", "avatars"),
            path.join(process.cwd(), "tmp"),
          ]

          for (const dir of altDirs) {
            try {
              console.log("Trying alternative directory:", dir)
              if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true })
              }

              // Jeśli udało się utworzyć katalog, użyj go
              console.log("Using alternative directory:", dir)
              uploadDir = dir
              break
            } catch (dirError) {
              console.error("Failed to create alternative directory:", dirError)
            }
          }
        }
      }

      // Generowanie unikalnej nazwy pliku
      const fileName = `${uuidv4()}.jpg`
      const filePath = path.join(uploadDir, fileName)
      console.log("File will be saved to:", filePath)

      // Konwersja File na Buffer
      const arrayBuffer = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Zapisz plik bezpośrednio bez przetwarzania
      await writeFile(filePath, buffer)
      console.log("File saved successfully without processing")

      // Ścieżka URL do avatara
      const avatarUrl = `/api/uploads/avatars/${fileName}`
      console.log("Avatar URL:", avatarUrl)

      // Aktualizacja avatara w bazie danych
      await query("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, userId])
      console.log("Database updated successfully")

      // Zwrócenie URL nowego avatara
      return NextResponse.json({ avatarUrl })
    } catch (directSaveError) {
      console.error("Direct file save failed:", directSaveError)

      // Zwróć błąd z informacjami diagnostycznymi
      return NextResponse.json(
        {
          error: "Wystąpił błąd podczas zapisywania pliku",
          details: directSaveError instanceof Error ? directSaveError.message : "Nieznany błąd",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Avatar upload failed:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas przesyłania avatara",
        details: error instanceof Error ? error.message : "Nieznany błąd",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
