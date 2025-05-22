import fs from "fs/promises"
import { join, extname } from "path"
import { existsSync } from "fs"

const getMimeType = (fileExtension: string): string => {
  switch (fileExtension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".gif":
      return "image/gif"
    case ".webp":
      return "image/webp"
    case ".svg":
      return "image/svg+xml"
    case ".pdf":
      return "application/pdf"
    default:
      return "application/octet-stream"
  }
}

// Funkcja do znajdowania pliku w różnych możliwych lokalizacjach
async function findFile(basePath: string, relativePath: string): Promise<string | null> {
  const possiblePaths = [
    // Główny katalog uploads
    join(basePath, "uploads", relativePath),
    // Katalog public/uploads
    join(basePath, "public", "uploads", relativePath),
    // Bezpośrednio w uploads (bez podkatalogów)
    join(basePath, "uploads", relativePath.split("/").pop() || ""),
    // Bezpośrednio w public
    join(basePath, "public", relativePath),
    // Bezpośrednio w public/uploads (bez podkatalogów)
    join(basePath, "public", "uploads", relativePath.split("/").pop() || ""),
    // Bezpośrednio w public (bez podkatalogów)
    join(basePath, "public", relativePath.split("/").pop() || ""),
    // W katalogu tmp
    join(basePath, "tmp", relativePath.split("/").pop() || ""),
  ]

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path
    }
  }

  // Jeśli żaden plik nie został znaleziony, wyslij zapytanie do API gotpage.pl
  // try {
  //   const response = await fetch(`https://gotpage.pl/api/uploads/${relativePath}`)
  //   if (response.ok) {
  //     // Zapisz plik lokalnie, aby przyspieszyć kolejne żądania
  //     const buffer = Buffer.from(await response.arrayBuffer())
  //     const savePath = join(basePath, "uploads", relativePath)
  //     await fs.mkdir(join(savePath, ".."), { recursive: true })
  //     await fs.writeFile(savePath, buffer)
  //     return savePath
  //   }
  // } catch (err) {
  //   console.error("Błąd pobierania pliku z gotpage.pl:", err)
  // }
  return null
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  try {
    const path = (await params).path.join("/")

    // Pobierz ścieżkę bazową
    const basePath = process.cwd()

    // Znajdź plik w różnych możliwych lokalizacjach
    const filePath = await findFile(basePath, path)

    if (!filePath) {
      return new Response("Plik nie istnieje", { status: 404 })
    }

    // Odczytaj plik
    try {
      const fileBuffer = await fs.readFile(filePath)

      // Określ typ MIME na podstawie rozszerzenia pliku
      const fileExtension = extname(filePath).toLowerCase()
      const mimeType = getMimeType(fileExtension)

      // Dodaj nagłówki cache-control, aby zapobiec buforowaniu
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    } catch (readError) {
      console.error("Error reading file:", readError)
      return new Response(`Błąd odczytu pliku: ${readError instanceof Error ? readError.message : "Nieznany błąd"}`, {
        status: 500,
      })
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return new Response(
      `Wystąpił błąd podczas pobierania pliku: ${error instanceof Error ? error.message : "Nieznany błąd"}`,
      { status: 500 },
    )
  }
}
