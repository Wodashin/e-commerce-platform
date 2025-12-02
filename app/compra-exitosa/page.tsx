"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ShoppingBag, Home, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const confirmOrder = async () => {
        if (orderId) {
            try {
                // Llamar a nuestra API para confirmar y descontar stock
                await fetch('/api/orders/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                })
                clearCart() // Limpiar carrito local
            } catch (error) {
                console.error("Error confirmando orden", error)
            } finally {
                setProcessing(false)
            }
        } else {
            setProcessing(false)
        }
    }

    confirmOrder()
  }, [orderId, clearCart])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-10 space-y-6">
          
          {processing ? (
            <div className="flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                <h2 className="text-xl font-semibold">Confirmando tu compra...</h2>
                <p className="text-muted-foreground">Estamos registrando el pago y actualizando el stock.</p>
            </div>
          ) : (
            <>
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-green-700">¡Compra Exitosa!</h1>
                    <p className="text-muted-foreground">
                    Tu orden ha sido registrada correctamente.
                    </p>
                    {orderId && (
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded inline-block">
                            Orden #{orderId.slice(0, 8)}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
