import type { APIRoute } from 'astro';

export const prerender = false;

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

        const strapiUrl = import.meta.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
        const strapiToken = import.meta.env.STRAPI_SERVER_TOKEN;

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
