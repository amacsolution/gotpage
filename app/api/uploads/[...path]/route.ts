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
      console.log("Found file at:", path)
      return path
    }
  }

  console.error("File not found in any location:", relativePath)
  console.log("Checked paths:", possiblePaths)
  return null
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join("/")
    console.log("Requested path:", path)

    // Pobierz ścieżkę bazową
    const basePath = process.cwd()
    console.log("Base path:", basePath)

    // Znajdź plik w różnych możliwych lokalizacjach
    const filePath = await findFile(basePath, path)

    if (!filePath) {
      console.log("File not found, returning 404")
      return new Response("Plik nie istnieje", { status: 404 })
    }

    // Odczytaj plik
    try {
      console.log("Reading file:", filePath)
      const fileBuffer = await fs.readFile(filePath)
      console.log("File read successfully, size:", fileBuffer.length)

      // Określ typ MIME na podstawie rozszerzenia pliku
      const fileExtension = extname(filePath).toLowerCase()
      const mimeType = getMimeType(fileExtension)
      console.log("MIME type:", mimeType)

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
