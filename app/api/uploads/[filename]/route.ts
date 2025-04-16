import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filePath = path.join(process.cwd(), "uploads", params.filename)

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()

  const contentType = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  }[ext] || "application/octet-stream"

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
    },
  })
}
