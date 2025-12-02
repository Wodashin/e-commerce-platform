import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

// GET: Obtener todos los productos (se actualiza el SELECT para obtener VARIANTS)
export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: products, error } = await supabase
    // NOTA: products(variants(*)) hace el JOIN automáticamente por product_id
    .from('products')
    .select('*, seller:profiles(full_name, avatar_url), product_variants(*)') 
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(products)
}

// POST: Crear nuevo producto (Ahora solo crea la fila principal)
export async function POST(request: Request) {
    return handleProductAction(request, 'create')
}

// PUT: Actualizar producto existente (Ahora solo actualiza la fila principal)
export async function PUT(request: Request) {
    return handleProductAction(request, 'update')
}

// Función auxiliar para manejar Create y Update (Eliminamos la manipulación de JSONB)
async function handleProductAction(request: Request, action: 'create' | 'update') {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  try {
    const body = await request.json()
    
    // Los datos de las variantes (sizes) ya no se procesan aquí
    const commonData = {
        name: body.name,
        category: body.category,
        description: body.description,
        price: body.price || 0, // Precio base (se usa para ordenar/filtrar)
        images: body.images,
        tags: body.tags,
    };

    let result;

    if (action === 'create') {
      const { data, error } = await supabase
        .from('products')
        .insert([{...commonData, seller_id: user.id}])
        .select('id, name, seller_id') // Necesitamos el ID del producto creado
        
      if (error) throw error
      result = data[0]

    } else {
      // Update logic (PUT)
      if (!body.id) throw new Error("ID de producto requerido para actualizar")
      
      const { data, error } = await supabase
        .from('products')
        .update(commonData)
        .eq('id', body.id)
        .eq('seller_id', user.id) // Seguridad extra: solo el dueño puede editar
        .select()
        
      if (error) throw error
      result = data[0]
    }

    return NextResponse.json(result, { status: action === 'create' ? 201 : 200 })

  } catch (error: any) {
    console.error(`Error ${action} product:`, error)
    return NextResponse.json({ error: error.message || "Error procesando solicitud" }, { status: 500 })
  }
}
