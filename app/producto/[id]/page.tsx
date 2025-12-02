import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductDetailClient from './product-detail-client'

// En Next.js 15, params es una promesa que debemos esperar
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Resolvemos el ID de la URL
  const { id } = await params

  // 2. Cliente Supabase (Servidor)
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 3. Obtener el producto + datos del vendedor
  const { data: product, error } = await supabase
    .from('products')
    .select('*, seller:profiles(full_name, avatar_url, created_at)')
    .eq('id', id)
    .single()

  // 4. Si hay error o no existe, mostramos página 404
  if (error || !product) {
    console.error("Error fetching product details:", error)
    return notFound()
  }

  // 5. Renderizar el cliente con los datos listos
  return (
    <div className="min-h-screen bg-background py-8">
      <ProductDetailClient product={product} />
    </div>
  )
}
