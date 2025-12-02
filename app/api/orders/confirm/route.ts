import { createClient as createAdminClient } from '@supabase/supabase-js'; // Importamos el cliente de Admin
import { createServerClient } from '@supabase/ssr'; // Para compatibilidad con otros archivos
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();
        
        // 1. INICIAR CLIENTE ADMIN (Service Role Key)
        // Usamos la clave de administrador para saltar el RLS y poder actualizar el inventario
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! 
        );

        // 2. Obtener la orden
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
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
            // Obtenemos el producto actual
            const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', item.id).single();
            
            if (product && product.sizes) {
                let stockUpdated = false;

                const newSizes = product.sizes.map((s: any) => {
                    // Limpiamos el string de la DB antes de comparar
                    const cleanProductSize = String(s.size || '').trim();

                    // ¡Comparación CRÍTICA! Usamos los strings LIMPIOS
                    if (cleanProductSize === item.size) { 
                        const currentQuantity = Number(s.quantity) || 0;
                        const purchasedQuantity = Number(item.quantity) || 1;
                        
                        const newQuantity = Math.max(0, currentQuantity - purchasedQuantity);
                        
                        stockUpdated = true;
                        return { ...s, quantity: newQuantity }
                    }
                    return s;
                });

                if (stockUpdated) { 
                    totalItemsProcessed++;
                    stockUpdatePromises.push(
                        supabaseAdmin.from('products')
                            .update({ sizes: newSizes })
                            .eq('id', item.id)
                    );
                }
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
