import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
    try {
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const body = await request.json();
        const { items, buyerInfo, shippingCost, total } = body;

        // 1. Iniciar Supabase (para guardar la orden)
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
        );

        // 2. Guardar la orden en BD (Estado: 'pending')
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                buyer_info: buyerInfo,
                items: items,
                total_amount: total,
                status: 'pending'
            }])
            .select()
            .single();

        if (orderError) throw new Error("Error guardando orden: " + orderError.message);

        // 3. Crear Preferencia de MercadoPago
        const preference = new Preference(client);
        
        const mpItems = items.map((item: any) => ({
            id: item.id,
            title: item.name + (item.size ? ` (${item.size})` : ''),
            quantity: Number(item.quantity),
            unit_price: Number(item.price),
            currency_id: 'CLP',
            picture_url: item.image
        }));

        // Agregar envío
        if (shippingCost > 0) {
            mpItems.push({
                id: 'shipping',
                title: 'Costo de Envío',
                quantity: 1,
                unit_price: Number(shippingCost),
                currency_id: 'CLP'
            });
        }

        const result = await preference.create({
            body: {
                items: mpItems,
                // ID de nuestra orden para vincularla después
                external_reference: orderData.id, 
                back_urls: {
                    success: `${origin}/compra-exitosa?order_id=${orderData.id}`,
                    failure: `${origin}/checkout?error=payment_failed`,
                    pending: `${origin}/checkout?warning=payment_pending`
                },
                auto_return: 'approved',
                payer: {
                    name: buyerInfo.name,
                    email: buyerInfo.email,
                    phone: { number: buyerInfo.phone }
                }
            }
        });

        return NextResponse.json({ url: result.init_point });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
