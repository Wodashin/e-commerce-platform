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

        // 2. Descontar Stock (Ahora mucho más simple y seguro)
        for (const item of order.items) {
            // item.size ahora DEBERÍA ser la descripción exacta, 
            // PERO lo ideal es que en el carrito guardes el ID de la variante si es posible.
            // Si seguimos usando size_description, ahora funcionará mejor porque la BD es nueva y limpia.
            
            const cleanSize = String(item.size).trim();

            // Buscar la variante exacta en la nueva tabla
            const { data: variant } = await supabaseAdmin
                .from('product_variants')
                .select('*')
                .eq('product_id', item.id) // ID del producto padre
                .eq('size_description', cleanSize) // Medida exacta
                .single();

            if (variant) {
                const newStock = Math.max(0, variant.stock_quantity - Number(item.quantity));
                
                await supabaseAdmin
                    .from('product_variants')
                    .update({ stock_quantity: newStock })
                    .eq('id', variant.id); // Actualizamos por ID único de variante
            }
        }

        // 3. Cerrar orden
        await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
