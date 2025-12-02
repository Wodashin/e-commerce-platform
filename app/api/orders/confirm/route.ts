import { createClient as createAdminClient } from '@supabase/supabase-js'; 
import { createServerClient } from '@supabase/ssr'; 
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
            size: String(item.size || '').trim() // Resultado limpio de la talla del carrito
        }));

        const stockUpdatePromises = [];
        let totalItemsProcessed = 0;

        // 4. Recorrer los ítems y buscar la variante para descontar
        for (const item of cleanOrderItems) {
            const purchasedQuantity = Number(item.quantity) || 1;

            const { data: product } = await supabaseAdmin.from('products').select('product_variants(*)').eq('id', item.id).single();
            
            if (product && product.product_variants) {
                let stockUpdated = false;

                const newVariants = product.product_variants.map((v: any) => {
                    // Limpiamos el string de la DB antes de comparar
                    const cleanProductSize = String(v.size_description || '').trim();

                    // ¡LA CORRECCIÓN FINAL! Ahora comparamos el string limpio de la DB contra el string limpio de la ORDEN
                    if (cleanProductSize === item.size) { 
                        const currentQuantity = Number(v.stock_quantity) || 0;
                        const newQuantity = Math.max(0, currentQuantity - purchasedQuantity);
                        
                        stockUpdated = true;
                        return { ...v, stock_quantity: newQuantity }
                    }
                    return v;
                });

                if (stockUpdated) { 
                    totalItemsProcessed++;
                    stockUpdatePromises.push(
                        supabaseAdmin.from('product_variants')
                            .update(newVariants)
                            .eq('product_id', item.id) 
                    );
                }
            }
        }
        
        // 5. Ejecutar todas las actualizaciones de stock
        await Promise.all(stockUpdatePromises);

        // 6. Marcar la orden como pagada
        await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderData.id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error confirmando orden (FATAL):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
