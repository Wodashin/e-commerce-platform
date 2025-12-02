"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Upload, X, Plus, Trash2, Star, Loader2 } from "lucide-react"

const CATEGORIES = ["Figuras", "Hogar", "Accesorios", "Arquitectura", "Juguetes", "Arte"]

export default function SubirProducto() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true) // Estado para la pantalla de carga inicial
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [defaultImageIndex, setDefaultImageIndex] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    tags: "",
  })

  // Estado inicial de variantes
  const [variants, setVariants] = useState([
    { l: "15", w: "10", h: "5", price: "3000", quantity: "1" }
  ])

  // --- NUEVA SEGURIDAD: Verificar Rol al Cargar ---
  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/") // No logueado -> Fuera
        return
      }

      // Verificar si es Admin Supremo
      const isGodAdmin = user.email?.toLowerCase().includes("ilyon3d")

      // Verificar Rol en Base de Datos
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Si NO es vendedor Y NO es admin -> Fuera
      if (profile?.role !== 'vendor' && !isGodAdmin) {
        alert("Acceso denegado: Necesitas cuenta de Vendedor.")
        router.push("/")
      } else {
        setVerifying(false) // Permiso concedido, mostramos la página
      }
    }

    checkPermissions()
  }, [router, supabase])

  // Subida de imágenes a tu API (R2)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const dataForm = new FormData()
        dataForm.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: dataForm })
        if (res.ok) {
          const data = await res.json()
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
    setImages(images.filter((_, i) => i !== index))
    if (index === defaultImageIndex) setDefaultImageIndex(0)
    else if (index < defaultImageIndex) setDefaultImageIndex(defaultImageIndex - 1)
  }

  const addVariant = () => {
    setVariants([...variants, { l: "15", w: "10", h: "5", price: "3000", quantity: "1" }])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) return
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const newVars: any = [...variants]
    newVars[index][field] = value
    setVariants(newVars)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category || images.length === 0) {
      alert("Faltan datos obligatorios (Nombre, Categoría o Imágenes)")
      return
    }

    setLoading(true)
    
    // Ordenar imagen de portada
    const orderedImages = [...images]
    if (defaultImageIndex > 0 && defaultImageIndex < orderedImages.length) {
        const [selected] = orderedImages.splice(defaultImageIndex, 1)
        orderedImages.unshift(selected)
    }

    // Calcular precio base (el más barato para mostrar en la tarjeta)
    const minPrice = Math.min(...variants.map(v => Number(v.price) || 0))

    try {
      // 1. Crear el Producto "Padre"
      const resProduct = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          tags: formData.tags.split(",").map((t) => t.trim()),
          images: orderedImages,
          price: minPrice, 
        }),
      })
      
      const productData = await resProduct.json()
      // Si la API rechaza por permisos (403), capturamos el error aquí
      if (resProduct.status === 403) throw new Error("No tienes permiso para vender.")
      if (!resProduct.ok || !productData.id) throw new Error("Error creando producto principal")

      const productId = productData.id

      // 2. Crear las Variantes "Hijos"
      const variantsData = variants.map((v) => ({
          size_description: `${v.l}x${v.w}x${v.h} cm`,
          unit_price: Number(v.price),
          stock_quantity: Number(v.quantity),
      }));

      const resVariants = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variants: variantsData,
        }),
      })

      if (!resVariants.ok) throw new Error("Error guardando variantes")

      alert("¡Producto creado correctamente!")
      router.push("/mis-productos") 

    } catch (error: any) {
      console.error(error)
      alert("Hubo un error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Pantalla de carga mientras verificamos permisos
  if (verifying) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary"/></div>
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/mis-productos" className="flex items-center gap-2 text-primary mb-6">
          <ArrowLeft size={20} /> Volver
        </Link>

        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-8">Publicar Nuevo Producto</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Info Básica */}
            <div className="grid md:grid-cols-2 gap-4">
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="border p-2 rounded" placeholder="Nombre del Producto" />
                <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="border p-2 rounded">
                    <option value="">Categoría...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="border p-2 rounded col-span-2" placeholder="Descripción" rows={3} />
                <input value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="border p-2 rounded col-span-2" placeholder="Etiquetas (separadas por comas)" />
            </div>

            {/* Imágenes */}
            <div>
              <h2 className="font-semibold mb-2">Imágenes</h2>
              <div className="border-2 border-dashed p-4 text-center cursor-pointer relative rounded-lg hover:bg-muted/50">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0" />
                {uploading ? "Subiendo..." : "Click para subir imágenes"}
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((url, i) => (
                  <div key={i} onClick={() => setDefaultImageIndex(i)} className={`relative aspect-square border-2 rounded overflow-hidden cursor-pointer ${i === defaultImageIndex ? "border-green-500" : ""}`}>
                    <img src={url} className="object-cover w-full h-full" />
                    {i === defaultImageIndex && <div className="absolute bottom-0 w-full bg-green-500 text-white text-xs text-center">Portada</div>}
                    <button type="button" onClick={(e) => {e.stopPropagation(); handleRemoveImage(i)}} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">X</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variantes */}
            <div>
              <h2 className="font-semibold mb-2">Variantes (Tallas y Stock)</h2>
              <Button type="button" size="sm" variant="outline" onClick={addVariant} className="mb-4"><Plus className="w-4 h-4 mr-2"/> Agregar Talla</Button>
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center bg-muted/20 p-2 rounded">
                    <input type="number" step="0.1" min="0" placeholder="Largo" value={v.l} onChange={(e) => updateVariant(i, 'l', e.target.value)} className="w-16 border p-1 rounded text-center" />
                    <span>x</span>
                    <input type="number" step="0.1" min="0" placeholder="Ancho" value={v.w} onChange={(e) => updateVariant(i, 'w', e.target.value)} className="w-16 border p-1 rounded text-center" />
                    <span>x</span>
                    <input type="number" step="0.1" min="0" placeholder="Alto" value={v.h} onChange={(e) => updateVariant(i, 'h', e.target.value)} className="w-16 border p-1 rounded text-center" />
                    <span className="text-sm text-muted-foreground">cm</span>
                    
                    <input type="number" min="0" placeholder="Precio" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="w-24 border p-1 rounded" />
                    <input type="number" min="0" placeholder="Stock" value={v.quantity} onChange={(e) => updateVariant(i, 'quantity', e.target.value)} className="w-20 border p-1 rounded" />
                    
                    {variants.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>}
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? <Loader2 className="animate-spin mr-2" /> : null} Publicar Producto
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}v
