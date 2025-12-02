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

interface ProductsClientPageProps {
  initialProducts: any[]
}

export default function ProductsClientPage({ initialProducts }: ProductsClientPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (initialProducts.length > 0) {
      const tags = new Set<string>()
      initialProducts.forEach((product: any) => {
        product.tags?.forEach((tag: string) => tags.add(tag))
      })
      setAllTags(Array.from(tags).sort())
    }
  }, [initialProducts])

  // Helper para obtener precio mínimo desde la nueva tabla de variantes
  const getMinPrice = (product: any) => {
    if (product.product_variants && product.product_variants.length > 0) {
        return Math.min(...product.product_variants.map((v: any) => Number(v.unit_price)))
    }
    return Number(product.price) || 0
  }

  const filteredProducts = products.filter((product) => {
    const matchCategory = selectedCategory === "Todas" || product.category === selectedCategory
    const matchSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchTags = selectedTags.length === 0 || selectedTags.some((tag) => product.tags?.includes(tag))

    const minPrice = getMinPrice(product)
    const matchPrice = minPrice >= priceRange[0] && minPrice <= priceRange[1]

    return matchCategory && matchSearch && matchTags && matchPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = getMinPrice(a)
    const priceB = getMinPrice(b)
    
    switch (sortBy) {
      case "price-low": return priceA - priceB
      case "price-high": return priceB - priceA
      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "rating": return (b.rating || 0) - (a.rating || 0)
      default: return 0
    }
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filtros */}
      <div className={`lg:w-64 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Filtros</h3>
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Buscar</label>
            <Input placeholder="Nombre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Categorías</label>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox id={cat} checked={selectedCategory === cat} onCheckedChange={() => setSelectedCategory(cat)} />
                  <label htmlFor={cat} className="text-sm cursor-pointer">{cat}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Precio</label>
            <div className="px-2">
              <Slider value={priceRange} onValueChange={setPriceRange} max={100000} step={1000} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid Productos */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">{sortedProducts.length} resultados</p>
          <div className="flex gap-4">
             <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden"><Filter className="w-4 h-4 mr-2" />Filtros</Button>
             <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>{sortOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
          {sortedProducts.map((product) => {
            const minPrice = getMinPrice(product)
            const variants = product.product_variants || []

            return (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              <div className="relative aspect-square w-full">
                <Image src={product.images?.[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                <Badge variant="secondary" className="absolute top-2 right-2 text-xs">{product.category}</Badge>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                    <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">por {product.seller?.full_name || 'Vendedor'}</p>
                    <div className="mb-3 flex flex-wrap gap-1">
                        {variants.map((v: any) => (
                          <Badge key={v.id} variant="outline" className="text-[10px]">{v.size_description}</Badge>
                        ))}
                    </div>
                </div>
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <span className="text-lg font-bold text-green-600">${minPrice.toLocaleString("es-CL")}</span>
                        <p className="text-[10px] text-muted-foreground">desde</p>
                    </div>
                    {/* Botón modificado aquí */}
                    <Button size="sm" asChild>
                      <Link href={`/producto/${product.id}`}>Ver Detalles</Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      </div>
    </div>
  )
}
