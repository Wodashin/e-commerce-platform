"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Star, MessageCircle, Eye, Truck, Shield, RotateCcw, MapPin, Calendar, ArrowLeft } from "lucide-react"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Load product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const allProducts = await response.json()
          const foundProduct = allProducts.find((p: any) => p.id === params.id)
          if (foundProduct) {
            setProduct(foundProduct)
            if (foundProduct.sizes && foundProduct.sizes.length > 0) {
              setSelectedSize(foundProduct.sizes[0])
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      }
    }
    fetchProduct()
  }, [params.id])

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    )
  }

  const handleWhatsAppContact = () => {
    const message = `Hola! Me interesa el producto: ${product.name} - Tamaño: ${selectedSize?.size} - $${selectedSize?.price.toLocaleString("es-CL")} - Cantidad: ${quantity}`
    window.open(`https://wa.me/56912345678?text=${encodeURIComponent(message)}`, "_blank")
  }

  const totalPrice = (selectedSize?.price || 0) * quantity

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link href="/productos" className="flex items-center gap-2 text-primary mb-6 hover:underline">
          <ArrowLeft size={20} />
          Volver a productos
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.images[currentImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? "border-primary" : "border-muted"
                      }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} - Vista ${idx + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>}
                {product.discount && <Badge variant="destructive">{product.discount}% OFF</Badge>}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {product.views} vistas
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground">{product.seller}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews} reseñas)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through block">
                  ${product.originalPrice.toLocaleString("es-CL")}
                </span>
              )}
              <span className="text-4xl font-bold text-green-600">
                ${selectedSize?.price?.toLocaleString("es-CL") || product.price?.toLocaleString("es-CL")}
              </span>
              {product.discount && (
                <span className="ml-2 text-sm text-green-600 font-medium">
                  Ahorras $
                  {(product.originalPrice! - selectedSize?.price!).toLocaleString("es-CL") ||
                    (product.originalPrice! - product.price!).toLocaleString("es-CL")}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {selectedSize?.quantity > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="font-medium">En stock ({selectedSize?.quantity} disponibles)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="font-medium">Agotado</span>
                </div>
              )}
            </div>

            {product.sizes?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Selecciona un tamaño</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.sizes.map((size: any) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedSize?.size === size.size
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">{size.size}</div>
                      <div className="text-xl font-bold text-green-600">${size.price.toLocaleString("es-CL")}</div>
                      <div className="text-xs text-muted-foreground">Stock: {size.quantity}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Cantidad</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 border rounded-lg hover:bg-muted"
                >
                  −
                </button>
                <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 border rounded-lg hover:bg-muted"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <Card className="p-4 bg-primary/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-3xl font-bold text-green-600">${totalPrice.toLocaleString("es-CL")}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {quantity} {quantity === 1 ? "unidad" : "unidades"} × ${selectedSize?.price.toLocaleString("es-CL")}
              </p>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleWhatsAppContact}
                disabled={selectedSize?.quantity <= 0}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar por WhatsApp
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <Link key={tag} href={`/productos?search=${tag}`} className="hover:underline">
                      <Badge variant="outline" className="cursor-pointer">
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={product.seller.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{product.seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{product.seller.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {product.seller.rating}
                        </div>
                        <span>•</span>
                        <span>{product.seller.sales} ventas</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {product.seller.location}
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        Desde {product.seller.joinDate}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/vendedor/${product.seller.name}`}>Ver Perfil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Envío a todo Chile</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Compra protegida</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>30 días de garantía</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas ({product.reviews})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    {product.description.split("\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key}:</strong> {value}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar>
                            <AvatarImage src={review.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{review.user[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{review.user}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {review.rating}
                              </div>
                              <span>•</span>
                              <span>{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
