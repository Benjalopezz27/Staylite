import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-04-22.dahlia', // Usa la versión más reciente o la que te indique tu dashboard
});

export const POST: APIRoute = async ({ request, url }) => {
    try {
        const body = await request.json();
        const { documentId, roomName, totalPrice, customerEmail } = body;

        // Stripe procesa los pagos en la unidad más pequeña de la moneda (centavos)
        // Por lo tanto, $150.00 USD se envían como 15000
        const unitAmount = Math.round(totalPrice * 100);

        // Obtenemos el origen de forma dinámica para que funcione en local y producción
        const origin = request.headers.get('origin') || url.origin;

        // Redirecciones post-pago
        const successUrl = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/checkout-payment?canceled=true`;

        // Creamos la sesión de pago en Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: customerEmail || undefined, // Pre-llena el email si lo tenemos
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // O 'ars', dependiendo de tu moneda
                        product_data: {
                            name: `Reserva: ${roomName}`,
                            description: `Código de confirmación temporal pendiente.`,
                            // images: ['url_de_la_foto_de_la_habitacion'], // Opcional
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Metadatos cruciales: Aquí inyectamos el ID de Strapi para que, 
            // cuando el pago sea exitoso, sepamos qué reserva confirmar.
            metadata: {
                strapi_document_id: documentId,
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return new Response(JSON.stringify({ url: session.url }), { status: 200 });
    } catch (error: any) {
        console.error("Error creando la sesión de Stripe:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};