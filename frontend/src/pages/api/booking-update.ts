import type { APIRoute } from 'astro';

export const prerender = false;

// --- HELPER DE ENTORNOS (BLINDAJE SSR) ---
const getEnvVars = () => {
    const url = (typeof process !== 'undefined' && process.env.PUBLIC_STRAPI_URL)
        ? process.env.PUBLIC_STRAPI_URL
        : (import.meta.env.PUBLIC_STRAPI_URL || 'https://backend-production-9fac.up.railway.app'); // Fallback directo a prod

    const token = (typeof process !== 'undefined' && process.env.STRAPI_SERVER_TOKEN)
        ? process.env.STRAPI_SERVER_TOKEN
        : import.meta.env.STRAPI_SERVER_TOKEN;

    return { url, token };
};

/**
 * PATCH /api/booking-update
 * Updates customerPhone, notes, customerCountry and customerCity on an existing booking.
 * Called from the reservation-shipping page.
 */
export const PATCH: APIRoute = async ({ request, locals }) => {
    try {
        const auth = locals.auth ? locals.auth() : null;
        const userId = auth?.userId;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
        }

        const { documentId, phone, notes, country, city } = await request.json();

        if (!documentId) {
            return new Response(JSON.stringify({ error: 'documentId requerido' }), { status: 400 });
        }

        // Usamos nuestras variables blindadas
        const { url: strapiUrl, token: strapiToken } = getEnvVars();

        if (!strapiToken) {
            return new Response(JSON.stringify({ error: 'Falta configuración del servidor' }), { status: 500 });
        }

        // Build the update payload — only include defined fields
        const updateData: Record<string, any> = {};
        if (phone !== undefined && phone !== null) updateData.customerPhone = phone;
        // notes is optional: save it if provided (even if empty string → null to clear)
        if (notes !== undefined) updateData.notes = notes.trim() || null;
        if (country) updateData.customerCountry = country.trim();
        if (city) updateData.customerCity = city.trim();

        const strapiResponse = await fetch(`${strapiUrl}/api/bookings/update-details`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${strapiToken}`,
            },
            body: JSON.stringify({ documentId, phone, notes, country, city }),
        });

        const data = await strapiResponse.json();

        if (!strapiResponse.ok) {
            console.error('--> ❌ Error actualizando reserva:', data);
            return new Response(JSON.stringify(data), { status: strapiResponse.status });
        }

        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error: any) {
        console.error('--> 🔥 ERROR en booking-update:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};