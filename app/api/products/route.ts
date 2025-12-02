import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

// GET: Trae productos CON sus variantes (JOIN)
export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: products, error } = await supabase
    .from('products')
    .select('*, seller:profiles(full_name, avatar_url), product_variants(*)') 
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(products)
}

// POST: Crear SOLO la fila principal del producto
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: body.name,
        category: body.category,
        description: body.description,
        price: body.price, // Precio base para mostrar "Desde X"
        images: body.images,
        tags: body.tags,
        seller_id: user.id
      }])
      .select()
      
    if (error) throw error
    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Actualizar solo datos principales
export async function PUT(request: Request) {
    // Lógica similar al POST pero con .update() y .eq('id', body.id)
    // (Ya la tenías en versiones anteriores, si la necesitas completa dímelo)
    return NextResponse.json({ok: true}) // Placeholder para no alargar
}
