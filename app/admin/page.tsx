"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Users, ShoppingBag, AlertTriangle, CheckCircle, XCircle, Eye, Ban, UserCheck, MapPin } from "lucide-react"

// Simulated data
const pendingVendors = [
  {
    id: 1,
    name: "Juan Carlos Pérez González",
    email: "juan.perez@email.com",
    phone: "+56912345678",
    rut: "12.345.678-9",
    businessName: "3D Designs JC",
    location: "Santiago, Región Metropolitana",
    registrationDate: "2024-01-15",
    documents: ["cedula_frente.jpg", "cedula_atras.jpg", "comprobante_domicilio.pdf"],
    paymentMethod: "MercadoPago",
    mercadopagoEmail: "juan.perez@email.com",
    status: "pending",
  },
  {
    id: 2,
    name: "María Elena Rodríguez Silva",
    email: "maria.rodriguez@email.com",
    phone: "+56987654321",
    rut: "98.765.432-1",
    businessName: "Creative 3D Studio",
    location: "Valparaíso, Región de Valparaíso",
    registrationDate: "2024-01-14",
    documents: ["cedula_frente.jpg", "cedula_atras.jpg"],
    paymentMethod: "Transferencia",
    bankAccount: "Banco de Chile - Cuenta Corriente",
    status: "pending",
  },
]

const activeVendors = [
  {
    id: 3,
    name: "Diego Martínez López",
    email: "diego.martinez@email.com",
    phone: "+56911111111",
    rut: "11.111.111-1",
    businessName: "3D Master CL",
    location: "Concepción, Región del Biobío",
    joinDate: "2023-12-01",
    totalSales: 45,
    totalRevenue: 1250000,
    rating: 4.8,
    products: 23,
    status: "active",
    paymentMethod: "MercadoPago",
    lastActivity: "2024-01-15",
  },
  {
    id: 4,
    name: "Ana Patricia Soto Morales",
    email: "ana.soto@email.com",
    phone: "+56922222222",
    rut: "22.222.222-2",
    businessName: "Design Pro 3D",
    location: "La Serena, Región de Coquimbo",
    joinDate: "2023-11-15",
    totalSales: 32,
    totalRevenue: 890000,
    rating: 4.9,
    products: 18,
    status: "active",
    paymentMethod: "Transferencia",
    lastActivity: "2024-01-14",
  },
]

const reports = [
  {
    id: 1,
    vendorId: 5,
    vendorName: "Carlos Estafador",
    reporterName: "Cliente Afectado",
    reason: "No envió el producto después del pago",
    description: "Pagué hace 2 semanas y no he recibido el producto. El vendedor no responde mensajes.",
    date: "2024-01-10",
    status: "investigating",
    evidence: ["screenshot_pago.jpg", "conversacion_whatsapp.pdf"],
  },
  {
    id: 2,
    vendorId: 6,
    vendorName: "Pedro Malo",
    reporterName: "Usuario Molesto",
    reason: "Producto de mala calidad",
    description: "El producto llegó roto y mal impreso. No se parece a las fotos.",
    date: "2024-01-12",
    status: "resolved",
    evidence: ["producto_roto.jpg"],
  },
]

