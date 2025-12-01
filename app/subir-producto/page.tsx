"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Upload, X } from "lucide-react"

const CATEGORIES = ["Figuras", "Hogar", "Accesorios", "Arquitectura", "Juguetes", "Arte"]
const SIZES = ["Small (5cm)", "Medium (10cm)", "Large (20cm)", "XL (30cm+)"]

export default function SubirProducto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    tags: "",
    seller: "Usuario",
  })

  const [sizes, setSizes] = useState([
    { size: "Small (5cm)", price: "", quantity: "" },
    { size: "Medium (10cm)", price: "", quantity: "" },
    { size: "Large (20cm)", price: "", quantity: "" },
    { size: "XL (30cm+)", price: "", quantity: "" },
  ])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formDataToSend = new FormData()
        formDataToSend.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataToSend,
        })

        if (response.ok) {
          const data = await response.json()
          setImages((prev) => [...prev, data.url])
        }
      }
    } catch (error) {
      alert("Error al subir imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSizeChange = (index: number, field: string, value: string) => {
    const newSizes = [...sizes]
    newSizes[index] = { ...newSizes[index], [field]: value }
    setSizes(newSizes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.name || !formData.category) {
      alert("Completa todos los campos obligatorios")
      return
    }

    if (images.length === 0) {
      alert("Debes subir al menos una imagen")
      return
    }

    const activeSizes = sizes.filter((s) => s.price && s.quantity)
    if (activeSizes.length === 0) {
      alert("Define al menos un tamaño con precio y cantidad")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          tags: formData.tags.split(",").map((t) => t.trim()),
          images,
          sizes: activeSizes.map((s) => ({
            size: s.size,
            price: Number.parseInt(s.price),
            quantity: Number.parseInt(s.quantity),
          })),
          seller: formData.seller,
        }),
      })

      if (response.ok) {
        alert("Producto subido exitosamente")
        router.push("/productos")
      }
    } catch (error) {
      alert("Error al subir producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/productos" className="flex items-center gap-2 text-primary mb-6">
          <ArrowLeft size={20} />
          Volver a productos
        </Link>

        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-8">Subir Nuevo Producto</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del Producto *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Goku SSJ3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe tu producto..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Ej: anime, personaje, coleccionable, goku"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Imágenes del Producto</h2>
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center">
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload size={32} className="text-primary/50" />
                  <span className="font-medium">Haz clic para subir imágenes</span>
                  <span className="text-sm text-muted-foreground">o arrastra aquí (máx. 5MB por imagen)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Producto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tamaños y Precios */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Tamaños y Precios *</h2>
              <div className="space-y-3">
                {sizes.map((size, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">{size.size}</label>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={size.price}
                        onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                        placeholder="Precio (CLP)"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={size.quantity}
                        onChange={(e) => handleSizeChange(index, "quantity", e.target.value)}
                        placeholder="Cantidad"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Subiendo..." : "Subir Producto"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/productos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
