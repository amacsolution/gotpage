import fs from "fs/promises"
import { join, extname, dirname } from "path"
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

async function findFile(basePath: string, relativePath: string, allowRemoteFetch = true): Promise<string | null> {
  const fileName = relativePath.split("/").pop() || ""
  const possiblePaths = [
    join(basePath, "uploads", relativePath),
    join(basePath, "public", "uploads", relativePath),
    join(basePath, "uploads", fileName),
    join(basePath, "public", relativePath),
    join(basePath, "public", "uploads", fileName),
    join(basePath, "public", fileName),
  ]

  for (const path of possiblePaths) {
    if (existsSync(path)) return path
  }

  if (!allowRemoteFetch) {
    console.log("🛑 Pomijam zdalny fetch (host to gotpage.pl)")
    return null
  }

  const remoteUrl = `${process.env.GOTPAGE_BASE_URL || "https://gotpage.pl"}/api/uploads/${relativePath}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    console.log(`🔄 Próba zdalnego pobrania: ${remoteUrl}`)
    const response = await fetch(remoteUrl, { signal: controller.signal })

    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer())
      const savePath = join(basePath, "uploads", relativePath)
      await fs.mkdir(dirname(savePath), { recursive: true })
      await fs.writeFile(savePath, buffer)
      return savePath
    } else {
      console.error(`❌ Błąd odpowiedzi zdalnej: ${response.status} ${response.statusText}`)
    }
  } catch (err) {
    console.error("❌ Błąd pobierania zdalnego pliku:", err)
  } finally {
    clearTimeout(timeout)
  }

  return null
}

export async function GET(request: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  try {
    const path = params.path.join("/")
    const basePath = process.cwd()
    const hostname = request.headers.get("host") || ""

    // Jeśli host zawiera gotpage.pl, blokuj fetch zdalny, aby uniknąć pętli
    const allowRemoteFetch = !hostname.includes("gotpage.pl")

    const filePath = await findFile(basePath, path, allowRemoteFetch)

    if (!filePath) {
      return new Response("Plik nie istnieje", { status: 404 })
    }

    try {
      const fileBuffer = await fs.readFile(filePath)
      const fileExtension = extname(filePath).toLowerCase()
      const mimeType = getMimeType(fileExtension)

      return new Response(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    } catch (readError) {
      console.error("❌ Błąd odczytu pliku:", readError)
      return new Response(
        `Błąd odczytu pliku: ${readError instanceof Error ? readError.message : "Nieznany błąd"}`,
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Błąd ogólny w API route:", error)
    return new Response(
      `Wystąpił błąd podczas pobierania pliku: ${error instanceof Error ? error.message : "Nieznany błąd"}`,
      { status: 500 }
    )
  }
}
