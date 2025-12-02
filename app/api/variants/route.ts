import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    try {
        const body = await request.json()
        const { product_id, variants } = body

        // Borrar variantes viejas y poner nuevas (método limpio)
        await supabase.from('product_variants').delete().eq('product_id', product_id)

        const variantsToInsert = variants.map((v: any) => ({
            product_id: product_id,
            size_description: v.size_description,
            unit_price: Number(v.unit_price),
            stock_quantity: Number(v.stock_quantity)
        }))

        const { data, error } = await supabase
            .from('product_variants')
            .insert(variantsToInsert)
            .select()
        
        if (error) throw error
        return NextResponse.json(data, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
