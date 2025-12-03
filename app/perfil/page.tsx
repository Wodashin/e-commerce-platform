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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Mail, Calendar, Package, Edit, Plus, User, Trash2, Settings, ShoppingBag, Store, FileDown } from "lucide-react"
// NOTA: Se eliminaron los imports estáticos de jspdf aquí también

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  
  // Datos
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [salesStats, setSalesStats] = useState<any[]>([]) // Datos agrupados para el reporte
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/"); return }

      // 1. Perfil
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || "")
        
        // 2. Si es Vendedor: Cargar Productos y Ventas
        // Nota: Consideramos al Admin (ilyon3d) como vendedor también para que vea esto
        const isUserAdmin = user.email?.toLowerCase().includes("ilyon3d")
        if (profileData.role === 'vendor' || isUserAdmin) {
            // Productos
            const { data: userProducts } = await supabase
                .from('products')
                .select('*, product_variants(*)')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false })
            setProducts(userProducts || [])

            // Ventas (Buscamos en todas las órdenes pagadas)
            // Filtramos en JS los items que pertenecen a este vendedor
            const { data: allPaidOrders } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'paid')
                .order('created_at', { ascending: false })

            processSales(allPaidOrders || [], user.id, isUserAdmin ? 'admin' : 'vendor')
        }

        // 3. Compras (Cliente)
        const { data: userOrders } = await supabase
            .from('orders')
            .select('*')
            .contains('buyer_info', { email: user.email }) 
            .order('created_at', { ascending: false })
        setOrders(userOrders || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Lógica de Agrupación para Reportes
  const processSales = (ordersList: any[], userId: string, role: string) => {
    const stats: Record<string, { name: string, quantity: number, total: number }> = {}

    ordersList.forEach(order => {
        // Filtrar por mes seleccionado (opcional, aquí simplificado tomamos todo o filtramos en render)
        const orderDate = new Date(order.created_at)
        
        order.items.forEach((item: any) => {
            // Si soy admin, veo todo. Si soy vendedor, solo mis items.
            if (role === 'admin' || item.sellerId === userId) {
                const key = item.name + (item.size ? ` (${item.size})` : '')
                
                if (!stats[key]) {
                    stats[key] = { name: key, quantity: 0, total: 0 }
                }
                stats[key].quantity += Number(item.quantity)
                stats[key].total += Number(item.price) * Number(item.quantity)
            }
        })
    })

    // Convertir objeto a array
    setSalesStats(Object.values(stats))
  }

  // --- CORRECCIÓN AQUÍ: Importación Dinámica ---
  const generatePDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()
      
      doc.setFontSize(18)
      doc.text("Reporte de Ventas - Marketplace 3D", 14, 22)
      doc.setFontSize(11)
      doc.text(`Generado por: ${profile.full_name}`, 14, 30)
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36)

      const tableData = salesStats.map(stat => [
          stat.name,
          stat.quantity,
          `$${stat.total.toLocaleString("es-CL")}`
      ])

      // Calcular gran total
      const grandTotal = salesStats.reduce((acc, curr) => acc + curr.total, 0)
      tableData.push(["TOTAL FINAL", "", `$${grandTotal.toLocaleString("es-CL")}`])

      autoTable(doc, {
          head: [['Producto / Variante', 'Cantidad Vendida', 'Total Ingresos']],
          body: tableData,
          startY: 44,
      })

      doc.save(`reporte_ventas_${new Date().toISOString().slice(0,10)}.pdf`)
    } catch (error) {
      console.error("Error generando PDF", error)
      alert("No se pudo generar el PDF. Por favor intenta de nuevo.")
    }
  }

  useEffect(() => { fetchData() }, [])

  // ... (Funciones auxiliares: handleDeleteProduct, handleUpdateProfile, calculateTotals) ...
  const handleDeleteProduct = async (id: string) => {
    if(!confirm("¿Borrar producto?")) return;
    await supabase.from('products').delete().eq('id', id)
    fetchData() 
  }
  const handleUpdateProfile = async () => {
    if (!profile) return
    await supabase.from('profiles').update({ full_name: editName }).eq('id', profile.id)
    setProfile({ ...profile, full_name: editName })
    setIsEditing(false)
  }
  const calculateTotals = (product: any) => {
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((acc: number, curr: any) => acc + (Number(curr.stock_quantity) || 0), 0);
    const minPrice = variants.length > 0 ? Math.min(...variants.map((v: any) => Number(v.unit_price))) : (product.price || 0);
    return { totalStock, minPrice };
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
  if (!profile) return null

  const isVendor = profile.role === 'vendor' || profile.email?.toLowerCase().includes("ilyon3d");

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Cabecera */}
        <Card className="mb-8 border-none shadow-md bg-gradient-to-r from-background to-muted/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">{profile.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <Badge className={`absolute -bottom-2 -right-2 px-3 py-1 ${isVendor ? "bg-purple-600" : "bg-blue-600"}`}>
                    {isVendor ? "Vendedor Verificado" : "Cliente"}
                </Badge>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {isEditing ? (
                        <div className="flex gap-2"><Input value={editName} onChange={e=>setEditName(e.target.value)} /><Button onClick={handleUpdateProfile}>Guardar</Button></div>
                    ) : <h1 className="text-4xl font-bold">{profile.full_name}</h1>}
                    {!isEditing && <Button variant="outline" size="sm" onClick={()=>setIsEditing(true)}><Settings className="w-4 h-4 mr-2"/> Editar</Button>}
                 </div>
                 <div className="text-sm text-muted-foreground"><Mail className="inline w-4 h-4 mr-1"/> {profile.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={isVendor ? "vendor-panel" : "my-orders"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
            {isVendor ? <TabsTrigger value="vendor-panel">Panel de Vendedor</TabsTrigger> : <TabsTrigger value="my-orders">Mis Compras</TabsTrigger>}
            <TabsTrigger value="account">Configuración</TabsTrigger>
          </TabsList>

          {/* PANEL VENDEDOR CON REPORTES */}
          {isVendor && (
            <TabsContent value="vendor-panel" className="space-y-8">
                
                {/* SECCIÓN DE REPORTES */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Resumen de Ventas</span>
                            <Button variant="outline" onClick={generatePDF} disabled={salesStats.length === 0}>
                                <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
                            </Button>
                        </CardTitle>
                        <CardDescription>Ventas consolidadas por producto (Solo órdenes pagadas)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {salesStats.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No hay ventas registradas aún.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto / Variante</TableHead>
                                        <TableHead className="text-center">Cant. Vendida</TableHead>
                                        <TableHead className="text-right">Total Generado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesStats.map((stat, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{stat.name}</TableCell>
                                            <TableCell className="text-center">{stat.quantity}</TableCell>
                                            <TableCell className="text-right text-green-600 font-bold">
                                                ${stat.total.toLocaleString("es-CL")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell>TOTAL</TableCell>
                                        <TableCell className="text-center">{salesStats.reduce((a,b)=>a+b.quantity,0)}</TableCell>
                                        <TableCell className="text-right">${salesStats.reduce((a,b)=>a+b.total,0).toLocaleString("es-CL")}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* SECCIÓN INVENTARIO (Simplificada para el ejemplo) */}
                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg">Tu Inventario ({products.length})</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild><Link href="/mis-productos">Gestión Completa</Link></Button>
                        <Button className="bg-green-600 hover:bg-green-700" asChild><Link href="/subir-producto">Nuevo</Link></Button>
                    </div>
                </div>
            </TabsContent>
          )}

          {/* VISTA CLIENTE */}
          {!isVendor && (
            <TabsContent value="my-orders" className="space-y-6">
                <Card className="bg-primary/5 border-primary/20 p-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">¿Vendes productos 3D?</h3>
                        <p className="text-muted-foreground">Únete a nuestra comunidad de vendedores.</p>
                    </div>
                    <Button asChild><Link href="/registro-vendedor">Empezar a Vender</Link></Button>
                </Card>
                {/* Historial de compras (Código igual al anterior) */}
                {orders.length === 0 ? <div className="text-center py-10">No tienes compras aún.</div> : (
                    orders.map(order => (
                        <Card key={order.id} className="p-4 mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                <Badge>{order.status}</Badge>
                            </div>
                            <div className="font-bold text-lg text-right">${order.total_amount}</div>
                        </Card>
                    ))
                )}
            </TabsContent>
          )}

          <TabsContent value="account">
             <Card><CardContent className="p-6 text-center text-muted-foreground">Opciones de cuenta...</CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
