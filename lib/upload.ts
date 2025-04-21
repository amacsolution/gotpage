import fs from "fs/promises"
import path from "path"
import sharp from "sharp"

export async function uploadImage(file: File, type = "avatar"): Promise<string> {
  try {
    // Create unique filename
    const fileName = `${type}_${Date.now()}_${file.name.replace(/\s+/g, "_")}`

    // Define the upload directory based on type
    const uploadDir = type === "background" ? "backgrounds" : "avatars"

    // Ensure the directory exists
    const dirPath = path.join(process.cwd(), "public", "uploads", uploadDir)
    await fs.mkdir(dirPath, { recursive: true })

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process the image with sharp
    let processedBuffer = buffer

    // If it's a background image, ensure it's the right size
    if (type === "background") {
      // Create desktop version (1336x160) with high quality
      const desktopPath = path.join(dirPath, `desktop_${fileName}`)
      await sharp(buffer)
        .resize(1336, 160, { fit: "cover" })
        .jpeg({ quality: 100, mozjpeg: true }) // Zwiększona jakość do 100
        .toFile(desktopPath)

      // Create mobile version (350x120) with high quality
      const mobilePath = path.join(dirPath, `mobile_${fileName}`)
      await sharp(buffer)
        .resize(350, 120, { fit: "cover" })
        .jpeg({ quality: 100, mozjpeg: true }) // Zwiększona jakość do 100
        .toFile(mobilePath)

      // Save the original processed image with minimal compression
      processedBuffer = await sharp(buffer)
        .jpeg({ quality: 100, mozjpeg: true }) // Zwiększona jakość do 100
        .toBuffer()
    } else {
      // For avatars, just optimize the image with high quality
      processedBuffer = await sharp(buffer)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 95, mozjpeg: true }) // Zwiększona jakość do 95
        .toBuffer()
    }

    // Save the processed file
    const filePath = path.join(dirPath, fileName)
    await fs.writeFile(filePath, processedBuffer)

    // Return the public URL
    return `/uploads/${uploadDir}/${fileName}`
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const filePath = path.join(process.cwd(), "public", imageUrl)

    // Check if file exists
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false)

    if (exists) {
      // Delete the file
      await fs.unlink(filePath)

      // If it's a background image, also delete the desktop and mobile versions
      if (imageUrl.includes("/uploads/backgrounds/")) {
        const dir = path.dirname(filePath)
        const filename = path.basename(filePath)

        // Try to delete desktop version
        const desktopPath = path.join(dir, `desktop_${filename}`)
        const desktopExists = await fs
          .access(desktopPath)
          .then(() => true)
          .catch(() => false)

        if (desktopExists) {
          await fs.unlink(desktopPath)
        }

        // Try to delete mobile version
        const mobilePath = path.join(dir, `mobile_${filename}`)
        const mobileExists = await fs
          .access(mobilePath)
          .then(() => true)
          .catch(() => false)

        if (mobileExists) {
          await fs.unlink(mobilePath)
        }
      }
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}
