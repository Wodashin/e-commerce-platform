"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Truck, Shield, RotateCcw, ArrowLeft, Check, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface ProductDetailClientProps {
  product: any
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart()
  
  // Adaptamos las variantes de la nueva tabla
  const variants = product.product_variants || []
  const images = (product.images && product.images.length > 0) ? product.images : ["/placeholder.svg"]

  // Seleccionamos la primera variante por defecto si existe
  const [selectedVariant, setSelectedVariant] = useState<any>(variants.length > 0 ? variants[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [added, setAdded] = useState(false)

  // El precio ahora viene de la variante seleccionada (unit_price)
  const currentPrice = selectedVariant ? Number(selectedVariant.unit_price) : (Number(product.price) || 0)
  const totalPrice = currentPrice * quantity

  // Stock actual de la variante seleccionada
  const currentStock = selectedVariant ? Number(selectedVariant.stock_quantity) : 0

  const handleAddToCart = () => {
    if (!selectedVariant) return

    addItem({
      id: product.id, // ID del producto padre
      variantId: selectedVariant.id, // ID único de la variante
      name: product.name,
      price: currentPrice,
      image: images[0],
      size: selectedVariant.size_description, // Guardamos la descripción de la talla
      quantity: quantity,
      sellerId: product.seller_id
    })
    
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    toast.success("Producto agregado al carrito")
  }

  const handleWhatsApp = () => {
    const msg = `Hola! Me interesa: ${product.name} (${selectedVariant?.size_description}) - $${currentPrice}. Cantidad: ${quantity}`
    window.open(`https://wa.me/56948842564?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // Funciones para incrementar/decrementar respetando stock
  const incrementQty = () => {
    if (quantity < currentStock) setQuantity(quantity + 1)
  }
  
  const decrementQty = () => {
    setQuantity(Math.max(1, quantity - 1))
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Link href="/productos" className="flex items-center gap-2 text-primary mb-6 hover:underline w-fit">
        <ArrowLeft size={20} /> Volver a productos
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Galería */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border">
            <Image src={images[currentImageIndex]} alt={product.name} fill className="object-cover" priority />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-20 rounded border-2 overflow-hidden relative ${idx === currentImageIndex ? "border-primary" : ""}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">{product.category}</Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">Vendido por <span className="font-semibold text-foreground">{product.seller?.full_name}</span></p>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-green-600">${currentPrice.toLocaleString("es-CL")}</span>
                {selectedVariant && <span className="text-sm text-muted-foreground mb-1.5">({selectedVariant.size_description})</span>}
            </div>

            {/* --- INDICADOR DE STOCK --- */}
            {selectedVariant && (
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${currentStock > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className={`font-medium text-sm ${currentStock === 0 ? "text-red-500" : ""}`}>
                  {currentStock > 0 
                    ? `Stock disponible: ${currentStock} unidades` 
                    : "Producto Agotado"}
                </span>
              </div>
            )}
          </div>

          {/* Selector de Variantes */}
          {variants.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-3">Selecciona un tamaño</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => {
                        setSelectedVariant(v)
                        setQuantity(1) // Resetear cantidad al cambiar variante
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedVariant?.id === v.id ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-sm">{v.size_description}</div>
                    <div className="text-green-600 font-bold mt-1">${Number(v.unit_price).toLocaleString("es-CL")}</div>
                    {/* Opcional: mostrar stock pequeño en cada tarjeta */}
                    <div className="text-xs text-muted-foreground mt-1">Stock: {v.stock_quantity}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded">No hay variantes disponibles para este producto.</div>
          )}

          {/* Acciones */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
                <div className="flex items-center border rounded-md">
                    <button onClick={decrementQty} className="px-3 py-1 hover:bg-muted" disabled={quantity <= 1}>-</button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button onClick={incrementQty} className="px-3 py-1 hover:bg-muted" disabled={quantity >= currentStock}>+</button>
                </div>
                <span className="text-xl font-bold">${totalPrice.toLocaleString("es-CL")}</span>
            </div>

            <div className="flex gap-3">
              <Button 
                size="lg" 
                className={`flex-1 gap-2 ${added ? "bg-green-600" : ""}`} 
                onClick={handleAddToCart} 
                // Deshabilitar si no hay variante, si el stock es 0, o si se pide más de lo que hay
                disabled={!selectedVariant || currentStock <= 0 || quantity > currentStock}
              >
                {added ? <Check /> : <ShoppingCart />} 
                {currentStock <= 0 ? "Sin Stock" : (added ? "Agregado" : "Agregar al Carrito")}
              </Button>
              <Button variant="outline" size="lg" onClick={handleWhatsApp}><MessageCircle /></Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 text-xs text-muted-foreground text-center">
            <div><Truck className="mx-auto mb-1"/> Envíos Chile</div>
            <div><Shield className="mx-auto mb-1"/> Compra Segura</div>
            <div><RotateCcw className="mx-auto mb-1"/> Garantía 3D</div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList><TabsTrigger value="description">Descripción</TabsTrigger><TabsTrigger value="seller">Vendedor</TabsTrigger></TabsList>
          <TabsContent value="description" className="mt-6">
            <Card><CardContent className="p-6 whitespace-pre-wrap text-muted-foreground">{product.description}</CardContent></Card>
          </TabsContent>
          <TabsContent value="seller" className="mt-6">
            <Card><CardContent className="p-6 flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarImage src={product.seller?.avatar_url} /><AvatarFallback>V</AvatarFallback></Avatar>
                <div>
                    <h3 className="font-bold text-lg">{product.seller?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Miembro desde {new Date(product.created_at).getFullYear()}</p>
                </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
