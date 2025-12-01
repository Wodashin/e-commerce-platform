"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail,
  MapPin,
  Calendar,
  Star,
  Package,
  ShoppingCart,
  Heart,
  Edit,
  Plus,
  Eye,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Store,
} from "lucide-react"

// Simulated user data
const userData = {
  id: 1,
  name: "Juan Carlos Pérez",
  email: "juan.perez@email.com",
  phone: "+56912345678",
  avatar: "/placeholder.svg?height=100&width=100",
  location: "Santiago, Chile",
  joinDate: "2023-11-15",
  isVendor: true,
  vendorStatus: "active", // pending, active, rejected, banned
  vendorInfo: {
    businessName: "3D Master CL",
    rating: 4.8,
    totalSales: 45,
    totalRevenue: 1250000,
    productsCount: 23,
    reviewsCount: 38,
  },
}

const userProducts = [
  {
    id: 1,
    title: "Figura Dragon Ball Z - Goku",
    price: 25000,
    image: "/placeholder.svg?height=200&width=200",
    status: "active",
    views: 156,
    likes: 23,
    sales: 8,
  },
  {
    id: 2,
    title: "Soporte para Celular",
    price: 4500,
    image: "/placeholder.svg?height=200&width=200",
    status: "active",
    views: 234,
    likes: 41,
    sales: 15,
  },
  {
    id: 3,
    title: "Maceta Decorativa",
    price: 8500,
    image: "/placeholder.svg?height=200&width=200",
    status: "paused",
    views: 89,
    likes: 15,
    sales: 3,
  },
]

const favoriteProducts = [
  {
    id: 4,
    title: "Lámpara LED Personalizable",
    price: 18000,
    image: "/placeholder.svg?height=200&width=200",
    seller: "LightDesign3D",
  },
  {
    id: 5,
    title: "Organizador de Escritorio",
    price: 12000,
    image: "/placeholder.svg?height=200&width=200",
    seller: "OrganizePro3D",
  },
]

