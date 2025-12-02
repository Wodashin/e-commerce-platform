import { createClient as createAdminClient } from '@supabase/supabase-js'; // Importamos el cliente de Admin
import { createServerClient } from '@supabase/ssr'; // Para compatibilidad con otros archivos
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();
        
        // 1. INICIAR CLIENTE ADMIN (Service Role Key)
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! 
        );

        // 2. Obtener la orden
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('items, status')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
        if (order.status === 'paid') return NextResponse.json({ message: "Orden ya procesada" });

        // 3. Preparar ítems: Limpiamos el string de tamaño del ítem que viene en la orden
        const cleanOrderItems = order.items.map((item: any) => ({
            ...item,
            size: String(item.size || '').trim() // Aseguramos que sea string y eliminamos espacios
        }));

        const stockUpdatePromises = [];
        let totalItemsProcessed = 0;

        // 4. Recorrer los ítems y buscar la variante para descontar
        for (const item of cleanOrderItems) {
            const purchasedQuantity = Number(item.quantity) || 1;

            // Buscamos la VARIANTE específica por el product_id y size_description
            // item.id en el carrito es el product_id (asumido del carrito)
            const { data: variant, error: variantError } = await supabaseAdmin
                .from('product_variants')
                .select('*')
                .eq('product_id', item.id) 
                .eq('size_description', item.size) // Usamos la talla LIMPIA para el match
                .single();
            
            if (variant && !variantError) {
                const currentQuantity = Number(variant.stock_quantity) || 0;
                const newQuantity = Math.max(0, currentQuantity - purchasedQuantity);

                // Generamos la promesa de actualización para la VARIANTE
                stockUpdatePromises.push(
                    supabaseAdmin.from('product_variants')
                        .update({ stock_quantity: newQuantity })
                        .eq('id', variant.id) // ¡Actualizamos por ID de VARIANTE!
                );
                totalItemsProcessed++;
            }
        }
        
        // 5. Ejecutar todas las actualizaciones de stock
        await Promise.all(stockUpdatePromises);

        // 6. Marcar la orden como pagada (SOLO después de descontar el stock)
        await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error confirmando orden (FATAL):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
