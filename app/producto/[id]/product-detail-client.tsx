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
import { 
  Heart, 
  Star, 
  ShoppingCart, 
  Eye, 
  Truck, 
  Shield, 
  RotateCcw, 
  Calendar, 
  ArrowLeft,
  Check
} from "lucide-react"
import { toast } from "sonner" 

interface ProductDetailClientProps {
  product: any
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart()
  
  // --- VERIFICACIONES DE SEGURIDAD ---
  const sizes = (product && Array.isArray(product.sizes)) ? product.sizes : []
  const images = (product && Array.isArray(product.images) && product.images.length > 0) 
    ? product.images 
    : ["/placeholder.svg"]

  const [selectedSize, setSelectedSize] = useState<any>(sizes.length > 0 ? sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [added, setAdded] = useState(false)

  // Calcular precio actual de forma segura
  const currentPrice = selectedSize?.price || product?.price || 0
  const totalPrice = currentPrice * quantity

  const formatPrice = (amount: any) => {
    const num = Number(amount)
    return isNaN(num) ? "0" : num.toLocaleString("es-CL")
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: images[0],
      size: selectedSize?.size,
      quantity: quantity,
      sellerId: product.seller?.id
    })
    
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    toast.success("Producto agregado al carrito")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/productos" className="flex items-center gap-2 text-primary mb-6 hover:underline w-fit">
        <ArrowLeft size={20} />
        Volver a productos
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Galería */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border">
            <Image
              src={images[currentImageIndex]}
              alt={product?.name || "Producto"}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors relative ${
                    idx === currentImageIndex ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info y Acciones */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">{product?.category || "General"}</Badge>
            <h1 className="text-3xl font-bold mb-2">{product?.name}</h1>
            {product?.seller && (
                <p className="text-muted-foreground flex items-center gap-2">
                    Vendido por <span className="font-semibold text-foreground">{product.seller.full_name || "Vendedor"}</span>
                </p>
            )}
          </div>

          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-green-600">
                    ${formatPrice(currentPrice)}
                </span>
                {selectedSize && <span className="text-sm text-muted-foreground mb-1.5">({selectedSize.size})</span>}
            </div>
          </div>

          {/* Selector de Tamaños */}
          {sizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Selecciona un tamaño</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sizes.map((size: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-sm">{size.size}</div>
                    <div className="text-green-600 font-bold mt-1">${formatPrice(size.price)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
                <div className="flex items-center border rounded-md">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 hover:bg-muted"
                    >−</button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 hover:bg-muted"
                    >+</button>
                </div>
                <span className="text-xl font-bold">${formatPrice(totalPrice)}</span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className={`flex-1 gap-2 text-base transition-all ${added ? "bg-green-600 hover:bg-green-700" : ""}`}
                onClick={handleAddToCart}
                disabled={selectedSize ? (Number(selectedSize.quantity) <= 0) : false}
              >
                {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {added ? "Agregado" : "Agregar al Carrito"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Envíos a todo Chile</div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Compra Segura</div>
            <div className="flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Garantía 3D</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">Descripción</TabsTrigger>
            <TabsTrigger value="seller">Vendedor</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card><CardContent className="p-6 whitespace-pre-wrap text-muted-foreground">{product?.description}</CardContent></Card>
          </TabsContent>
          <TabsContent value="seller" className="mt-6">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={product?.seller?.avatar_url} />
                    <AvatarFallback>V</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-lg">{product?.seller?.full_name || "Vendedor"}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Miembro desde {product?.seller?.created_at ? new Date(product.seller.created_at).getFullYear() : "N/A"}</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
