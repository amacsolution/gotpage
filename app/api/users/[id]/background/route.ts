import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Sprawdź typ zawartości
    const contentType = request.headers.get("content-type") || ""

    // Obsługa żądania JSON (dla usuwania tła)
    if (contentType.includes("application/json")) {
      const data = await request.json()

      // Jeśli backgroundImage jest null, usuń tło
      if (data.backgroundImage === null) {
        await query("UPDATE users SET background_img = NULL WHERE id = ?", [userId])
        return NextResponse.json({ message: "Tło zostało usunięte" })
      }

      // Aktualizacja tła w bazie danych
      await query("UPDATE users SET background_img = ? WHERE id = ?", [data.backgroundImage, userId])
      return NextResponse.json({ backgroundUrl: data.backgroundImage })
    }

    // Obsługa multipart/form-data (dla przesyłania plików)
    const formData = await request.formData()
    const backgroundFile = formData.get("background") as File

    if (!backgroundFile) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 })
    }

    // Sprawdzenie typu pliku
    if (!backgroundFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Nieprawidłowy format pliku. Akceptowane są tylko obrazy." }, { status: 400 })
    }

    // Sprawdzenie rozmiaru pliku (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (backgroundFile.size > maxSize) {
      return NextResponse.json({ error: "Plik jest zbyt duży. Maksymalny rozmiar to 10MB." }, { status: 400 })
    }
    const [currentBackgroundResult] = (await query("SELECT background_img FROM users WHERE id = ?", [userId])) as any[]
    const currentBackground = currentBackgroundResult?.background_img

    // Próba zapisu pliku bez użycia sharp
    try {

      // Utworzenie ścieżki do folderu z tłami
      let uploadDir = path.join(process.cwd(), "uploads", "backgrounds")

      // Sprawdzenie, czy folder istnieje, jeśli nie - utworzenie go
      if (!existsSync(uploadDir)) {
        try {
          await mkdir(uploadDir, { recursive: true })
        } catch (error) {
          console.error("Error creating directory:", error)

          // Próba zapisu w alternatywnych lokalizacjach
          const altDirs = [
            path.join(process.cwd(), "public", "uploads", "backgrounds"),
            path.join(process.cwd(), "public", "backgrounds"),
            path.join(process.cwd(), "tmp"),
          ]

          let altUploadDir = null

          for (const dir of altDirs) {
            try {
              if (!existsSync(dir)) {
                await mkdir(dir, { recursive: true })
              }
              altUploadDir = dir
              break
            } catch (dirError) {
              console.error("Failed to create alternative directory:", dirError)
            }
          }

          if (altUploadDir) {
            uploadDir = altUploadDir
          }
        }
      }

      // Generowanie unikalnej nazwy pliku
      const fileName = `${uuidv4()}.jpg`
      const filePath = path.join(uploadDir, fileName)

      // Konwersja File na Buffer
      const arrayBuffer = await backgroundFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Zapisz plik bezpośrednio bez przetwarzania
      await writeFile(filePath, buffer)

      // Ścieżka URL do tła
      const backgroundUrl = `/api/uploads/backgrounds/${fileName}`

      // Aktualizacja tła w bazie danych
      await query("UPDATE users SET background_img = ? WHERE id = ?", [backgroundUrl, userId])

      // Zwrócenie URL nowego tła
      return NextResponse.json({ backgroundUrl })
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
    console.error("Background upload failed:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas przesyłania tła",
        details: error instanceof Error ? error.message : "Nieznany błąd",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }


// Dodajemy również obsługę metody PATCH, która będzie działać tak samo jak POST
export { POST as PATCH }
