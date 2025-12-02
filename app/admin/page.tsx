"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Loader2, ShieldAlert, FileDown, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function AdminPanel() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [salesStats, setSalesStats] = useState<any[]>([])
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Seguridad: Solo el email admin
    if (!user || !user.email?.toLowerCase().includes("ilyon3d")) {
      setLoading(false)
      return 
    }

    setIsAuthorized(true)

    // 1. Obtener solicitudes pendientes
    const { data: reqs } = await supabase.from('profiles').select('*').eq('vendor_status', 'pending')
    setRequests(reqs || [])

    // 2. Obtener TODAS las ventas pagadas para reporte global
    const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'paid')
    
    processGlobalSales(allOrders || [])
    
    setLoading(false)
  }

  // Agrupación global (Items iguales se suman, sin importar el vendedor)
  const processGlobalSales = (ordersList: any[]) => {
    const stats: Record<string, { name: string, quantity: number, total: number }> = {}

    ordersList.forEach(order => {
        order.items.forEach((item: any) => {
            const key = item.name + (item.size ? ` (${item.size})` : '')
            if (!stats[key]) {
                stats[key] = { name: key, quantity: 0, total: 0 }
            }
            stats[key].quantity += Number(item.quantity)
            stats[key].total += Number(item.price) * Number(item.quantity)
        })
    })
    setSalesStats(Object.values(stats))
  }

  const generateAdminPDF = () => {
    const doc = new jsPDF()
    doc.text("Reporte GLOBAL de Ventas - Admin", 14, 22)
    doc.setFontSize(10)
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30)

    const tableData = salesStats.map(s => [s.name, s.quantity, `$${s.total.toLocaleString("es-CL")}`])
    const grandTotal = salesStats.reduce((a,b)=>a+b.total,0)
    tableData.push(["TOTAL PLATAFORMA", "", `$${grandTotal.toLocaleString("es-CL")}`])

    autoTable(doc, { head: [['Producto', 'Cant.', 'Total']], body: tableData, startY: 40 })
    doc.save("reporte_admin_global.pdf")
  }

  const handleDecision = async (userId: string, approved: boolean) => {
    if(!confirm(`¿Confirmas ${approved ? "APROBAR" : "RECHAZAR"}?`)) return;
    const { error } = await supabase.from('profiles')
      .update({ role: approved ? 'vendor' : 'user', vendor_status: approved ? 'approved' : 'rejected' })
      .eq('id', userId)

    if (!error) {
      setRequests(requests.filter(r => r.id !== userId))
      alert("Listo")
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  if (!isAuthorized) return (
      <div className="h-screen flex flex-col items-center justify-center text-red-600 gap-4">
        <ShieldAlert className="w-16 h-16" /><h1 className="text-2xl font-bold">Acceso Restringido</h1>
        <Button onClick={() => router.push("/")}>Volver</Button>
      </div>
  )

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
        
        <Tabs defaultValue="requests">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="requests">Solicitudes ({requests.length})</TabsTrigger>
                <TabsTrigger value="finance">Reporte Financiero</TabsTrigger>
            </TabsList>

            {/* Pestaña Solicitudes */}
            <TabsContent value="requests" className="space-y-4">
                {requests.length === 0 ? (
                    <Card><CardContent className="p-12 text-center text-muted-foreground">No hay solicitudes pendientes.</CardContent></Card>
                ) : (
                    requests.map((req) => (
                    <Card key={req.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>{req.business_info?.businessName || "Sin nombre"}</CardTitle>
                            <p className="text-sm text-muted-foreground">Usuario: {req.full_name} ({req.email})</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                        </CardHeader>
                        <CardContent>
                        <div className="flex gap-4">
                            <Button className="flex-1 bg-green-600" onClick={() => handleDecision(req.id, true)}><CheckCircle className="w-4 h-4 mr-2" /> Aprobar</Button>
                            <Button variant="destructive" className="flex-1" onClick={() => handleDecision(req.id, false)}><XCircle className="w-4 h-4 mr-2" /> Rechazar</Button>
                        </div>
                        </CardContent>
                    </Card>
                    ))
                )}
            </TabsContent>

            {/* Pestaña Financiera (NUEVA) */}
            <TabsContent value="finance">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <div className="flex items-center gap-2"><TrendingUp className="text-green-600"/> Transparencia Financiera</div>
                            <Button variant="outline" onClick={generateAdminPDF} disabled={salesStats.length === 0}>
                                <FileDown className="w-4 h-4 mr-2" /> Descargar Reporte Oficial
                            </Button>
                        </CardTitle>
                        <CardDescription>Resumen consolidado de todas las ventas de la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-center">Unidades</TableHead>
                                    <TableHead className="text-right">Volumen Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesStats.map((stat, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{stat.name}</TableCell>
                                        <TableCell className="text-center">{stat.quantity}</TableCell>
                                        <TableCell className="text-right font-mono">${stat.total.toLocaleString("es-CL")}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-muted font-bold text-lg">
                                    <TableCell>TOTAL ACUMULADO</TableCell>
                                    <TableCell className="text-center">{salesStats.reduce((a,b)=>a+b.quantity,0)}</TableCell>
                                    <TableCell className="text-right text-green-700">${salesStats.reduce((a,b)=>a+b.total,0).toLocaleString("es-CL")}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
