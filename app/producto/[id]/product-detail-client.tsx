"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Star, 
  MessageCircle, 
  Eye, 
  Truck, 
  Shield, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  ArrowLeft
} from "lucide-react"

interface ProductDetailClientProps {
  product: any
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Verificación de seguridad: si sizes es null, usamos array vacío
  const sizes = Array.isArray(product.sizes) ? product.sizes : []
  
  // Estado inicial seguro
  const [selectedSize, setSelectedSize] = useState<any>(sizes.length > 0 ? sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Verificación de seguridad para imágenes
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ["/placeholder.svg"]

  const handleWhatsAppContact = () => {
    const productName = product.name
    const sizeInfo = selectedSize ? ` - Tamaño: ${selectedSize.size}` : ""
    const priceInfo = selectedSize 
      ? ` - Precio: $${Number(selectedSize.price).toLocaleString("es-CL")}` 
      : ` - Precio: $${Number(product.price).toLocaleString("es-CL")}`
    
    const message = `Hola! Me interesa el producto: ${productName}${sizeInfo}${priceInfo} - Cantidad: ${quantity}. ¿Está disponible?`
    
    // Número por defecto (puedes cambiarlo o traerlo del perfil del vendedor si lo agregas a la DB)
    const phone = "56948842564" 
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank")
  }

  // Calcular precio actual
  const currentPrice = selectedSize?.price || product.price || 0
  const totalPrice = currentPrice * quantity

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Botón Volver */}
      <Link href="/productos" className="flex items-center gap-2 text-primary mb-6 hover:underline w-fit">
        <ArrowLeft size={20} />
        Volver a productos
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border">
            <Image
              src={images[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {/* Badges de ejemplo */}
              {product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                 <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>
              )}
            </div>
          </div>
          
          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors relative ${
                    idx === currentImageIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/25"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - Vista ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.seller && (
                <p className="text-muted-foreground flex items-center gap-2">
                    Vendido por <span className="font-semibold text-foreground">{product.seller.full_name || "Vendedor"}</span>
                </p>
            )}
          </div>

          {/* Precio */}
          <div className="p-4 bg-muted/20 rounded-lg border">
            <span className="text-sm text-muted-foreground">Precio por unidad:</span>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-green-600">
                    ${Number(currentPrice).toLocaleString("es-CL")}
                </span>
                {selectedSize && (
                    <span className="text-sm text-muted-foreground mb-1.5">
                        ({selectedSize.size})
                    </span>
                )}
            </div>
          </div>

          {/* Selector de Tamaños (Variantes) */}
          {sizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Selecciona un tamaño</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sizes.map((size: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-lg border-2 text-left transition-all relative overflow-hidden ${
                      selectedSize === size
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-sm">{size.size}</div>
                    <div className="text-green-600 font-bold mt-
