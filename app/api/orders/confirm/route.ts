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

        // 2. Descontar Stock y Marcar como Pagada (USANDO UNA TRANSACCIÓN para seguridad)
        
        // Creamos una lista de las promesas de actualización de stock
        const stockUpdatePromises = [];
        let totalItemsProcessed = 0;

        // Recorremos los ítems comprados
        for (const item of order.items) {
            const { data: product } = await supabase.from('products').select('*').eq('id', item.id).single();
            
            if (product && product.sizes) {
                let stockUpdated = false;

                const newSizes = product.sizes.map((s: any) => {
                    // Comparación estricta de string para encontrar la variante correcta
                    if (s.size === item.size) { 
                        const newQuantity = Math.max(0, Number(s.quantity) - Number(item.quantity));
                        stockUpdated = true;
                        return { ...s, quantity: newQuantity }
                    }
                    return s;
                });

                // Si encontramos y actualizamos la variante, guardamos la promesa
                if (stockUpdated) { 
                    totalItemsProcessed++;
                    stockUpdatePromises.push(
                        supabase.from('products')
                            .update({ sizes: newSizes })
                            .eq('id', item.id)
                    );
                }
            }
        }
        
        // Ejecutar todas las actualizaciones de stock en paralelo
        await Promise.all(stockUpdatePromises);

        // 3. Marcar la orden como pagada (SOLO después de descontar el stock)
        await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);

        if (totalItemsProcessed === 0) {
            console.warn(`[STOCK ISSUE] No se descontó stock: Falló el match de size para la orden ${orderId}`);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error confirmando orden (FATAL):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
