import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const orderId = params.id;
    
    try {
        // Usamos la clave de Administrador para asegurar el acceso a orders y products
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! 
        );

        // 1. Obtener la Orden
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('items, total_amount, status')
            .eq('id', orderId)
            .single();

        if (orderError || !order) return NextResponse.json({ error: "Orden no encontrada", details: orderError }, { status: 404 });

        const debugResults = [];
        
        // 2. Revisar cada ítem de la Orden
        for (const item of order.items) {
            // Limpiamos el texto que viene de la orden (como lo hace el código de confirmación)
            const cleanOrderItemSize = String(item.size || '').trim();
            const productId = item.id;

            // 3. Obtener todas las variantes de ese Producto para compararlas
            const { data: variants, error: variantsError } = await supabaseAdmin
                .from('product_variants')
                .select('*')
                .eq('product_id', productId);
            
            if (variantsError) {
                debugResults.push({
                    productId: productId,
                    status: 'ERROR',
                    message: 'Fallo al cargar variantes del producto',
                    details: variantsError
                });
                continue;
            }

            let matchFound = false;

            for (const variant of variants || []) {
                // Limpiamos el texto de la DB antes de comparar
                const cleanProductSize = String(variant.size_description || '').trim();
                
                const isMatch = cleanProductSize === cleanOrderItemSize;
                
                if (isMatch) {
                    matchFound = true;
                    debugResults.push({
                        productId: productId,
                        variantId: variant.id,
                        status: 'MATCH ENCONTRADO',
                        size_DB: cleanProductSize,
                        size_ORDEN: cleanOrderItemSize,
                        stock_actual: variant.stock_quantity,
                        stock_despues_compra: variant.stock_quantity - item.quantity,
                        resultado: 'Debería descontar stock'
                    });
                }
            }

            if (!matchFound) {
                 debugResults.push({
                    productId: productId,
                    status: 'FALLO DE MATCH',
                    size_ORDEN: cleanOrderItemSize,
                    variantes_disponibles: variants?.map(v => v.size_description),
                    message: 'El tamaño de la orden no coincide con ninguna variante en DB. Por eso no se descontó.'
                });
            }
        }


        return NextResponse.json({
            orderStatus: order.status,
            orderTotal: order.total_amount,
            orderItemsCount: order.items.length,
            debug: debugResults,
            success: true
        });

    } catch (error: any) {
        console.error("Error en Debug API:", error);
        return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 });
    }
}
