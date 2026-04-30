import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-04-22.dahlia',
});

const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
    try {
        const signature = request.headers.get('stripe-signature');

        if (!signature || !webhookSecret) {
            console.error('Falta la firma de Stripe o el secreto del webhook.');
            return new Response('Webhook Secret or Signature missing.', { status: 400 });
        }

        // Para verificar la firma, Stripe necesita el cuerpo de la solicitud en texto plano (raw)
        const payload = await request.text();

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            console.error('⚠️ Error verificando la firma del webhook:', err.message);
            return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
        }

        // Manejamos el evento 'checkout.session.completed'
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Extraemos los metadatos y el payment intent
            const strapiDocumentId = session.metadata?.strapi_document_id;
            const paymentIntent = session.payment_intent;

            console.log(`✅ Checkout Session Completado. Document ID: ${strapiDocumentId}, Payment Intent: ${paymentIntent}`);

            if (strapiDocumentId && paymentIntent) {
                // Hacemos el PATCH/PUT a Strapi para actualizar el estado de la reserva
                const strapiUrl = import.meta.env.PUBLIC_STRAPI_URL;
                const strapiToken = import.meta.env.STRAPI_SERVER_TOKEN;

                try {
                    const strapiResponse = await fetch(`${strapiUrl}/api/bookings/${strapiDocumentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${strapiToken}`,
                        },
                        body: JSON.stringify({
                            data: {
                                bookingStatus: 'confirmed',
                                stripePaymentId: paymentIntent.toString()
                            }
                        })
                    });

                    if (!strapiResponse.ok) {
                        const errorData = await strapiResponse.json();
                        console.error('❌ Error actualizando Strapi:', errorData);
                        throw new Error(`Strapi update failed: ${strapiResponse.statusText}`);
                    }

                    console.log('✅ Reserva actualizada en Strapi a "confirmed".');
                } catch (updateError) {
                    console.error('❌ Falló la conexión con Strapi:', updateError);
                    // Retornamos un error 500 para que Stripe reintente el webhook más tarde
                    return new Response('Error updating Strapi', { status: 500 });
                }
            } else {
                console.warn('⚠️ No se encontró strapi_document_id o payment_intent en la sesión.');
            }
        }

        // Retornamos un 200 OK a Stripe para confirmar que recibimos el evento
        return new Response(JSON.stringify({ received: true }), { status: 200 });

    } catch (error: any) {
        console.error('❌ Error inesperado en el webhook:', error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
};