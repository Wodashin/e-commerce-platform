import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

export async function GET() {
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

  const { data: products, error } = await supabase
    .from('products')
    .select('*, seller:profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignorar en Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Ignorar
          }
        },
      },
    }
  )

  // 1. Verificar quién es el usuario
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado. Inicia sesión." }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // 2. Calcular el precio "principal" (el más barato de las variantes)
    // Esto sirve para mostrar "Desde $5.000" en la portada
    let mainPrice = 0;
    if (body.sizes && Array.isArray(body.sizes) && body.sizes.length > 0) {
      mainPrice = Math.min(...body.sizes.map((s: any) => Number(s.price) || 0));
    } else {
      mainPrice = Number(body.price) || 0;
    }

    // 3. Insertar en la base de datos
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: body.name,
          category: body.category,
          description: body.description,
          price: mainPrice,      // Precio calculado para ordenar/filtrar
          images: body.images,   // URLs de Cloudflare
          tags: body.tags,
          sizes: body.sizes,     // JSON con tus variantes (Largo, Ancho, Alto...)
          seller_id: user.id     // Vinculado a TI
        }
      ])
      .select()

    if (error) {
      console.error("Error Supabase:", error)
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })

  } catch (error: any) {
    console.error("Error general creando producto:", error)
    return NextResponse.json({ error: error.message || "Error al crear producto" }, { status: 500 })
  }
}
