"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type CartItem = {
  id: string
  variantId?: string // <--- ¡AQUÍ ESTÁ EL CAMBIO! Nueva propiedad opcional
  name: string
  price: number
  image: string
  size?: string
  quantity: number
  sellerId?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string) => void
  updateQuantity: (id: string, size: string | undefined, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("shopping-cart")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (e) {
          console.error("Error parsing cart", e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("shopping-cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      // Usamos tanto ID de producto como VariantID (o size) para identificar únicos
      const existing = prev.find((i) => i.id === newItem.id && i.size === newItem.size)
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id && i.size === newItem.size
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)))
  }

  const updateQuantity = (id: string, size: string | undefined, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.size === size ? { ...i, quantity: Math.max(1, quantity) } : i))
    )
  }

  const clearCart = () => setItems([])

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
