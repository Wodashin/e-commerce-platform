import { headers } from "next/headers"
import ProductsClientPage from "./products-client-page"

// Esta función se ejecuta en el servidor para obtener los datos
async function getProducts() {
  try {
    // Detectamos el host actual dinámicamente para construir la URL absoluta
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    
    // Llamada a tu API interna usando URL absoluta
    const res = await fetch(`${protocol}://${host}/api/products`, { 
      cache: 'no-store' // Para asegurar que siempre traiga datos frescos
    })
    
    if (!res.ok) {
      console.error("Error fetching products:", res.status)
      return []
    }
    
    return res.json()
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 hidden lg:flex">
          <div>
            <h1 className="text-3xl font-bold mb-2">Productos 3D</h1>
            <p className="text-muted-foreground">Explora nuestra colección de productos impresos en 3D</p>
          </div>
        </div>
        
        {/* Pasamos los datos al componente cliente */}
        <ProductsClientPage initialProducts={products} />
      </div>
    </div>
  )
}
