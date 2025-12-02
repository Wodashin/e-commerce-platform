import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

// GET: Obtener todos los productos
export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: products, error } = await supabase
    .from('products')
    .select('*, seller:profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(products)
}

// POST: Crear nuevo producto
export async function POST(request: Request) {
  return handleProductAction(request, 'create')
}

// PUT: Actualizar producto existente
export async function PUT(request: Request) {
  return handleProductAction(request, 'update')
}

// Función auxiliar para manejar Create y Update
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
    
    // Calcular precio principal (el más bajo)
    let mainPrice = 0;
    if (body.sizes && Array.isArray(body.sizes) && body.sizes.length > 0) {
      mainPrice = Math.min(...body.sizes.map((s: any) => Number(s.price) || 0));
    } else {
      mainPrice = Number(body.price) || 0; // Fallback si no hay sizes
    }

    let result;

    if (action === 'create') {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: body.name,
          category: body.category,
          description: body.description,
          price: mainPrice,
          images: body.images,
          tags: body.tags,
          sizes: body.sizes,
          seller_id: user.id
        }])
        .select()
      if (error) throw error
      result = data[0]

    } else {
      // Update logic
      if (!body.id) throw new Error("ID de producto requerido para actualizar")
      
      const { data, error } = await supabase
        .from('products')
        .update({
          name: body.name,
          category: body.category,
          description: body.description,
          price: mainPrice, // Recalculamos el precio base por si cambiaron los precios de las variantes
          images: body.images,
          tags: body.tags,
          sizes: body.sizes
        })
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
