import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

// --- HELPER DE ENTORNOS (BLINDAJE SSR) ---
const getEnvVars = () => {
    const url = (typeof process !== 'undefined' && process.env.PUBLIC_STRAPI_URL)
        ? process.env.PUBLIC_STRAPI_URL
        : (import.meta.env.PUBLIC_STRAPI_URL || 'https://backend-production-9fac.up.railway.app');

    const token = (typeof process !== 'undefined' && process.env.STRAPI_SERVER_TOKEN)
        ? process.env.STRAPI_SERVER_TOKEN
        : import.meta.env.STRAPI_SERVER_TOKEN;

    const stripeKey = (typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY)
        ? process.env.STRIPE_SECRET_KEY
        : import.meta.env.STRIPE_SECRET_KEY;

    return { url, token, stripeKey };
};

interface CancelBookingRequest {
    documentId: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        // 1. Obtenemos las variables blindadas en tiempo de ejecución
        const { url: strapiUrl, token: strapiToken, stripeKey } = getEnvVars();

        if (!strapiUrl || !strapiToken || !stripeKey) {
            console.error('❌ Falta configuración de variables de entorno (Strapi o Stripe).');
            return new Response(JSON.stringify({ error: 'Error interno del servidor de configuraciones.' }), { status: 500 });
        }

        // 2. Inicializar Stripe de forma segura en runtime
        const stripe = new Stripe(stripeKey as string, {
            apiVersion: '2026-04-22.dahlia',
        });

        // Parsear el body de forma segura
        let body: CancelBookingRequest;
        try {
            body = await request.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Formato JSON inválido.' }), { status: 400 });
        }

        const { documentId } = body;

        if (!documentId) {
            return new Response(JSON.stringify({ error: 'El parámetro documentId es requerido.' }), { status: 400 });
        }

        // 3. Verificación de Autenticación mediante Clerk
        const auth = locals.auth ? locals.auth() : null;
        const userId = auth?.userId;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'No autorizado. Debe iniciar sesión.' }), { status: 401 });
        }

        // Extraer el email del usuario para validar la propiedad de la reserva
        let userEmail: string | null = null;
        try {
            const sessionClaims = auth?.sessionClaims;
            userEmail = (sessionClaims?.email as string) || null;
            if (!userEmail) {
                // Fallback a los headers por si viene desde una petición custom del frontend
                userEmail = request.headers.get('X-User-Email');
            }
        } catch (e) {
            console.error('Error extrayendo claims de Clerk:', e);
        }

        if (!userEmail) {
            return new Response(JSON.stringify({ error: 'No se pudo verificar la identidad (email) del usuario.' }), { status: 400 });
        }

        // 4. Fetch a Strapi para obtener la reserva
        const fetchResponse = await fetch(`${strapiUrl}/api/bookings/${documentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${strapiToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!fetchResponse.ok) {
            return new Response(JSON.stringify({ error: 'No se encontró la reserva indicada.' }), { status: 404 });
        }

        const bookingData = await fetchResponse.json();

        // Manejar estructura de Strapi v5 (o v4 si aplican atributos)
        const booking = bookingData?.data?.attributes || bookingData?.data;

        if (!booking) {
            return new Response(JSON.stringify({ error: 'La reserva no contiene datos válidos.' }), { status: 404 });
        }

        // Validar propiedad de la reserva
        if (booking.customerEmail !== userEmail) {
            return new Response(JSON.stringify({ error: 'No tiene permisos para cancelar esta reserva.' }), { status: 403 });
        }

        // Validar estado de la reserva
        if (booking.bookingStatus !== 'confirmed') {
            return new Response(JSON.stringify({ error: `No se puede cancelar una reserva con estado: ${booking.bookingStatus}.` }), { status: 400 });
        }

        // 5. Regla de Negocio: 48 Horas
        if (!booking.checkIn) {
            return new Response(JSON.stringify({ error: 'La reserva no tiene fecha de check-in válida.' }), { status: 400 });
        }

        const checkInDate = new Date(booking.checkIn);
        const now = new Date();
        const diffMs = checkInDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours <= 48) {
            return new Response(JSON.stringify({
                error: 'Fuera de plazo. Ya no es posible cancelar con reembolso porque faltan menos de 48 horas para el Check-In.'
            }), { status: 400 });
        }

        // 6. Procesar Reembolso en Stripe
        if (!booking.stripePaymentId) {
            return new Response(JSON.stringify({ error: 'No se encontró el ID de pago de Stripe para procesar el reembolso.' }), { status: 400 });
        }

        let refund: Stripe.Refund;
        try {
            refund = await stripe.refunds.create({
                payment_intent: booking.stripePaymentId,
                reason: 'requested_by_customer'
            });
        } catch (stripeError: any) {
            console.error('❌ Error ejecutando reembolso en Stripe:', stripeError);
            return new Response(JSON.stringify({ error: `Fallo al procesar el reembolso en Stripe: ${stripeError.message}` }), { status: 500 });
        }

        if (refund.status !== 'succeeded' && refund.status !== 'pending') {
            return new Response(JSON.stringify({ error: `El reembolso fue rechazado o falló (Estado: ${refund.status}).` }), { status: 500 });
        }

        console.log(`✅ Reembolso aprobado en Stripe: ${refund.id}`);

        // 7. Actualizar el estado en Strapi
        const updateResponse = await fetch(`${strapiUrl}/api/bookings/${documentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${strapiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    bookingStatus: 'cancelled'
                }
            })
        });

        if (!updateResponse.ok) {
            const errorDetails = await updateResponse.json();
            console.error('❌ Error actualizando estado en Strapi luego del reembolso:', errorDetails);
            // CRÍTICO: El dinero se devolvió, pero Strapi no se actualizó. 
            // Retornamos 500 pero indicamos que el reembolso sí se hizo.
            return new Response(JSON.stringify({
                error: 'El reembolso fue procesado exitosamente, pero hubo un error al actualizar el estado en la base de datos.',
                refundId: refund.id
            }), { status: 500 });
        }

        console.log(`✅ Reserva ${documentId} cancelada exitosamente en Strapi.`);

        // 8. Retornar éxito
        return new Response(JSON.stringify({
            message: 'Reserva cancelada y reembolso procesado exitosamente.',
            refundId: refund.id
        }), { status: 200 });

    } catch (error: any) {
        console.error('❌ Error no controlado en cancel-booking:', error);
        return new Response(JSON.stringify({ error: `Error interno del servidor: ${error.message}` }), { status: 500 });
    }
};