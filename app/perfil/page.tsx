"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, MapPin, Calendar, Package, ShoppingCart, Edit, Plus, Store, User } from "lucide-react"

// Tipos para nuestros datos reales
interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string
  role: string
  created_at: string
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  stock: number
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  
  // Estado para edición (nombre, etc.)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    async function getData() {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/") // Si no hay usuario, mandar al inicio
        return
      }

      // 2. Obtener perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || "")
        
        // 3. Obtener productos de este usuario
        const { data: userProducts } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
        
        if (userProducts) {
          setProducts(userProducts)
        }
      }
      setLoading(false)
    }

    getData()
  }, [router, supabase])

  const handleUpdateProfile = async () => {
    if (!profile) return
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, full_name: editName })
      setIsEditing(false)
      alert("Perfil actualizado correctamente")
    } else {
      alert("Error al actualizar perfil")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Cabecera del Perfil */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 border-2 border-muted">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.full_name?.[0]?.toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    {isEditing ? (
                      <div className="flex gap-2 mb-2">
                        <Input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          className="max-w-xs"
                        />
                        <Button onClick={handleUpdateProfile}>Guardar</Button>
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      </div>
                    ) : (
                      <h1 className="text-3xl font-bold mb-2">
                        {profile.full_name || "Usuario sin nombre"}
                      </h1>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Miembro desde {new Date(profile.created_at).toLocaleDateString("es-CL")}
                      </div>
                      {/* Aquí podrías agregar ubicación si añades el campo a la BD */}
                    </div>
                  </div>

                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-4 md:mt-0">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>

                {/* Badge de Rol */}
                <div className="flex items-center gap-2">
                  <Badge variant={profile.role === 'vendor' ? "default" : "secondary"}>
                    {profile.role === 'vendor' ? "Vendedor Verificado" : "Usuario"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pestañas de contenido */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Mis Productos</TabsTrigger>
            <TabsTrigger value="sales">Ventas (Próximamente)</TabsTrigger>
            <TabsTrigger value="purchases">Mis Compras</TabsTrigger>
          </TabsList>

          {/* Pestaña: Mis Productos */}
          <TabsContent value="products" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mis Publicaciones</h2>
              <Button asChild>
                <Link href="/subir-producto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Link>
              </Button>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center flex flex-col items-center">
                  <Package className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aún no has subido productos</h3>
                  <p className="text-muted-foreground mb-4">¡Comienza a vender tus diseños 3D hoy mismo!</p>
                  <Button asChild variant="outline">
                    <Link href="/subir-producto">Subir mi primer producto</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all">
                    <div className="relative aspect-video bg-muted">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-lg text-green-600">
                          ${product.price.toLocaleString("es-CL")}
                        </span>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/producto/${product.id}`}>Ver</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pestañas vacías por ahora */}
          <TabsContent value="sales" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>El panel de ventas estará disponible próximamente.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tu historial de compras aparecerá aquí cuando realices pedidos.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
