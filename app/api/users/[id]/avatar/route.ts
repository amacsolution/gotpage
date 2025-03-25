import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik edytuje swój własny profil
    if (user.id !== userId) {
      return NextResponse.json({ error: "Nie masz uprawnień do edycji tego profilu" }, { status: 403 })
    }

    // Parsowanie formularza
    const formData = await request.formData()
    const avatarFile = formData.get("avatar") as File

    if (!avatarFile) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 })
    }

    // Sprawdzenie typu pliku
    if (!avatarFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Nieprawidłowy format pliku. Akceptowane są tylko obrazy." }, { status: 400 })
    }

    // Sprawdzenie rozmiaru pliku (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (avatarFile.size > maxSize) {
      return NextResponse.json({ error: "Plik jest zbyt duży. Maksymalny rozmiar to 5MB." }, { status: 400 })
    }

    // Utworzenie ścieżki do folderu z avatarami
    const uploadDir = path.join(process.cwd(), "public", "avatars")

    // Sprawdzenie, czy folder istnieje, jeśli nie - utworzenie go
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Błąd podczas tworzenia folderu:", error)
    }

    // Generowanie unikalnej nazwy pliku
    const fileName = `${uuidv4()}.jpg`
    const filePath = path.join(uploadDir, fileName)

    // Konwersja File na Buffer
    const arrayBuffer = await avatarFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Przetwarzanie obrazu za pomocą sharp
    const processedImage = await sharp(buffer).resize(256, 256, { fit: "cover" }).jpeg({ quality: 90 }).toBuffer()

    // Zapisanie pliku
    await writeFile(filePath, processedImage)

    // Ścieżka URL do avatara
    const avatarUrl = `/avatars/${fileName}`

    // Aktualizacja avatara w bazie danych
    await query("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, userId])

    // Zwrócenie URL nowego avatara
    return NextResponse.json({ avatarUrl })
  } catch (error) {
    console.error("Błąd podczas przesyłania avatara:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas przesyłania avatara",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}

