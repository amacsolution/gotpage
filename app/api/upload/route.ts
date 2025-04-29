import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadImage, deleteImage } from "@/lib/upload"
import path from "path"
import fs from "fs"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    console.log("Upload API called")
    
    // Sprawdzenie, czy użytkownik jest zalogowany
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Parsowanie formularza
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string || "general"
    const userId = formData.get("userId") as string
    const cropData = formData.get("cropData") ? JSON.parse(formData.get("cropData") as string) : null

    if (!file) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 })
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type, "Upload type:", type)

    // Sprawdzenie typu pliku
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Nieprawidłowy format pliku. Akceptowane są tylko obrazy." }, { status: 400 })
    }

    // Sprawdzenie rozmiaru pliku (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Plik jest zbyt duży. Maksymalny rozmiar to 10MB." }, { status: 400 })
    }

    try {
      // Próba zapisu pliku z użyciem funkcji uploadImage
      console.log("Trying to upload image using uploadImage function")
      const url = await uploadImage(file, type, userId, cropData)
      console.log("Image uploaded successfully, URL:", url)
      return NextResponse.json({ url })
    } catch (uploadError) {
      console.error("Error in uploadImage function:", uploadError)
      
      // Próba bezpośredniego zapisu pliku jako fallback
      try {
        console.log("Trying direct file save as fallback")
        
        // Określenie katalogu docelowego
        let uploadDir = ""
        
        switch (type) {
          case "avatar":
            uploadDir = path.join(process.cwd(), "uploads", "avatars")
            break
          case "background":
            uploadDir = path.join(process.cwd(), "uploads", "backgrounds")
            break
          case "ad":
            uploadDir = path.join(process.cwd(), "uploads", "ads")
            break
          default:
            uploadDir = path.join(process.cwd(), "uploads", "general")
        }
        
        console.log("Target directory:", uploadDir)
        
        // Sprawdzenie, czy katalog istnieje, jeśli nie - utworzenie go
        if (!existsSync(uploadDir)) {
          try {
            console.log("Creating directory:", uploadDir)
            await mkdir(uploadDir, { recursive: true })
          } catch (mkdirError) {
            console.error("Error creating directory:", mkdirError)
            
            // Próba alternatywnych lokalizacji
            const altDirs = [
              path.join(process.cwd(), "public", "uploads", type),
              path.join(process.cwd(), "public", type),
              path.join("/tmp", "uploads", type),
              path.join("/tmp", type)
            ]
            
            for (const dir of altDirs) {
              try {
                console.log("Trying alternative directory:", dir)
                await mkdir(dir, { recursive: true })
                uploadDir = dir
                break
              } catch (altMkdirError) {
                console.error("Failed to create alternative directory:", altMkdirError)
              }
            }
          }
        }
        
        // Generowanie unikalnej nazwy pliku
        const fileName = `${uuidv4()}${path.extname(file.name)}`
        const filePath = path.join(uploadDir, fileName)
        console.log("File will be saved to:", filePath)
        
        // Konwersja File na Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Zapisz plik bezpośrednio
        await writeFile(filePath, buffer)
        console.log("File saved successfully without processing")
        
        // Zwróć URL do pliku
        const fileUrl = `/api/uploads/${type}/${fileName}`
        console.log("File URL:", fileUrl)
        
        return NextResponse.json({ url: fileUrl })
      } catch (directSaveError) {
        console.error("Direct file save failed:", directSaveError)
        return NextResponse.json(
          { 
            error: "Wystąpił błąd podczas przesyłania obrazu", 
            details: directSaveError instanceof Error ? directSaveError.message : "Nieznany błąd" 
          }, 
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error("Błąd podczas przesyłania pliku:", error)
    return NextResponse.json(
      { 
        error: "Wystąpił błąd podczas przesyłania pliku", 
        details: error instanceof Error ? error.message : "Nieznany błąd",
        stack: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
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

    // Pobranie URL pliku z query params
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get("url")

    if (!fileUrl) {
      return NextResponse.json({ error: "Brak URL pliku" }, { status: 400 })
    }

    // Usunięcie pliku
    await deleteImage(fileUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Błąd podczas usuwania pliku:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania pliku" }, { status: 500 })
  }
}