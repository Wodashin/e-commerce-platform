import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// Inicializar cliente de MercadoPago
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items } = body;

        // Crear la preferencia de pago
        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: items.map((item: any) => ({
                    id: item.id,
                    title: item.name + (item.size ? ` (${item.size})` : ''),
                    quantity: Number(item.quantity),
                    unit_price: Number(item.price),
                    currency_id: 'CLP',
                    picture_url: item.image // Opcional: para que se vea la foto en MP
                })),
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/compra-exitosa`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`
                },
                auto_return: 'approved',
            }
        });

        // Devolver la URL de pago (init_point) al frontend
        return NextResponse.json({ url: result.init_point });

    } catch (error) {
        console.error("Error MercadoPago:", error);
        return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 });
    }
}
