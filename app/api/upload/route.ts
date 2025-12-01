import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 })
    }

    // Limitar tamaño a 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo muy grande (máx. 5MB)" }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