export default function AdminPanel() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [banReason, setBanReason] = useState("")

  const approveVendor = (vendorId: number) => {
    console.log(`Aprobando vendedor ${vendorId}`)
    // Aquí iría la lógica para aprobar el vendedor
  }

  const rejectVendor = (vendorId: number, reason: string) => {
    console.log(`Rechazando vendedor ${vendorId}: ${reason}`)
    // Aquí iría la lógica para rechazar el vendedor
  }

  const banVendor = (vendorId: number, reason: string) => {
    console.log(`Baneando vendedor ${vendorId}: ${reason}`)
    // Aquí iría la lógica para banear el vendedor
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona vendedores, productos y reportes de la plataforma</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Pendientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingVendors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeVendors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes Abiertos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reports.filter((r) => r.status === "investigating").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeVendors.reduce((sum, vendor) => sum + vendor.products, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Vendedores Pendientes</TabsTrigger>
            <TabsTrigger value="active">Vendedores Activos</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Pending Vendors */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Vendedores Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>RUT</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Método de Pago</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-muted-foreground">{vendor.businessName}</div>
                            <div className="text-sm text-muted-foreground">{vendor.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{vendor.rut}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                            {vendor.location}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(vendor.registrationDate).toLocaleDateString("es-CL")}</TableCell>
                        <TableCell>
                          <Badge variant={vendor.paymentMethod === "MercadoPago" ? "default" : "secondary"}>
                            {vendor.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedVendor(vendor)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalles del Vendedor</DialogTitle>
                                  <DialogDescription>
                                    Revisa la información del vendedor antes de aprobar o rechazar
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedVendor && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Nombre Completo</label>
                                        <p className="text-sm">{selectedVendor.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">RUT</label>
                                        <p className="text-sm font-mono">{selectedVendor.rut}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <p className="text-sm">{selectedVendor.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Teléfono</label>
                                        <p className="text-sm">{selectedVendor.phone}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Nombre del Negocio</label>
                                        <p className="text-sm">{selectedVendor.businessName}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Ubicación</label>
                                        <p className="text-sm">{selectedVendor.location}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">Método de Pago</label>
                                      <div className="mt-1">
                                        <Badge
                                          variant={
                                            selectedVendor.paymentMethod === "MercadoPago" ? "default" : "secondary"
                                          }
                                        >
                                          {selectedVendor.paymentMethod}
                                        </Badge>
                                        {selectedVendor.paymentMethod === "MercadoPago" && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            Email MercadoPago: {selectedVendor.mercadopagoEmail}
                                          </p>
                                        )}
                                        {selectedVendor.paymentMethod === "Transferencia" && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            Cuenta: {selectedVendor.bankAccount}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">Documentos Subidos</label>
                                      <div className="mt-2 space-y-1">
                                        {selectedVendor.documents.map((doc: string, index: number) => (
                                          <div key={index} className="flex items-center text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                            {doc}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex space-x-2 pt-4">
                                      <Button onClick={() => approveVendor(selectedVendor.id)} className="flex-1">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Aprobar Vendedor
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive" className="flex-1">
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Rechazar
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>¿Rechazar Vendedor?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Esta acción rechazará la solicitud del vendedor. Proporciona una razón:
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <Textarea
                                            placeholder="Razón del rechazo..."
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                          />
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => rejectVendor(selectedVendor.id, banReason)}
                                            >
                                              Rechazar
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Vendors */}
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendedores Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>RUT</TableHead>
                      <TableHead>Ventas</TableHead>
                      <TableHead>Ingresos</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Última Actividad</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-muted-foreground">{vendor.businessName}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{vendor.rut}</TableCell>
                        <TableCell>{vendor.totalSales}</TableCell>
                        <TableCell>${vendor.totalRevenue.toLocaleString("es-CL")}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-yellow-500 mr-1" />
                            {vendor.rating}
                          </div>
                        </TableCell>
                        <TableCell>{vendor.products}</TableCell>
                        <TableCell>{new Date(vendor.lastActivity).toLocaleDateString("es-CL")}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Ban className="w-4 h-4 mr-1" />
                                Banear
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Banear Vendedor?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción baneará permanentemente al vendedor {vendor.name}. Proporciona una razón
                                  detallada:
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Textarea
                                placeholder="Razón del baneo (requerido)..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => banVendor(vendor.id, banReason)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Banear Vendedor
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reportes de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor Reportado</TableHead>
                      <TableHead>Reportado por</TableHead>
                      <TableHead>Razón</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.vendorName}</TableCell>
                        <TableCell>{report.reporterName}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString("es-CL")}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "investigating" ? "destructive" : "default"}>
                            {report.status === "investigating" ? "Investigando" : "Resuelto"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Ver Detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalles del Reporte</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Descripción</label>
                                  <p className="text-sm mt-1">{report.description}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Evidencia</label>
                                  <div className="mt-1 space-y-1">
                                    {report.evidence.map((evidence, index) => (
                                      <div key={index} className="flex items-center text-sm">
                                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                                        {evidence}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {report.status === "investigating" && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                      Marcar como Resuelto
                                    </Button>
                                    <Button variant="destructive" className="flex-1">
                                      Banear Vendedor
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
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
