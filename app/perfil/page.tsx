"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, Calendar, Package, Edit, Plus, User, Trash2, ExternalLink, Settings, ShoppingBag, Store, Clock } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  
  // Datos para Vendedores
  const [products, setProducts] = useState<any[]>([])
  
  // Datos para Clientes
  const [orders, setOrders] = useState<any[]>([])

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")

  // Cálculo de stock/precio para vista de vendedor
  const calculateTotals = (product: any) => {
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((acc: number, curr: any) => acc + (Number(curr.stock_quantity) || 0), 0);
    const minPrice = variants.length > 0 
      ? Math.min(...variants.map((v: any) => Number(v.unit_price))) 
      : (product.price || 0);
    return { totalStock, minPrice };
  }

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/")
        return
      }

      // 1. Obtener Perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || "")
        
        // 2. Si es VENDEDOR: Cargar sus productos
        if (profileData.role === 'vendor') {
            const { data: userProducts } = await supabase
            .from('products')
            .select('*, product_variants(*)')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })
            
            setProducts(userProducts || [])
        }

        // 3. CARGAR COMPRAS (Para todos):
        // Buscamos órdenes donde el buyer_info contenga el email del usuario
        // Nota: Como buyer_info es JSONB, usamos el filtro contains
        const { data: userOrders } = await supabase
            .from('orders')
            .select('*')
            .contains('buyer_info', { email: user.email }) 
            .order('created_at', { ascending: false })

        setOrders(userOrders || [])
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
  if (!profile) return null

  const isVendor = profile.role === 'vendor';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Cabecera de Perfil */}
        <Card className="mb-8 border-none shadow-md bg-gradient-to-r from-background to-muted/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {profile.full_name?.[0] || <User />}
                    </AvatarFallback>
                </Avatar>
                <Badge className={`absolute -bottom-2 -right-2 px-3 py-1 ${isVendor ? "bg-purple-600" : "bg-blue-600"}`}>
                    {isVendor ? "Vendedor Verificado" : "Cliente"}
                </Badge>
              </div>

              <div className="flex-1 w-full text-center md:text-left space-y-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {isEditing ? (
                    <div className="flex gap-2 w-full md:w-auto">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="max-w-xs" />
                      <Button onClick={handleUpdateProfile}>Guardar</Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    </div>
                  ) : (
                    <h1 className="text-4xl font-bold tracking-tight">{profile.full_name}</h1>
                  )}
                  
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                      <Settings className="w-4 h-4 mr-2" /> Editar Perfil
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                    <Mail className="w-4 h-4" /> {profile.email}
                  </span>
                  <span className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" /> Miembro desde {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Pestañas Dinámico */}
        <Tabs defaultValue={isVendor ? "vendor-panel" : "my-orders"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50">
            {isVendor ? (
                <TabsTrigger value="vendor-panel" className="text-base">Panel de Vendedor</TabsTrigger>
            ) : (
                <TabsTrigger value="my-orders" className="text-base">Mis Compras</TabsTrigger>
            )}
            <TabsTrigger value="account" className="text-base">Configuración de Cuenta</TabsTrigger>
          </TabsList>

          {/* ---------------- VISTA DE VENDEDOR ---------------- */}
          {isVendor && (
            <TabsContent value="vendor-panel" className="space-y-6 animate-in fade-in-50">
                {/* Métricas Rápidas (Ejemplo visual) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Productos Activos</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">--</div><p className="text-xs text-muted-foreground">Próximamente</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Calificación</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">5.0 ★</div></CardContent>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20 p-4 rounded-lg border">
                    <div>
                        <h3 className="font-semibold text-lg">Tu Inventario</h3>
                        <p className="text-sm text-muted-foreground">Gestiona tus productos publicados</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none" asChild>
                            <Link href="/mis-productos">
                                <Package className="w-4 h-4 mr-2" /> Gestión Avanzada
                            </Link>
                        </Button>
                        <Button className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700" asChild>
                            <Link href="/subir-producto">
                                <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                            <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-medium">Aún no has publicado productos</h3>
                            <p className="text-muted-foreground mb-4">¡Empieza a vender hoy mismo!</p>
                            <Button asChild><Link href="/subir-producto">Crear mi primer producto</Link></Button>
                        </div>
                    ) : (
                        products.map((product) => {
                            const { totalStock, minPrice } = calculateTotals(product);
                            return (
                                <Card key={product.id} className="group overflow-hidden hover:border-primary/50 transition-all">
                                    <div className="relative aspect-video bg-muted">
                                        {product.images?.[0] && (
                                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                                                <Link href={`/editar-producto/${product.id}`}><Edit className="w-4 h-4" /></Link>
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
                                            <span className="font-bold text-green-600">${minPrice?.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">Stock total: {totalStock}</p>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>
            </TabsContent>
          )}

          {/* ---------------- VISTA DE CLIENTE ---------------- */}
          {!isVendor && (
            <TabsContent value="my-orders" className="space-y-6 animate-in fade-in-50">
                {/* CTA para ser vendedor */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full"><Store className="w-6 h-6 text-primary" /></div>
                            <div>
                                <h3 className="font-bold text-lg">¿Eres diseñador o maker?</h3>
                                <p className="text-muted-foreground">Convierte tus creaciones en ingresos vendiendo en Marketplace 3D.</p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/registro-vendedor">Solicitar Cuenta de Vendedor</Link>
                        </Button>
                    </CardContent>
                </Card>

                <h3 className="text-2xl font-bold flex items-center gap-2 mt-8 mb-4">
                    <ShoppingBag className="w-6 h-6" /> Historial de Compras
                </h3>

                {orders.length === 0 ? (
                    <div className="text-center py-16 border rounded-lg bg-muted/10">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-lg font-medium">Aún no tienes compras</h3>
                        <p className="text-muted-foreground mb-4">Explora nuestro catálogo y encuentra algo único.</p>
                        <Button asChild variant="outline"><Link href="/productos">Ir a la Tienda</Link></Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <div className="bg-muted/30 p-4 flex flex-wrap gap-4 justify-between items-center text-sm border-b">
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-muted-foreground">Fecha del pedido</p>
                                            <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Total</p>
                                            <p className="font-medium">${Number(order.total_amount).toLocaleString("es-CL")}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Estado</p>
                                            <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                                                {order.status === 'paid' ? 'Pagado' : order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground font-mono text-xs">
                                        ID: {order.id.slice(0,8)}
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 rounded bg-muted border overflow-hidden shrink-0">
                                                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.size} x {item.quantity} un.
                                                    </p>
                                                </div>
                                                <div className="font-semibold text-right">
                                                    ${(item.price * item.quantity).toLocaleString("es-CL")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
          )}

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Cuenta</CardTitle>
                <CardDescription>Gestiona tu información personal y preferencias.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Nombre Completo</label>
                    <div className="flex gap-2">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!isEditing} />
                        {!isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}>Cambiar</Button>}
                    </div>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Correo Electrónico</label>
                    <Input value={profile.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">El correo no se puede cambiar por seguridad.</p>
                </div>
                
                {isEditing && (
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateProfile}>Guardar Cambios</Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
