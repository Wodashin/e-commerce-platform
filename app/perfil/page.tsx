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
import { Loader2, Mail, Calendar, Package, Edit, Plus, User, Trash2, ExternalLink, Settings } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/")
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || "")
        
        const { data: userProducts } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
        
        setProducts(userProducts || [])
      }
    } catch (error) {
      console.error("Error cargando perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteProduct = async (id: string) => {
    if(!confirm("¿Borrar producto permanentemente?")) return;
    await supabase.from('products').delete().eq('id', id)
    fetchData() 
  }

  const handleUpdateProfile = async () => {
    if (!profile) return
    await supabase.from('profiles').update({ full_name: editName }).eq('id', profile.id)
    setProfile({ ...profile, full_name: editName })
    setIsEditing(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!profile) return null

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Tarjeta de Usuario */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-2 border-muted">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.full_name?.[0] || <User />}
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
                  <Badge variant="outline">{profile.role === 'vendor' ? "Vendedor" : "Usuario"}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pestañas */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="products">Mis Publicaciones ({products.length})</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Barra de Acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-muted/20 p-4 rounded-lg border gap-4">
              <div>
                <h3 className="font-semibold">Gestión Rápida</h3>
                <p className="text-sm text-muted-foreground">Vista previa de tus últimos productos</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none" asChild>
                    <Link href="/mis-productos">
                        <Settings className="w-4 h-4 mr-2" /> Gestión de Inventario
                    </Link>
                </Button>
                <Button className="flex-1 sm:flex-none" asChild>
                    <Link href="/subir-producto">
                        <Plus className="w-4 h-4 mr-2" /> Publicar Nuevo
                    </Link>
                </Button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No tienes publicaciones activas</h3>
                <p className="text-muted-foreground mb-4">Sube tu primer diseño 3D para comenzar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="group overflow-hidden hover:border-primary/50 transition-all">
                    <div className="relative aspect-video bg-muted">
                      {product.images?.[0] && (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                            <Link href={`/editar-producto/${product.id}`}>
                                <Edit className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="secondary">{product.category}</Badge>
                        <span className="font-bold text-green-600">${product.price?.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/editar-producto/${product.id}`}>Editar</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/producto/${product.id}`}><ExternalLink className="w-4 h-4" /></Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>Opciones de cuenta próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
