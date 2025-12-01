"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, DollarSign, Package, Camera, FileText, Tag, AlertCircle, CheckCircle } from "lucide-react"

const categories = [
  "Figuras",
  "Hogar",
  "Accesorios",
  "Arquitectura",
  "Oficina",
  "Iluminación",
  "Juguetes",
  "Arte",
  "Herramientas",
  "Decoración",
]

const materials = ["PLA", "PLA+", "ABS", "PETG", "TPU", "Wood Fill", "Metal Fill", "Resina"]

export default function SellProductPage() {
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    material: "",
    dimensions: {
      height: "",
      width: "",
      depth: "",
    },
    weight: "",
    printTime: "",
    postProcessing: "",
    customizable: false,
    inStock: true,
    stockQuantity: "",
    tags: [] as string[],
    images: [] as File[],
  })

  const [currentTag, setCurrentTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files).slice(0, 5 - productData.images.length)
    setProductData({
      ...productData,
      images: [...productData.images, ...newImages],
    })
  }

  const removeImage = (index: number) => {
    const newImages = productData.images.filter((_, i) => i !== index)
    setProductData({ ...productData, images: newImages })
  }

  const addTag = () => {
    if (currentTag.trim() && !productData.tags.includes(currentTag.trim())) {
      setProductData({
        ...productData,
        tags: [...productData.tags, currentTag.trim()],
      })
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setProductData({
      ...productData,
      tags: productData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!productData.title.trim()) newErrors.title = "Título es requerido"
    if (!productData.description.trim()) newErrors.description = "Descripción es requerida"
    if (!productData.category) newErrors.category = "Categoría es requerida"
    if (!productData.price || Number.parseFloat(productData.price) <= 0) newErrors.price = "Precio válido es requerido"
    if (!productData.material) newErrors.material = "Material es requerido"
    if (productData.images.length === 0) newErrors.images = "Al menos una imagen es requerida"
    if (!productData.stockQuantity || Number.parseInt(productData.stockQuantity) <= 0) {
      newErrors.stockQuantity = "Cantidad en stock es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Aquí iría la lógica real de envío
    console.log("Producto enviado:", productData)

    setIsSubmitting(false)

    // Redirect o mostrar mensaje de éxito
    alert("¡Producto publicado exitosamente!")
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vender Producto 3D</h1>
          <p className="text-muted-foreground">Publica tu producto y comienza a vender en nuestra plataforma</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Producto *</Label>
                  <Input
                    id="title"
                    value={productData.title}
                    onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                    placeholder="Ej: Figura Dragon Ball Z - Goku Super Saiyan"
                    maxLength={100}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{errors.title && <span className="text-red-600">{errors.title}</span>}</span>
                    <span>{productData.title.length}/100</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="Describe tu producto: características, materiales, proceso de impresión, acabados, etc."
                    rows={6}
                    maxLength={2000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{errors.description && <span className="text-red-600">{errors.description}</span>}</span>
                    <span>{productData.description.length}/2000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={productData.category}
                      onValueChange={(value) => setProductData({ ...productData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label htmlFor="material">Material *</Label>
                    <Select
                      value={productData.material}
                      onValueChange={(value) => setProductData({ ...productData, material: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.material && <p className="text-sm text-red-600 mt-1">{errors.material}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Imágenes del Producto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productData.images.length < 5 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="images"
                      />
                      <label
                        htmlFor="images"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Subir imágenes ({productData.images.length}/5)
                          </p>
                          <p className="text-xs text-muted-foreground">JPG, PNG hasta 5MB cada una</p>
                        </div>
                      </label>
                    </div>
                  )}

                  {productData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={URL.createObjectURL(image) || "/placeholder.svg"}
                              alt={`Producto ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {index === 0 && <Badge className="absolute bottom-2 left-2">Principal</Badge>}
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Detalles Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Dimensiones (cm)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input
                      placeholder="Alto"
                      value={productData.dimensions.height}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          dimensions: { ...productData.dimensions, height: e.target.value },
                        })
                      }
                    />
                    <Input
                      placeholder="Ancho"
                      value={productData.dimensions.width}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          dimensions: { ...productData.dimensions, width: e.target.value },
                        })
                      }
                    />
                    <Input
                      placeholder="Profundo"
                      value={productData.dimensions.depth}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          dimensions: { ...productData.dimensions, depth: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Peso (gramos)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={productData.weight}
                      onChange={(e) => setProductData({ ...productData, weight: e.target.value })}
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <Label htmlFor="printTime">Tiempo de Impresión</Label>
                    <Input
                      id="printTime"
                      value={productData.printTime}
                      onChange={(e) => setProductData({ ...productData, printTime: e.target.value })}
                      placeholder="8 horas"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="postProcessing">Post-procesado</Label>
                  <Input
                    id="postProcessing"
                    value={productData.postProcessing}
                    onChange={(e) => setProductData({ ...productData, postProcessing: e.target.value })}
                    placeholder="Lijado, pintura, barnizado, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Agregar etiqueta"
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {productData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {productData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Las etiquetas ayudan a los clientes a encontrar tu producto más fácilmente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Precio y Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Precio (CLP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    placeholder="25000"
                  />
                  {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                  {productData.price && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${Number.parseFloat(productData.price).toLocaleString("es-CL")}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stockQuantity">Cantidad Disponible *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={productData.stockQuantity}
                    onChange={(e) => setProductData({ ...productData, stockQuantity: e.target.value })}
                    placeholder="5"
                    min="1"
                  />
                  {errors.stockQuantity && <p className="text-sm text-red-600 mt-1">{errors.stockQuantity}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {productData.images.length > 0 ? (
                      <Image
                        src={URL.createObjectURL(productData.images[0]) || "/placeholder.svg"}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold line-clamp-2">{productData.title || "Título del producto"}</h3>
                    {productData.category && (
                      <Badge variant="outline" className="mt-1">
                        {productData.category}
                      </Badge>
                    )}
                    {productData.price && (
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ${Number.parseFloat(productData.price).toLocaleString("es-CL")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Consejos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Usa fotos de alta calidad con buena iluminación</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Describe detalladamente el proceso y materiales</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Incluye dimensiones y peso exactos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Responde rápido a los mensajes de WhatsApp</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? "Publicando..." : "Publicar Producto"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
