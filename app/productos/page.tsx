"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { MessageCircle, Filter, Grid, List } from "lucide-react"

const CATEGORIES = ["Todas", "Figuras", "Hogar", "Accesorios", "Arquitectura", "Juguetes", "Arte"]
const sortOptions = [
  { value: "relevance", label: "Más Relevantes" },
  { value: "price-low", label: "Menor Precio" },
  { value: "price-high", label: "Mayor Precio" },
  { value: "newest", label: "Más Nuevos" },
  { value: "rating", label: "Mejor Valorados" },
]

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)

          // Extraer todos los tags únicos
          const tags = new Set<string>()
          data.forEach((product: any) => {
            product.tags?.forEach((tag: string) => tags.add(tag))
          })
          setAllTags(Array.from(tags).sort())
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchCategory = selectedCategory === "Todas" || product.category === selectedCategory
    const matchSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchTags = selectedTags.length === 0 || selectedTags.some((tag) => product.tags?.includes(tag))

    const minPrice = Math.min(...(product.sizes?.map((s: any) => s.price) || [0]))
    const matchPrice = minPrice >= priceRange[0] && minPrice <= priceRange[1]

    return matchCategory && matchSearch && matchTags && matchPrice
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Productos 3D</h1>
            <p className="text-muted-foreground">Descubre {filteredProducts.length} productos únicos impresos en 3D</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Filtros</h3>

              {/* Search */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Buscar por nombre o etiqueta</label>
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Categorías</label>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategory === category}
                        onCheckedChange={() => setSelectedCategory(category)}
                      />
                      <label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Etiquetas</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Rango de Precio</label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">Mostrando {filteredProducts.length} resultados</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                    <Image
                      src={product.images?.[0] || "/placeholder.svg?height=300&width=300&query=3D+product"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                        viewMode === "list" ? "w-full h-full" : "w-full h-48"
                      }`}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className={viewMode === "list" ? "flex justify-between h-full" : ""}>
                      <div className={viewMode === "list" ? "flex-1 pr-4" : ""}>
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">por {product.seller}</p>

                        <div className="mb-2 text-xs">
                          <span className="text-muted-foreground">Tamaños: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.sizes?.map((size: any) => (
                              <Badge key={size.size} variant="outline" className="text-xs">
                                {size.size}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {product.tags && product.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={viewMode === "list" ? "flex flex-col justify-between items-end" : ""}>
                        <div className="mb-3">
                          <span className="text-xl font-bold text-green-600">
                            ${Math.min(...(product.sizes?.map((s: any) => s.price) || [0])).toLocaleString("es-CL")}
                          </span>
                          <p className="text-xs text-muted-foreground">desde</p>
                        </div>

                        <div className={`flex gap-2 ${viewMode === "list" ? "flex-col w-32" : ""}`}>
                          <Button size="sm" className="flex-1" asChild>
                            <Link href={`/producto/${product.id}`}>Ver Detalles</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                `https://wa.me/56912345678?text=Hola! Me interesa el producto: ${product.name}`,
                                "_blank",
                              )
                            }
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
