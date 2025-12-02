import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// Inicializa con el token que ya pusiste en Vercel
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
    try {
        // 1. ¡ESTA ES LA CLAVE! Obtiene la dirección real de tu web
        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const body = await request.json();
        const { items } = body;

        const preference = new Preference(client);

        // Crear la preferencia con las URLs correctas usando 'origin'
        const result = await preference.create({
            body: {
                items: items.map((item: any) => ({
                    id: item.id,
                    title: item.name,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.price),
                    currency_id: 'CLP',
                    picture_url: item.image
                })),
                // Aquí usamos la dirección detectada. Esto arregla el error.
                back_urls: {
                    success: `${origin}/compra-exitosa`,
                    failure: `${origin}/`,
                    pending: `${origin}/`
                },
                auto_return: 'approved',
            }
        });

        return NextResponse.json({ url: result.init_point });

    } catch (error: any) {
        console.error("Error MercadoPago:", error);
        // Devuelve el mensaje de error exacto para entender qué pasa
        return NextResponse.json({ 
            error: "Error al crear preferencia", 
            details: error.message || error 
        }, { status: 500 });
    }
}
