import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// 1. Configuración Inicial
// Usamos el cliente de Admin de Supabase para poder escribir en la base de datos sin restricciones de usuario
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 2. Obtener la notificación que nos envía MercadoPago
    // MP envía un objeto indicando qué pasó (ej: se creó un pago)
    const url = new URL(request.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    // También intentamos leer el body por si viene en formato JSON data
    let body;
    try {
        body = await request.json();
    } catch (e) {
        // A veces MP solo manda query params
    }

    const paymentId = id || body?.data?.id;
    const type = topic || body?.type;

    // Solo nos interesa cuando el evento es un "payment" (pago)
    if (type === "payment" && paymentId) {
      console.log(`⚡ Webhook recibido para pago: ${paymentId}`);

      // 3. Consultar a MercadoPago el estado REAL del pago
      // No confiamos solo en la notificación, verificamos el estado actual
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id: paymentId });

      // 4. Si el pago está APROBADO (accredited), procesamos la orden
      if (paymentData.status === "approved") {
        const orderId = paymentData.external_reference; // Este ID lo enviamos al crear la preferencia

        if (!orderId) {
            console.error("Pago sin external_reference (ID de orden)");
            return NextResponse.json({ error: "No order ID" }, { status: 400 });
        }

        // 5. Buscar la orden en nuestra base de datos
        const { data: order, error: orderError } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError || !order) {
            console.error("Orden no encontrada en DB:", orderId);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // IMPORTANTE: Evitar procesar una orden que ya está pagada (Idempotencia)
        if (order.status === "paid") {
            console.log(`La orden ${orderId} ya estaba pagada. Saltando...`);
            return NextResponse.json({ message: "Already paid" }, { status: 200 });
        }

        console.log(`Procesando orden ${orderId}... Descontando stock.`);

        // 6. Lógica de Descuento de Stock (Idéntica a tu confirmación actual pero segura)
        for (const item of order.items) {
            // Opción A: Si el ítem tiene variantId (La forma nueva y segura)
            if (item.variantId) {
                const { data: variant } = await supabaseAdmin
                    .from('product_variants')
                    .select('stock_quantity, id')
                    .eq('id', item.variantId)
                    .single();

                if (variant) {
                    const newStock = Math.max(0, variant.stock_quantity - Number(item.quantity));
                    await supabaseAdmin
                        .from('product_variants')
                        .update({ stock_quantity: newStock })
                        .eq('id', item.variantId);
                }
            } 
            // Opción B: Fallback por compatibilidad (si tienes productos viejos sin variantId en carritos guardados)
            else {
                const cleanSize = String(item.size).trim();
                const { data: variant } = await supabaseAdmin
                    .from('product_variants')
                    .select('*')
                    .eq('product_id', item.id)
                    .eq('size_description', cleanSize)
                    .single();

                if (variant) {
                    const newStock = Math.max(0, variant.stock_quantity - Number(item.quantity));
                    await supabaseAdmin
                        .from('product_variants')
                        .update({ stock_quantity: newStock })
                        .eq('id', variant.id);
                }
            }
        }

        // 7. Finalmente, marcamos la orden como PAGADA
        const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({ 
                status: "paid", 
                payment_id: paymentId,
                updated_at: new Date().toISOString()
            })
            .eq("id", orderId);

        if (updateError) {
            console.error("Error actualizando estado de orden:", updateError);
            throw updateError;
        }

        console.log(`✅ Orden ${orderId} actualizada a PAID correctamente.`);
      }
    }

    // Siempre responder 200 OK a MercadoPago para que deje de enviar la notificación
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error crítico en Webhook:", error);
    // Aun con error, a veces conviene responder 200 para no bloquear la cola de MP, 
    // pero responder 500 alerta a MP que reintente luego si fue un fallo de red momentáneo.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
