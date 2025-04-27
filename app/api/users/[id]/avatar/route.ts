import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { writeFile, mkdir, unlink } from "fs/promises"
import { existsSync } from "fs"
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

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: "Nieprawidłowe ID użytkownika" }, { status: 400 })
    }

    // Sprawdzenie, czy użytkownik edytuje swój własny profil

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

    // Sprawdzenie rozmiaru pliku (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (avatarFile.size > maxSize) {
      return NextResponse.json({ error: "Plik jest zbyt duży. Maksymalny rozmiar to 10MB." }, { status: 400 })
    }

    // Pobranie aktualnego avatara użytkownika
    const [currentAvatarResult] = await query("SELECT avatar FROM users WHERE id = ?", [userId]) as any[]
    const currentAvatar = currentAvatarResult?.avatar

    // Utworzenie ścieżki do folderu z avatarami
    const uploadDir = path.join(process.cwd(), "public", "avatars")
    
    // Sprawdzenie, czy folder istnieje, jeśli nie - utworzenie go
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Błąd podczas tworzenia folderu:", error)
    }

    // Usunięcie starego avatara, jeśli istnieje i nie jest domyślnym avatarem
    if (currentAvatar && !currentAvatar.startsWith('/placeholder') && !currentAvatar.includes('default')) {
      try {
        // Wyciągnięcie nazwy pliku z ścieżki URL
        const currentAvatarFilename = currentAvatar.split('/').pop()
        if (currentAvatarFilename) {
          const currentAvatarPath = path.join(uploadDir, currentAvatarFilename)
          
          // Sprawdzenie, czy plik istnieje przed próbą usunięcia
          if (existsSync(currentAvatarPath)) {
            await unlink(currentAvatarPath)
          }
        }
      } catch (error) {
        console.error("Błąd podczas usuwania starego avatara:", error)
        // Kontynuujemy proces mimo błędu usuwania starego pliku
      }
    }

    // Generowanie unikalnej nazwy pliku
    const fileName = `${uuidv4()}.jpg`
    const filePath = path.join(uploadDir, fileName)

    // Konwersja File na Buffer
    const arrayBuffer = await avatarFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      // Przetwarzanie obrazu za pomocą sharp w wysokiej jakości
      // Zwiększamy rozmiar do 512x512 i ustawiamy wysoką jakość
      const processedImage = await sharp(buffer)
        .resize(512, 512, { 
          fit: 'cover',
          withoutEnlargement: true, // Nie powiększaj obrazów mniejszych niż docelowy rozmiar
          kernel: sharp.kernel.lanczos3 // Lepszy algorytm skalowania
        })
        .jpeg({ 
          quality: 100, // Maksymalna jakość
          progressive: true, // Progresywne JPEG dla lepszego ładowania
          chromaSubsampling: '4:4:4' // Najlepsza jakość kolorów
        })
        .toBuffer()

      // Zapisanie pliku
      await writeFile(filePath, processedImage)

      // Ścieżka URL do avatara
      const avatarUrl = `/avatars/${fileName}`

      // Aktualizacja avatara w bazie danych
      await query("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, userId])

      // Zwrócenie URL nowego avatara
      return NextResponse.json({ avatarUrl })
    } catch (error) {
      console.error("Błąd podczas przetwarzania obrazu:", error)
      return NextResponse.json(
        {
          error: "Wystąpił błąd podczas przetwarzania obrazu",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Błąd podczas przesyłania avatara:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas przesyłania avatara",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 }
    )
  }
}