const purchaseHistory = [
  {
    id: 1,
    title: "Figura Vegeta Super Saiyan",
    price: 27000,
    image: "/placeholder.svg?height=100&width=100",
    seller: "AnimeDesigns3D",
    date: "2024-01-10",
    status: "delivered",
  },
  {
    id: 2,
    title: "Set Esferas del Dragón",
    price: 35000,
    image: "/placeholder.svg?height=100&width=100",
    seller: "CollectiblesPro",
    date: "2024-01-05",
    status: "delivered",
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    location: userData.location,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activo</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "paused":
        return <Badge variant="secondary">Pausado</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>
      case "banned":
        return <Badge variant="destructive">Baneado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getVendorStatusMessage = () => {
    switch (userData.vendorStatus) {
      case "active":
        return {
          type: "success",
          message: "¡Eres un vendedor verificado! Puedes gestionar tus productos y ventas.",
        }
      case "pending":
        return {
          type: "warning",
          message: "Tu solicitud de vendedor está siendo revisada. Te contactaremos pronto.",
        }
      case "rejected":
        return {
          type: "error",
          message: "Tu solicitud de vendedor fue rechazada. Contacta soporte para más información.",
        }
      case "banned":
        return {
          type: "error",
          message: "Tu cuenta de vendedor ha sido suspendida. Contacta soporte.",
        }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {userData.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {userData.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Miembro desde {new Date(userData.joinDate).toLocaleDateString("es-CL")}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="mt-4 md:mt-0">
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancelar" : "Editar Perfil"}
                  </Button>
                </div>

                {/* Vendor Status */}
                {userData.isVendor && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-primary" />
                      <span className="font-medium">Vendedor:</span>
                      {getStatusBadge(userData.vendorStatus)}
                    </div>
                    {userData.vendorStatus === "active" && userData.vendorInfo && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {userData.vendorInfo.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {userData.vendorInfo.productsCount} productos
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          {userData.vendorInfo.totalSales} ventas
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vendor Status Alert */}
                {userData.isVendor && getVendorStatusMessage() && (
                  <Alert
                    className={`${
                      getVendorStatusMessage()?.type === "success"
                        ? "border-green-500"
                        : getVendorStatusMessage()?.type === "warning"
                          ? "border-yellow-500"
                          : "border-red-500"
                    }`}
                  >
                    {getVendorStatusMessage()?.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {getVendorStatusMessage()?.type === "warning" && <Clock className="h-4 w-4 text-yellow-600" />}
                    {getVendorStatusMessage()?.type === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                    <AlertDescription>{getVendorStatusMessage()?.message}</AlertDescription>
                  </Alert>
                )}

                {/* Become Vendor CTA */}
                {!userData.isVendor && (
                  <Alert>
                    <Store className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>¿Quieres vender tus productos 3D? Únete como vendedor y comienza a generar ingresos.</span>
                      <Button size="sm" asChild>
                        <Link href="/registro-vendedor">
                          <Plus className="w-4 h-4 mr-1" />
                          Ser Vendedor
                        </Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setIsEditing(false)}>Guardar Cambios</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">Mis Productos</TabsTrigger>
            <TabsTrigger value="purchases">Compras</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {userData.isVendor && userData.vendorStatus === "active" && userData.vendorInfo && (
              <>
                {/* Vendor Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ${userData.vendorInfo.totalRevenue.toLocaleString("es-CL")}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userData.vendorInfo.totalSales}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userData.vendorInfo.productsCount}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        {userData.vendorInfo.rating}
                        <Star className="w-5 h-5 text-yellow-500 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions for Vendors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button asChild className="h-auto p-4">
                        <Link href="/vender" className="flex flex-col items-center gap-2">
                          <Plus className="w-6 h-6" />
                          <span>Agregar Producto</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="h-auto p-4 bg-transparent">
                        <Link href="/mis-productos" className="flex flex-col items-center gap-2">
                          <Package className="w-6 h-6" />
                          <span>Gestionar Productos</span>
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="h-auto p-4 bg-transparent">
                        <Link href="/mis-ventas" className="flex flex-col items-center gap-2">
                          <TrendingUp className="w-6 h-6" />
                          <span>Ver Estadísticas</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Producto "Figura Dragon Ball Z" recibió 3 nuevos likes</span>
                    <span className="text-xs text-muted-foreground ml-auto">Hace 2 horas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Nueva venta: "Soporte para Celular"</span>
                    <span className="text-xs text-muted-foreground ml-auto">Hace 1 día</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Recibiste una nueva reseña de 5 estrellas</span>
                    <span className="text-xs text-muted-foreground ml-auto">Hace 2 días</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {userData.isVendor && userData.vendorStatus === "active" ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Mis Productos</h2>
                  <Button asChild>
                    <Link href="/vender">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Producto
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">{getStatusBadge(product.status)}</div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                        <p className="text-2xl font-bold text-green-600 mb-3">
                          ${product.price.toLocaleString("es-CL")}
                        </p>
                        <div className="flex justify-between text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {product.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {product.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="w-4 h-4" />
                            {product.sales}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">¿Quieres vender productos 3D?</h3>
                  <p className="text-muted-foreground mb-6">
                    Únete como vendedor y comienza a generar ingresos con tus diseños únicos
                  </p>
                  <Button asChild>
                    <Link href="/registro-vendedor">
                      <Plus className="w-4 h-4 mr-2" />
                      Convertirse en Vendedor
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <h2 className="text-2xl font-bold">Historial de Compras</h2>
            <div className="space-y-4">
              {purchaseHistory.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src={purchase.image || "/placeholder.svg"}
                        alt={purchase.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{purchase.title}</h3>
                        <p className="text-sm text-muted-foreground">por {purchase.seller}</p>
                        <p className="text-lg font-bold text-green-600">${purchase.price.toLocaleString("es-CL")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(purchase.date).toLocaleDateString("es-CL")}
                        </p>
                        <Badge className="bg-green-500">Entregado</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-2xl font-bold">Productos Favoritos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">por {product.seller}</p>
                    <p className="text-2xl font-bold text-green-600 mb-3">${product.price.toLocaleString("es-CL")}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/producto/${product.id}`}>Ver Producto</Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
