"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ShoppingBag, Home } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  // Usamos el carrito para vaciarlo cuando la compra sale bien
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  // MercadoPago nos manda un ID en la URL al volver
  const paymentId = searchParams.get("payment_id")

  useEffect(() => {
    // Vaciar el carrito al cargar la página de éxito
    clearCart()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-10 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-700">¡Pago Exitoso!</h1>
            <p className="text-muted-foreground">
              Hemos recibido tu pedido correctamente.
            </p>
            {paymentId && (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded inline-block">
                    Referencia de pago: {paymentId}
                </p>
            )}
          </div>

          <div className="border-t pt-6 space-y-3">
            <Button className="w-full" asChild>
              <Link href="/productos">
                <ShoppingBag className="mr-2 h-4 w-4" /> Seguir Comprando
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Volver al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
