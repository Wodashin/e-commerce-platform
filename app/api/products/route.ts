import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

// GET: Trae productos (PÚBLICO)
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

// POST: Crear producto (PROTEGIDO)
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // --- SEGURIDAD: Verificar Rol ---
  const isGodAdmin = user.email?.toLowerCase().includes("ilyon3d")
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'vendor' && !isGodAdmin) {
    return NextResponse.json({ error: "Forbidden: Vendedor requerido" }, { status: 403 })
  }
  // ------------------------------

  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: body.name,
        category: body.category,
        description: body.description,
        price: body.price,
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

// PUT: Actualizar producto (PROTEGIDO)
export async function PUT(request: Request) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    // Verificar usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const { id, name, category, description, tags, images, sizes } = body

        if (!id) throw new Error("ID de producto requerido")

        // VERIFICACIÓN EXTRA: Asegurar que el producto pertenece al usuario (o es admin)
        // Esto evita que un vendedor edite el producto de OTRO vendedor
        const isGodAdmin = user.email?.toLowerCase().includes("ilyon3d")
        
        if (!isGodAdmin) {
            const { data: existingProduct } = await supabase.from('products').select('seller_id').eq('id', id).single()
            if (existingProduct?.seller_id !== user.id) {
                return NextResponse.json({ error: "No puedes editar productos ajenos" }, { status: 403 })
            }
        }

        // 1. Actualizar datos principales
        const { error: productError } = await supabase
            .from('products')
            .update({
                name,
                category,
                description,
                tags,
                images,
                price: Math.min(...sizes.map((s: any) => Number(s.price)))
            })
            .eq('id', id)

        if (productError) throw productError

        // 2. Actualizar variantes
        const { error: deleteError } = await supabase.from('product_variants').delete().eq('product_id', id)
        if (deleteError) throw deleteError

        const variantsToInsert = sizes.map((v: any) => ({
            product_id: id,
            size_description: v.size,
            unit_price: Number(v.price),
            stock_quantity: Number(v.quantity)
        }))

        const { error: insertError } = await supabase.from('product_variants').insert(variantsToInsert)
        if (insertError) throw insertError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Error actualizando:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
