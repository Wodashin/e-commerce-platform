import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

// GET: Trae productos CON sus variantes
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

// POST: Crear producto
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

// PUT: Actualizar producto y sus variantes
export async function PUT(request: Request) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    try {
        const body = await request.json()
        const { id, name, category, description, tags, images, sizes } = body

        if (!id) throw new Error("ID de producto requerido")

        // 1. Actualizar datos principales del producto
        const { error: productError } = await supabase
            .from('products')
            .update({
                name,
                category,
                description,
                tags,
                images,
                // Actualizamos el precio base (el menor de las variantes)
                price: Math.min(...sizes.map((s: any) => Number(s.price)))
            })
            .eq('id', id)

        if (productError) throw productError

        // 2. Actualizar variantes (Estrategia: Borrar viejas -> Insertar nuevas)
        // Esto es más seguro que intentar editar una por una
        const { error: deleteError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', id)
        
        if (deleteError) throw deleteError

        // Insertar las nuevas variantes editadas
        const variantsToInsert = sizes.map((v: any) => ({
            product_id: id,
            size_description: v.size, // Asegúrate que venga como texto "LxAxH cm"
            unit_price: Number(v.price),
            stock_quantity: Number(v.quantity)
        }))

        const { error: insertError } = await supabase
            .from('product_variants')
            .insert(variantsToInsert)

        if (insertError) throw insertError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Error actualizando:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
