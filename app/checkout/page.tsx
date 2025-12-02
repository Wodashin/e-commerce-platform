"use client"

import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, MapPin } from "lucide-react"
import Link from "next/link"

const REGIONES = ["Metropolitana", "Valparaíso", "Biobío", "Araucanía", "Coquimbo", "O'Higgins", "Maule", "Los Lagos", "Antofagasta", "Los Ríos"]

export default function CheckoutPage() {
  const { items, cartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  
  // Costo de envío fijo (puedes mejorarlo luego con lógica por región)
  const shippingCost = 3500 
  const totalWithShipping = cartTotal + shippingCost

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rut: "",
    address: "",
    city: "",
    region: "",
  })

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Llamamos a nuestra API para crear la orden Y obtener el link de pago
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          buyerInfo: formData,
          shippingCost,
          total: totalWithShipping
        })
      })

      const data = await response.json()

      if (data.url) {
        // 2. Redirigimos a MercadoPago
        window.location.href = data.url
      } else {
        alert("Error al iniciar el pago: " + (data.error || "Desconocido"))
      }
    } catch (error) {
      console.error(error)
      alert("Hubo un problema de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl">Tu carrito está vacío</h2>
        <Button asChild><Link href="/productos">Volver a la tienda</Link></Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Formulario de Datos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Datos de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4" id="checkout-form">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input required placeholder="Juan Pérez" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>RUT</Label>
                    <Input required placeholder="12.345.678-9" value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input required type="email" placeholder="juan@mail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input required placeholder="+56 9 1234 5678" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Región</Label>
                    <Select onValueChange={(val) => setFormData({...formData, region: val})}>
                      <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                      <SelectContent>
                        {REGIONES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad / Comuna</Label>
                    <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dirección Exacta</Label>
                  <Input required placeholder="Av. Siempre Viva 742, Depto 101" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumen del Pedido */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between">
                    <span>{item.quantity}x {item.name} {item.size && `(${item.size})`}</span>
                    <span className="font-medium">${(item.price * item.quantity).toLocaleString("es-CL")}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cartTotal.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>${shippingCost.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total a Pagar</span>
                  <span className="text-green-600">${totalWithShipping.toLocaleString("es-CL")}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                size="lg" 
                disabled={loading || !formData.region}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2 h-5 w-5" />}
                {loading ? "Procesando..." : "Ir a Pagar con MercadoPago"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Serás redirigido a MercadoPago para completar la compra de forma segura.</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
