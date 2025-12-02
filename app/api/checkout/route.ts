import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// Inicializar cliente de MercadoPago con tu Access Token
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
    try {
        // 1. Recibir los datos del carrito desde el frontend
        const body = await request.json();
        const { items } = body;

        // 2. Crear la preferencia de pago (la "orden" en MercadoPago)
        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: items.map((item: any) => ({
                    id: item.id,
                    title: item.name + (item.size ? ` (${item.size})` : ''), // Nombre + Talla
                    quantity: Number(item.quantity),
                    unit_price: Number(item.price),
                    currency_id: 'CLP', // Moneda (Pesos Chilenos)
                    picture_url: item.image // Foto del producto para que salga en el checkout
                })),
                // A dónde redirigir al usuario según el resultado del pago
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/compra-exitosa`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`
                },
                auto_return: 'approved', // Volver automáticamente a tu tienda si se aprueba
            }
        });

        // 3. Devolver la URL de pago (init_point) al frontend para redirigir al usuario
        return NextResponse.json({ url: result.init_point });

    } catch (error) {
        console.error("Error MercadoPago:", error);
        return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 });
    }
}
