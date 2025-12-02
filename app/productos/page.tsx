import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ProductsClientPage from "./products-client-page"

export default async function ProductsPage() {
  const cookieStore = await cookies()
  
  // Conexión directa en el servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  // Consulta directa a la DB (sin pasar por fetch HTTP)
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles(full_name, avatar_url),
      product_variants(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error cargando productos:", error.message)
    // En caso de error, podríamos mostrar un array vacío o manejarlo
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 hidden lg:flex">
          <div>
            <h1 className="text-3xl font-bold mb-2">Productos 3D</h1>
            <p className="text-muted-foreground">Explora nuestra colección de productos impresos en 3D</p>
          </div>
        </div>
        
        {/* Pasamos los datos obtenidos directamente */}
        <ProductsClientPage initialProducts={products || []} />
      </div>
    </div>
  )
}
