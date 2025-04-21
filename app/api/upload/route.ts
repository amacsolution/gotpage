import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadImage, deleteImage } from "@/lib/upload"

export async function POST(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Parsowanie danych formularza
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = (formData.get("type") as string) || "avatar"

    if (!file) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 })
    }

    // Sprawdzenie typu pliku
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Nieprawidłowy format pliku. Akceptowane są tylko obrazy." }, { status: 400 })
    }

    // Sprawdzenie rozmiaru pliku (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Plik jest zbyt duży. Maksymalny rozmiar to 10MB." }, { status: 400 })
    }

    // Przesłanie zdjęcia do lokalnego folderu
    const imageUrl = await uploadImage(file, type)

    // Zwrócenie URL przesłanego zdjęcia
    return NextResponse.json({
      success: true,
      url: imageUrl,
    })
  } catch (error) {
    console.error("Błąd podczas przesyłania zdjęcia:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas przesyłania zdjęcia",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Pobranie URL zdjęcia do usunięcia
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "Brak URL zdjęcia" }, { status: 400 })
    }

    // Usunięcie zdjęcia z lokalnego folderu
    await deleteImage(imageUrl)

    // Zwrócenie sukcesu
    return NextResponse.json({
      success: true,
      message: "Zdjęcie zostało usunięte",
    })
  } catch (error) {
    console.error("Błąd podczas usuwania zdjęcia:", error)
    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas usuwania zdjęcia",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      },
      { status: 500 },
    )
  }
}
