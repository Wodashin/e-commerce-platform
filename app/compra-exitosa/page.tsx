"use client"

import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ShoppingBag, Home, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

// 1. Componente interno con la lógica que usa useSearchParams
function SuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  // Buscamos order_id (nuestro) o payment_id (si MP lo manda directo)
  const orderId = searchParams.get("order_id") || searchParams.get("payment_id")
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const confirmOrder = async () => {
        if (orderId) {
            try {
                // Confirmar orden y descontar stock
                await fetch('/api/orders/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                })
                clearCart()
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
                          Ref: {orderId.slice(0, 8)}
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
  )
}

// 2. Componente principal que envuelve todo en Suspense
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={<div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Cargando...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
