import fs from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";

// Proste mapowanie rozszerzeń plików na MIME
const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
  };
  return mimeTypes[extension] || "application/octet-stream";
};

// Generuj możliwe ścieżki na serwerze lokalnym
const getSearchPaths = (basePath: string, relativePath: string): string[] => {
  const fileName = relativePath.split("/").pop()!;
  return [
    join(basePath, "public", "uploads", relativePath),
    join(basePath, "uploads", relativePath),
    join(basePath, "uploads", fileName),
  ];
};

// Znajdź pierwszy istniejący plik
const findExistingFile = (paths: string[]): string | null => {
  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
};

// Główna funkcja API
export async function GET(request: Request, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const relativePath = params.path.join("/");

  // Check if request is from localhost:3000
  const host = request.headers.get("host");
  if (host === "localhost:3000") {
    // Proxy to gotpage.pl
    const remoteUrl = `https://gotpage.pl/api/uploads/${relativePath}`;
    const remoteRes = await fetch(remoteUrl);

    if (!remoteRes.ok) {
      return new Response("Plik nie istnieje na gotpage.pl", { status: 404 });
    }

    // Pass through content-type and body
    const contentType = remoteRes.headers.get("content-type") || "application/octet-stream";
    const body = await remoteRes.arrayBuffer();

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }

  // Local file logic (unchanged)
  const basePath = process.cwd();
  const searchPaths = getSearchPaths(basePath, relativePath);
  const filePath = findExistingFile(searchPaths);

  if (!filePath) {
    return new Response("Plik nie istnieje", { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(extname(filePath).toLowerCase());

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err) {
    console.error("Błąd podczas odczytu pliku:", err);
    return new Response("Wystąpił błąd serwera przy odczycie pliku.", { status: 500 });
  }
}
