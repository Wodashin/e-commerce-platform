"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"

const CATEGORIES = ["Figuras", "Hogar", "Accesorios", "Arquitectura", "Juguetes", "Arte"]

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
  })

  // Estado dinámico para variantes (Tamaños)
  const [variants, setVariants] = useState([
    { name: "", price: "", quantity: "" }
  ])

  // Subir Imágenes a Cloudflare R2
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

  // Manejo de Variantes Dinámicas
  const addVariant = () => {
    setVariants([...variants, { name: "", price: "", quantity: "" }])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) return // Evitar borrar la última
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants: any = [...variants]
    
    // Validar cantidad máxima 999
    if (field === 'quantity' && Number(value) > 999) return;
    
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || images.length === 0) {
      alert("Faltan datos obligatorios (Nombre, Categoría o Imágenes)")
      return
    }

    // Filtrar variantes vacías
    const validVariants = variants.filter(v => v.name && v.price && v.quantity)
    if (validVariants.length === 0) {
      alert("Debes agregar al menos una variante con precio y cantidad")
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
          sizes: validVariants.map((v) => ({
            size: v.name, // Aquí guardamos "15x10cm" o lo que escribas
            price: Number(v.price),
            quantity: Number(v.quantity),
          })),
        }),
      })

      if (response.ok) {
        alert("¡Producto publicado exitosamente!")
        router.push("/perfil") // Redirigir al perfil para que lo veas
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
          <ArrowLeft size={20} /> Volver a productos
        </Link>

        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-8">Publicar Nuevo Producto</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Información Básica */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-sm font-medium mb-2 block">Nombre del Producto *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Figura Goku SSJ3"
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-sm font-medium mb-2 block">Categoría *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalles del producto, material, acabado..."
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="anime, figura, coleccionable"
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>

            {/* 2. Imágenes */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Galería de Imágenes</h2>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-muted-foreground" />
                  <span className="font-medium">Click para subir imágenes</span>
                  <span className="text-xs text-muted-foreground">Soporta JPG, PNG (Máx 10MB)</span>
                </div>
              </div>

              {/* Preview Grid */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group aspect-square bg-muted rounded-lg overflow-hidden border">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Variantes y Precios (DINÁMICO) */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Variantes y Precios</h2>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="w-4 h-4 mr-2" /> Agregar Variante
                </Button>
              </div>
              
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-muted/30 p-3 rounded-lg border">
                    <div className="flex-1 w-full">
                      <label className="text-xs text-muted-foreground mb-1 block">Nombre / Medidas</label>
                      <input
                        type="text"
                        placeholder="Ej: 15x10 cm"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="text-xs text-muted-foreground mb-1 block">Precio (CLP)</label>
                      <input
                        type="number"
                        placeholder="$"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                      />
                    </div>
                    <div className="w-full md:w-24">
                      <label className="text-xs text-muted-foreground mb-1 block">Stock</label>
                      <input
                        type="number"
                        placeholder="Cant."
                        max="999"
                        value={variant.quantity}
                        onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                      />
                    </div>
                    {variants.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 md:mt-5"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={loading} size="lg" className="flex-1">
                {loading ? "Publicando..." : "Publicar Producto"}
              </Button>
              <Button type="button" variant="outline" asChild size="lg">
                <Link href="/productos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
