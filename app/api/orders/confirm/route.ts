import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();
        
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! 
        );

        // 1. Obtener orden
        const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
        if (!order || order.status === 'paid') return NextResponse.json({ message: "Skip" });

        // 2. Descontar Stock (Lógica Híbrida Robusta)
        for (const item of order.items) {
            
            if (item.variantId) {
                // --- MÉTODO A: Descuento Preciso por ID (El nuevo estándar) ---
                console.log(`Descontando stock para variante ID: ${item.variantId}`);
                
                // Usamos una llamada RPC para restar atómicamente si tienes la función, 
                // o hacemos lectura-escritura segura. Aquí usamos el método directo simple:
                const { data: variant } = await supabaseAdmin
                    .from('product_variants')
                    .select('stock_quantity')
                    .eq('id', item.variantId)
                    .single();

                if (variant) {
                    const newStock = Math.max(0, variant.stock_quantity - Number(item.quantity));
                    await supabaseAdmin
                        .from('product_variants')
                        .update({ stock_quantity: newStock })
                        .eq('id', item.variantId);
                }

            } else {
                // --- MÉTODO B: Fallback por Texto (Para compatibilidad con carritos viejos) ---
                console.log(`Descontando stock por coincidencia de texto: ${item.size}`);
                const cleanSize = String(item.size).trim();

                const { data: variant } = await supabaseAdmin
                    .from('product_variants')
                    .select('*')
                    .eq('product_id', item.id)
                    .eq('size_description', cleanSize)
                    .single();

                if (variant) {
                    const newStock = Math.max(0, variant.stock_quantity - Number(item.quantity));
                    await supabaseAdmin
                        .from('product_variants')
                        .update({ stock_quantity: newStock })
                        .eq('id', variant.id);
                }
            }
        }

        // 3. Cerrar orden
        await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error confirmando orden:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
