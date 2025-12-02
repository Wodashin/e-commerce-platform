"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"

export function CartSheet() {
  const { items, removeItem, updateQuantity, cartTotal, cartCount } = useCart()

  const handleCheckout = () => {
    // Generar mensaje detallado para WhatsApp
    const itemsList = items
      .map((i) => `• ${i.quantity}x ${i.name} ${i.size ? `(${i.size})` : ""} - $${(i.price * i.quantity).toLocaleString("es-CL")}`)
      .join("\n")
    
    const totalMsg = `\n\n*Total a pagar: $${cartTotal.toLocaleString("es-CL")}*`
    const finalMsg = `Hola! Quiero realizar el siguiente pedido:\n\n${itemsList}${totalMsg}`
    
    // Número por defecto (puedes cambiarlo)
    window.open(`https://wa.me/56948842564?text=${encodeURIComponent(finalMsg)}`, "_blank")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Tu Carrito ({cartCount})</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
            <p>El carrito está vacío</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b pb-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted border shrink-0">
                      <Image 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                      {item.size && <p className="text-xs text-muted-foreground">Talla: {item.size}</p>}
                      <p className="text-sm font-bold text-green-600">${item.price.toLocaleString("es-CL")}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-auto text-red-500 hover:bg-red-50"
                          onClick={() => removeItem(item.id, item.size)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${cartTotal.toLocaleString("es-CL")}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Finalizar Compra por WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
