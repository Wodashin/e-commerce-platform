import { createClient as createAdminClient } from '@supabase/supabase-js'; // Importamos el cliente de Admin
import { createServerClient } from '@supabase/ssr'; // Para compatibilidad con otros archivos
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();
        
        // 1. INICIAR CLIENTE ADMIN (Service Role Key)
        // ESTO BYPASSEA RLS y permite actualizar el stock
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Usamos la clave de alto privilegio
        );

        // 2. Obtener la orden y el producto usando el cliente Admin
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
        if (order.status === 'paid') return NextResponse.json({ message: "Orden ya procesada" });

        // 3. Descontar Stock y Marcar como Pagada
        
        const stockUpdatePromises = [];
        let totalItemsProcessed = 0;

        for (const item of order.items) {
            // Obtenemos el producto actual
            const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', item.id).single();
            
            if (product && product.sizes) {
                let stockUpdated = false;

                const newSizes = product.sizes.map((s: any) => {
                    // Si encontramos la variante por tamaño
                    if (s.size === item.size) { 
                        const newQuantity = Math.max(0, Number(s.quantity) - Number(item.quantity));
                        stockUpdated = true;
                        return { ...s, quantity: newQuantity }
                    }
                    return s;
                });

                // Si encontramos la variante, generamos la promesa de actualización
                if (stockUpdated) { 
                    totalItemsProcessed++;
                    stockUpdatePromises.push(
                        supabaseAdmin.from('products') // <-- Usamos Admin Client para el UPDATE
                            .update({ sizes: newSizes })
                            .eq('id', item.id)
                    );
                }
            }
        }
        
        // Ejecutar todas las actualizaciones de stock
        await Promise.all(stockUpdatePromises);

        // 4. Marcar la orden como pagada
        await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error confirmando orden (FATAL):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
