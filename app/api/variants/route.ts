import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

// POST: Crear/Actualizar variantes para un producto específico
export async function POST(request: Request) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "No autorizado." }, { status: 401 })

    try {
        const body = await request.json()
        const { product_id, variants } = body

        if (!product_id || !variants || !Array.isArray(variants)) {
            return NextResponse.json({ error: "Datos de variantes incompletos" }, { status: 400 })
        }

        // 1. Seguridad: Verificar que el usuario es el dueño del producto
        const { data: productOwner, error: ownerError } = await supabase
            .from('products')
            .select('seller_id')
            .eq('id', product_id)
            .single()
        
        if (ownerError || !productOwner || productOwner.seller_id !== user.id) {
            return NextResponse.json({ error: "No tiene permiso para modificar estas variantes." }, { status: 403 })
        }
        
        // 2. Borrar variantes antiguas (para simplificar el flujo y evitar duplicados)
        await supabase.from('product_variants').delete().eq('product_id', product_id)

        // 3. Insertar las nuevas variantes (las que vienen del formulario)
        const variantsToInsert = variants.map((v: any) => ({
            product_id: product_id,
            size_description: v.size_description,
            unit_price: Number(v.unit_price),
            stock_quantity: Number(v.stock_quantity)
        }))

        const { data: insertedVariants, error } = await supabase
            .from('product_variants')
            .insert(variantsToInsert)
            .select()
        
        if (error) throw error

        return NextResponse.json(insertedVariants, { status: 201 })

    } catch (error: any) {
        console.error("Error creating variants:", error)
        return NextResponse.json({ error: error.message || "Error procesando variantes" }, { status: 500 })
    }
}
