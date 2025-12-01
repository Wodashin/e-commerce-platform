"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const categories = [
  { name: "Figuras", count: 45, icon: "🎭" },
  { name: "Hogar", count: 32, icon: "🏠" },
  { name: "Accesorios", count: 28, icon: "📱" },
  { name: "Arquitectura", count: 15, icon: "🏗️" },
  { name: "Juguetes", count: 38, icon: "🧸" },
  { name: "Arte", count: 22, icon: "🎨" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-muted/50 to-muted/20 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Marketplace 3D Chile
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubre y compra productos únicos impresos en 3D. Desde figuras coleccionables hasta soluciones para el
            hogar.
          </p>
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/productos">Explorar Productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Categorías Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href={`/categoria/${category.name.toLowerCase()}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center p-4">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} productos</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Eres Diseñador 3D?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a nuestra comunidad y comienza a vender tus creaciones hoy mismo
          </p>
          <Button size="lg" asChild>
            <Link href="/registro-vendedor">Comenzar a Vender</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
