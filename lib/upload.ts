import path from "path"
import fs from "fs"
import { mkdir, writeFile, unlink } from "fs/promises"
import { existsSync } from "fs"
import { v4 as uuidv4 } from "uuid"

// Funkcja do znajdowania odpowiedniego katalogu do zapisu plików
async function findUploadDirectory(type: string): Promise<string> {
  // Lista możliwych lokalizacji katalogów
  const possibleDirs = [
    path.join(process.cwd(), "uploads", type),
    path.join(process.cwd(), "public", "uploads", type),
    path.join(process.cwd(), "public", type),
    path.join("/tmp", "uploads", type),
    path.join("/tmp", type)
  ]

  // Sprawdź, czy któryś z katalogów istnieje
  for (const dir of possibleDirs) {
    if (existsSync(dir)) {
      console.log(`Found existing directory: ${dir}`)
      return dir
    }
  }

  // Jeśli żaden katalog nie istnieje, spróbuj utworzyć pierwszy z listy
  try {
    const dir = possibleDirs[0]
    console.log(`Creating directory: ${dir}`)
    await mkdir(dir, { recursive: true })
    return dir
  } catch (error) {
    console.error(`Failed to create directory ${possibleDirs[0]}:`, error)
    
    // Jeśli nie udało się utworzyć pierwszego katalogu, spróbuj pozostałe
    for (let i = 1; i < possibleDirs.length; i++) {
      try {
        const dir = possibleDirs[i]
        console.log(`Trying alternative directory: ${dir}`)
        await mkdir(dir, { recursive: true })
        return dir
      } catch (altError) {
        console.error(`Failed to create directory ${possibleDirs[i]}:`, altError)
      }
    }
    
    // Jeśli wszystkie próby zawiodły, zwróć błąd
    throw new Error("Nie można utworzyć katalogu do zapisu plików")
  }
}

// Funkcja do upewnienia się, że katalog istnieje
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    if (!existsSync(dirPath)) {
      console.log(`Creating directory: ${dirPath}`)
      await mkdir(dirPath, { recursive: true })
    }
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error)
    throw error
  }
}

// Funkcja do przesyłania obrazu
export async function uploadImage(
  file: File,
  type: string = "general",
  userId?: string,
  cropData?: { x: number; y: number; width: number; height: number } | null
): Promise<string> {
  try {
    console.log("uploadImage called with type:", type, "userId:", userId)
    
    // Znajdź odpowiedni katalog do zapisu
    let uploadDir = ""
    try {
      uploadDir = await findUploadDirectory(type)
    } catch (error) {
      console.error("Error finding upload directory:", error)
      
      // Fallback do katalogu w bieżącym katalogu
      uploadDir = path.join(process.cwd(), "uploads", type)
      await ensureDirectoryExists(uploadDir)
    }
    
    console.log("Upload directory:", uploadDir)
    
    // Generowanie unikalnej nazwy pliku
    const fileName = `${uuidv4()}${path.extname(file.name)}`
    const filePath = path.join(uploadDir, fileName)
    console.log("File will be saved to:", filePath)
    
    // Konwersja File na Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Zapisz plik bezpośrednio bez przetwarzania
    await writeFile(filePath, buffer)
    console.log("File saved successfully")
    
    // Zwróć URL do pliku
    const fileUrl = `/api/uploads/${type}/${fileName}`
    console.log("File URL:", fileUrl)
    
    return fileUrl
  } catch (error) {
    console.error("Error in uploadImage:", error)
    throw error
  }
}

// Funkcja do usuwania obrazu
export async function deleteImage(fileUrl: string): Promise<void> {
  try {
    console.log("deleteImage called with fileUrl:", fileUrl)
    
    // Wyciągnij ścieżkę pliku z URL
    const urlParts = fileUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const fileType = urlParts[urlParts.length - 2]
    
    // Lista możliwych lokalizacji pliku
    const possiblePaths = [
      path.join(process.cwd(), "uploads", fileType, fileName),
      path.join(process.cwd(), "public", "uploads", fileType, fileName),
      path.join(process.cwd(), "public", fileType, fileName)
    ]
    
    let fileDeleted = false
    
    // Spróbuj usunąć plik z każdej możliwej lokalizacji
    for (const filePath of possiblePaths) {
      try {
        if (existsSync(filePath)) {
          console.log("Deleting file:", filePath)
          await unlink(filePath)
          fileDeleted = true
          break
        }
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error)
      }
    }
    
    if (!fileDeleted) {
      console.warn("File not found in any of the expected locations")
    }
  } catch (error) {
    console.error("Error in deleteImage:", error)
    throw error
  }
}

// Funkcja do formatowania ścieżki obrazu
export function formatImagePath(imagePath: string | null | undefined): string {
  if (!imagePath) return "";
  
  // Jeśli ścieżka już zaczyna się od /api/uploads/, zwróć ją bez zmian
  if (imagePath.startsWith("/api/uploads/")) {
    return imagePath;
  }
  
  // Usuń przedrostek uploads/ jeśli istnieje
  const path = imagePath.startsWith("uploads/") ? imagePath.substring(8) : imagePath;
  
  // Dodaj przedrostek /api/uploads/
  return `/api/uploads/${path}`;
}

// Funkcja do generowania URL z parametrem odświeżania
export function getRefreshableImageUrl(url: string | null | undefined, refreshKey?: number): string {
  if (!url) return "";
  
  const formattedUrl = formatImagePath(url);
  return refreshKey ? `${formattedUrl}?v=${refreshKey}` : formattedUrl;
}