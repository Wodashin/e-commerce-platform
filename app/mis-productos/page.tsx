"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Plus, Package, Loader2 } from "lucide-react"

export default function InventoryPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetchMyProducts()
  }, [])

  const fetchMyProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/")
      return
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error cargando productos:", error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto permanentemente?")) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (!error) {
      setProducts(products.filter(p => p.id !== id))
      alert("Producto eliminado")
    } else {
      alert("Error al eliminar: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/perfil"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
              <p className="text-muted-foreground">Administra tus {products.length} publicaciones</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/subir-producto">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mis Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Tu inventario está vacío</h3>
                <p className="text-muted-foreground mb-6">Sube tu primer diseño para empezar a vender.</p>
                <Button asChild>
                  <Link href="/subir-producto">Subir Producto</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Imagen</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio Base</TableHead>
                      <TableHead>Stock Total</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const totalStock = product.sizes ? product.sizes.reduce((acc: number, curr: any) => acc + (Number(curr.quantity) || 0), 0) : 0
                      const minPrice = product.sizes ? Math.min(...product.sizes.map((s: any) => Number(s.price))) : product.price

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                              {product.images && product.images[0] ? (
                                <Image 
                                  src={product.images[0]} 
                                  alt={product.name} 
                                  fill 
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="w-8 h-8 m-auto text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/producto/${product.id}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            ${minPrice?.toLocaleString("es-CL")}
                          </TableCell>
                          <TableCell>
                            {totalStock > 0 ? (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                {totalStock} un.
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Agotado</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* Botón de Editar ACTIVADO */}
                              <Button variant="ghost" size="icon" className="hover:bg-muted" asChild>
                                <Link href={`/editar-producto/${product.id}`}>
                                    <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
