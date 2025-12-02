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
  ArrowLeft,
  ShoppingCart 
} from "lucide-react"

interface ProductDetailClientProps {
  product: any
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Aseguramos que sizes sea un array para evitar errores de lectura '0'
  const sizes = Array.isArray(product.sizes) ? product.sizes : []
  
  const [selectedSize, setSelectedSize] = useState<any>(sizes.length > 0 ? sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleWhatsAppContact = () => {
    // Construimos el mensaje
    const productName = product.name
    const sizeInfo = selectedSize ? ` - Tamaño: ${selectedSize.size}` : ""
    const priceInfo = selectedSize 
      ? ` - Precio: $${selectedSize.price.toLocaleString("es-CL")}` 
      : ` - Precio: $${product.price.toLocaleString("es-CL")}`
    
    const message = `Hola! Me interesa el producto: ${productName}${sizeInfo}${priceInfo} - Cantidad: ${quantity}. ¿Está disponible?`
    
    // Número por defecto o el del vendedor si existiera en la DB
    const phone = "56948842564" 
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank")
  }

  // Calcular precio total
  const currentPrice = selectedSize?.price || product.price || 0
  const totalPrice = currentPrice * quantity

  // Manejo seguro de imágenes
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ["/placeholder.svg"]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link href="/productos" className="flex items-center gap-2 text-primary mb-6 hover:underline w-fit">
        <ArrowLeft size={20} />
        Volver a productos
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
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
              {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>}
              {product.discount && <Badge variant="destructive">{product.discount}% OFF</Badge>}
            </div>
          </div>
          
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

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category}</Badge>
              {product.views && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {product.views} vistas
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.seller && (
                <p className="text-muted-foreground flex items-center gap-2">
                    Vendido por <span className="font-semibold text-foreground">{product.seller.full_name}</span>
                </p>
            )}
          </div>

          {/* Rating (Simulado si no hay datos reales aún) */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= (product.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating || 5.0}</span>
          </div>

          {/* Price */}
          <div className="p-4 bg-muted/20 rounded-lg border">
            <span className="text-sm text-muted-foreground">Precio por unidad:</span>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-green-600">
                    ${currentPrice.toLocaleString("es-CL")}
                </span>
                {selectedSize && (
                    <span className="text-sm text-muted-foreground mb-1.5">
                        ({selectedSize.size})
                    </span>
                )}
            </div>
          </div>

          {/* Stock Status */}
          <div>
            {(selectedSize?.quantity > 0 || (!selectedSize && product.stock > 0)) ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                En stock {selectedSize ? `(${selectedSize.quantity} disp.)` : ""}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 w-fit px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                Agotado
              </div>
            )}
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
                    <div className="text-green-600 font-bold mt-1">${Number(size.price).toLocaleString("es-CL")}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-medium">Cantidad:</span>
                    <div className="flex items-center border rounded-md">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-1 hover:bg-muted transition-colors"
                        >−</button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3 py-1 hover:bg-muted transition-colors"
                        >+</button>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-sm text-muted-foreground block">Total a pagar</span>
                    <span className="text-xl font-bold">${totalPrice.toLocaleString("es-CL")}</span>
                </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 gap-2 text-base"
                onClick={handleWhatsAppContact}
                disabled={selectedSize ? selectedSize.quantity <= 0 : false}
              >
                <MessageCircle className="w-5 h-5" />
                Comprar por WhatsApp
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
                Al hacer clic, se abrirá un chat de WhatsApp con el vendedor para coordinar el pago y envío.
            </p>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="w-4 h-4 text-primary" />
              <span>Envíos a todo Chile</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Compra Segura</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw className="w-4 h-4 text-primary" />
              <span>Garantía de impresión</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Detalles */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="description">Descripción</TabsTrigger>
            <TabsTrigger value="seller">Información del Vendedor</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none whitespace-pre-wrap text-muted-foreground">
                  {product.description || "Sin descripción disponible."}
                </div>
                
                {product.tags && product.tags.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-2">Etiquetas:</h4>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                        </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seller" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={product.seller?.avatar_url} />
                        <AvatarFallback>{product.seller?.full_name?.[0] || "V"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-lg">{product.seller?.full_name || "Vendedor"}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Miembro desde {new Date(product.seller?.created_at || Date.now()).getFullYear()}</span>
                        </div>
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
