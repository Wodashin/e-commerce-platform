import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();
        
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
        );

        // 1. Obtener la orden
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

        // Evitar procesar dos veces
        if (order.status === 'paid') return NextResponse.json({ message: "Orden ya procesada" });

        // 2. Marcar como pagada
        await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);

        // 3. Descontar Stock
        for (const item of order.items) {
            const { data: product } = await supabase.from('products').select('*').eq('id', item.id).single();
            
            if (product && product.sizes) {
                // Encontrar la variante y restar stock
                const newSizes = product.sizes.map((s: any) => {
                    // Comparar strings de tamaño para encontrar la variante correcta
                    if (s.size === item.size) {
                        return { ...s, quantity: Math.max(0, Number(s.quantity) - Number(item.quantity)) }
                    }
                    return s;
                });

                // Actualizar producto
                await supabase.from('products').update({ sizes: newSizes }).eq('id', item.id);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error confirmando orden:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
