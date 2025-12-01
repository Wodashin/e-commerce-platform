"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, Calendar, Package, ShoppingCart, Edit, Plus, Store, User, Trash2 } from "lucide-react"

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
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/")
        return
      }

      // Obtener perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || "")
        
        // Obtener productos (Ordenados por fecha reciente)
        const { data: userProducts, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
        
        if (userProducts) {
          setProducts(userProducts)
        }
      }
      setLoading(false)
    }

    getData()
  }, [router, supabase])

  const handleDeleteProduct = async (id: string) => {
    if(!confirm("¿Estás seguro de borrar este producto?")) return;

    const { error } = await supabase.from('products').delete().eq('id', id)
    
    if (!error) {
      setProducts(products.filter(p => p.id !== id))
      alert("Producto eliminado")
    }
  }

  const handleUpdateProfile = async () => {
    if (!profile) return
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, full_name: editName })
      setIsEditing(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!profile) return null

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-2 border-muted">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.full_name?.[0]?.toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center justify-between mb-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      <Button onClick={handleUpdateProfile}>Guardar</Button>
                    </div>
                  ) : (
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  )}
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                      <Edit className="w-4 h-4 mr-2" /> Editar Perfil
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Miembro desde {new Date(profile.created_at).toLocaleDateString()}</span>
                  <Badge>{profile.role === 'vendor' ? "Vendedor" : "Usuario"}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Mis Productos ({products.length})</TabsTrigger>
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="purchases">Compras</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6 space-y-6">
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/subir-producto"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Link>
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Aún no tienes productos</h3>
                <p className="text-muted-foreground mb-4">Sube tu primer diseño 3D ahora</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden group">
                    <div className="relative aspect-video bg-muted">
                      {product.images?.[0] && (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-600">${product.price.toLocaleString()}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" asChild>
                            <Link href={`/producto/${product.id}`}><Edit className="w-4 h-4" /></Link>
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sales" className="mt-6">
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Panel de ventas próximamente</p>
            </div>
          </TabsContent>
          <TabsContent value="purchases" className="mt-6">
             <div className="text-center py-12 border rounded-lg bg-muted/20">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Historial de compras próximamente</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
