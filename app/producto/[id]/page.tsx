import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductDetailClient from './product-detail-client'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  // AQUÍ ESTÁ EL CAMBIO: agregamos product_variants(*) a la consulta
  const { data: product, error } = await supabase
    .from('products')
    .select('*, seller:profiles(full_name, avatar_url, created_at), product_variants(*)')
    .eq('id', id)
    .single()

  if (error || !product) {
    console.error("Error fetching product details:", error)
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <ProductDetailClient product={product} />
    </div>
  )
}
