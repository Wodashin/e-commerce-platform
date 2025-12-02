"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" // <--- ¡ESTA LÍNEA FALTABA!
import { ArrowLeft, Upload, X, Plus, Trash2, Star, Loader2, Save } from "lucide-react"

const CATEGORIES = ["Figuras", "Hogar", "Accesorios", "Arquitectura", "Juguetes", "Arte"]

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [defaultImageIndex, setDefaultImageIndex] = useState(0)
  const [productId, setProductId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    tags: "",
  })

  const [variants, setVariants] = useState([
    { l: "", w: "", h: "", price: "", quantity: "" }
  ])

  // Cargar datos del producto
  useEffect(() => {
    const loadProduct = async () => {
      const { id } = await params
      setProductId(id)

      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !product) {
        alert("Producto no encontrado")
        router.push("/mis-productos")
        return
      }

      // Rellenar formulario
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description || "",
        tags: product.tags ? product.tags.join(", ") : "",
      })
      setImages(product.images || [])
      
      // Parsear variantes (sizes)
      if (product.sizes && Array.isArray(product.sizes)) {
        const parsedVariants = product.sizes.map((s: any) => {
            // Intentar extraer dimensiones del string "LxAxH cm"
            const dims = s.size.replace(" cm", "").split("x")
            return {
                l: dims[0] || "",
                w: dims[1] || "",
                h: dims[2] || "",
                price: s.price,
                quantity: s.quantity
            }
        })
        setVariants(parsedVariants)
      }

      setLoadingData(false)
    }

    loadProduct()
  }, [params, router, supabase])

  // Subir Imágenes
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

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, i) => i !== indexToRemove))
    if (indexToRemove === defaultImageIndex) setDefaultImageIndex(0)
    else if (indexToRemove < defaultImageIndex) setDefaultImageIndex(defaultImageIndex - 1)
  }

  // Variantes
  const addVariant = () => {
    setVariants([...variants, { l: "", w: "", h: "", price: "", quantity: "" }])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) return
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    let finalValue = value;
    if (field === 'quantity' || field === 'price') {
      const num = Number(value);
      if (num < 0) finalValue = "0";
      if (field === 'quantity' && num > 999) finalValue = "999"; //stock maximo de 999
    }

    const newVariants: any = [...variants]
    newVariants[index][field] = finalValue
    setVariants(newVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category || images.length === 0) {
      alert("Faltan datos obligatorios")
      return
    }

    setSaving(true)
    
    // Reordenar imágenes (Portada primero)
    const orderedImages = [...images]
    if (defaultImageIndex > 0 && defaultImageIndex < orderedImages.length) {
        const [selected] = orderedImages.splice(defaultImageIndex, 1)
        orderedImages.unshift(selected)
    }

    try {
      const response = await fetch("/api/products", {
        method: "PUT", // Usamos PUT para actualizar
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId, // Importante: Enviamos el ID
          name: formData.name,
          category: formData.category,
          description: formData.description,
          tags: formData.tags.split(",").map((t) => t.trim()),
          images: orderedImages,
          sizes: variants.map((v) => ({
            size: `${v.l}x${v.w}x${v.h} cm`,
            price: Number(v.price),
            quantity: Number(v.quantity),
          })),
        }),
      })

      if (response.ok) {
        alert("¡Producto actualizado exitosamente!")
        router.push("/mis-productos") 
      } else {
        throw new Error("Error en la actualización")
      }
    } catch (error) {
      alert("Error al actualizar producto")
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/mis-productos" className="flex items-center gap-2 text-primary mb-6">
          <ArrowLeft size={20} /> Volver sin guardar
        </Link>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            {/* Aquí es donde se usaba Badge y fallaba por falta de import */}
            <Badge variant="outline">ID: {productId?.slice(0, 8)}...</Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Info Básica */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background">
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" rows={3} />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Etiquetas</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Imágenes</h2>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">Clic en imagen para portada</span>
              </div>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center relative hover:bg-muted/50 transition-colors mb-4">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center">
                    {uploading ? <span className="animate-pulse">Subiendo...</span> : <><Upload size={32} className="mb-2 text-muted-foreground" /><span>Agregar más imágenes</span></>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, i) => (
                  <div key={i} onClick={() => setDefaultImageIndex(i)} className={`relative aspect-square group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${i === defaultImageIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent"}`}>
                      <img src={url} className="object-cover w-full h-full" alt="Producto" />
                      {i === defaultImageIndex && <div className="absolute inset-x-0 bottom-0 bg-primary text-white text-xs py-1 text-center font-bold flex justify-center items-center gap-1"><Star size={10} fill="white"/> Portada</div>}
                      <button type="button" onClick={(e) => {e.stopPropagation(); handleRemoveImage(i)}} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variantes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Variantes</h2>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}><Plus className="w-4 h-4 mr-2" /> Agregar</Button>
              </div>
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-muted/30 p-4 rounded-lg border">
                    <div className="flex gap-2 items-end">
                      {['l', 'w', 'h'].map((dim) => (
                        <div key={dim}>
                            <label className="text-[10px] uppercase font-bold mb-1 block">{dim === 'l' ? 'Largo' : dim === 'w' ? 'Ancho' : 'Alto'}</label>
                            <input type="number" value={variant[dim as keyof typeof variant]} onChange={(e) => updateVariant(index, dim, e.target.value)} className="w-16 px-2 py-2 border rounded-md text-center text-sm" />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 pl-2">
                      <label className="text-[10px] uppercase font-bold mb-1 block">Precio</label>
                      <input type="number" value={variant.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] uppercase font-bold mb-1 block">Stock</label>
                      <input type="number" value={variant.quantity} onChange={(e) => updateVariant(index, 'quantity', e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                    </div>
                    {variants.length > 1 && <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeVariant(index)}><Trash2 size={18} /></Button>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-background py-4 z-10">
              <Button type="submit" disabled={saving} size="lg" className="flex-1 shadow-lg">
                {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
