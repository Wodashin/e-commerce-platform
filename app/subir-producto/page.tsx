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

  // Ahora cada variante tiene dimensiones específicas
  const [variants, setVariants] = useState([
    { l: "", w: "", h: "", price: "", quantity: "" }
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

  // Manejo de Variantes
  const addVariant = () => {
    setVariants([...variants, { l: "", w: "", h: "", price: "", quantity: "" }])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) return
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants: any = [...variants]
    if (field === 'quantity' && Number(value) > 999) return;
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || images.length === 0) {
      alert("Faltan datos obligatorios")
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
          // Aquí formateamos las dimensiones para guardarlas en la BD
          sizes: variants.map((v) => ({
            size: `${v.l}x${v.w}x${v.h} cm`, // Guardamos el string formateado
            price: Number(v.price),
            quantity: Number(v.quantity),
          })),
        }),
      })

      if (response.ok) {
        alert("¡Producto publicado exitosamente!")
        router.push("/mis-productos") // Redirigir a la nueva tabla
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
        <Link href="/mis-productos" className="flex items-center gap-2 text-primary mb-6">
          <ArrowLeft size={20} /> Volver a mi inventario
        </Link>

        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-8">Publicar Nuevo Producto</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Info Básica (Igual que antes) */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre del Producto *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="Ej: Figura Goku" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background">
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" rows={3} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Etiquetas</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="separadas, por, comas" />
                </div>
              </div>
            </div>

            {/* 2. Imágenes (Igual que antes) */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Imágenes</h2>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center relative hover:bg-muted/50">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center"><Upload size={32} className="mb-2" /><span>Subir Imágenes</span></div>
              </div>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square"><img src={url} className="object-cover w-full h-full rounded-md" /></div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Dimensiones y Precios (MODIFICADO) */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Variantes por Tamaño</h2>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}><Plus className="w-4 h-4 mr-2" /> Agregar Tamaño</Button>
              </div>
              
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-muted/30 p-4 rounded-lg border">
                    {/* Inputs de Dimensiones */}
                    <div className="flex gap-2 items-end">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1 block">Largo (cm)</label>
                        <input type="number" placeholder="15" value={variant.l} onChange={(e) => updateVariant(index, 'l', e.target.value)} className="w-20 px-2 py-2 border rounded-md text-sm text-center" />
                      </div>
                      <span className="mb-3 text-muted-foreground">x</span>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1 block">Ancho (cm)</label>
                        <input type="number" placeholder="10" value={variant.w} onChange={(e) => updateVariant(index, 'w', e.target.value)} className="w-20 px-2 py-2 border rounded-md text-sm text-center" />
                      </div>
                      <span className="mb-3 text-muted-foreground">x</span>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1 block">Alto (cm)</label>
                        <input type="number" placeholder="5" value={variant.h} onChange={(e) => updateVariant(index, 'h', e.target.value)} className="w-20 px-2 py-2 border rounded-md text-sm text-center" />
                      </div>
                    </div>

                    {/* Precio y Stock */}
                    <div className="flex-1 w-full pl-4 border-l">
                      <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1 block">Precio (CLP)</label>
                      <input type="number" placeholder="$ 5.000" value={variant.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1 block">Stock</label>
                      <input type="number" placeholder="Cant." max="999" value={variant.quantity} onChange={(e) => updateVariant(index, 'quantity', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                    </div>

                    {variants.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeVariant(index)}><Trash2 size={18} /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={loading} size="lg" className="flex-1">{loading ? "Publicando..." : "Publicar Producto"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
