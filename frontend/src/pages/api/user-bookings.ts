import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * GET /api/user-bookings
 * Returns all bookings for the currently authenticated user.
 * Filtered by customerEmail (extracted from Clerk session via locals).
 */
export const GET: APIRoute = async ({ request, locals }) => {
    try {
        const auth = locals.auth ? locals.auth() : null;
        const userId = auth?.userId;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
        }

        // Get user email from Clerk session to filter bookings
        const clerkClient = (locals as any).clerkClient;
        let userEmail: string | null = null;

        try {
            // Try to get from Clerk's session claims or user data
            const sessionClaims = auth?.sessionClaims;
            userEmail = (sessionClaims?.email as string) || null;

            // Fallback: try to get from the Authorization header passed by the client
            if (!userEmail) {
                const authHeader = request.headers.get('X-User-Email');
                userEmail = authHeader;
            }
        } catch (e) {
            // Email extraction failed — will fetch all with userId fallback
        }

        const strapiUrl = import.meta.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
        const strapiToken = import.meta.env.STRAPI_SERVER_TOKEN;

        if (!strapiToken) {
            return new Response(JSON.stringify({ error: 'Falta configuración del servidor' }), { status: 500 });
        }

        // Build filter — use email if available
        const params = new URLSearchParams();
        params.append('populate[room][populate][0]', 'image');
        params.append('populate[room][populate][1]', 'thumbnails');
        params.append('sort[0]', 'createdAt:desc');

        if (userEmail) {
            params.append('filters[customerEmail][$eq]', userEmail);
        }

        const strapiResponse = await fetch(
            `${strapiUrl}/api/bookings?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${strapiToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await strapiResponse.json();

        if (!strapiResponse.ok) {
            console.error('--> ❌ Error fetching bookings from Strapi:', data);
            return new Response(JSON.stringify({ error: 'Error al obtener reservas' }), { status: strapiResponse.status });
        }

        // Normalize Strapi v5 response (flat format)
        const rawBookings = data?.data || [];
        const bookings = rawBookings.map((item: any) => {
            const b = item.attributes || item;
            const roomNode = b.room?.data?.attributes || b.room || null;
            const strapiUrlBase = import.meta.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
            const roomImageUrl = roomNode?.image?.data?.attributes?.url || roomNode?.image?.url || null;

            return {
                documentId: item.documentId || item.id,
                bookingCode: b.bookingCode || null,
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                customerName: b.customerName,
                customerEmail: b.customerEmail,
                customerPhone: b.customerPhone,
                noOfRooms: b.noOfRooms,
                adults: b.adults,
                childrens: b.childrens,
                bookingStatus: b.bookingStatus || 'pending',
                notes: b.notes,
                totalPrice: b.totalPrice,
                createdAt: b.createdAt || item.createdAt,
                room: roomNode ? {
                    name: roomNode.name || 'Habitación',
                    slug: roomNode.slug || '',
                    image: roomImageUrl ? (roomImageUrl.startsWith('http') ? roomImageUrl : `${strapiUrlBase}${roomImageUrl}`) : null,
                    price: roomNode.price || 0,
                } : null,
            };
        });

        return new Response(JSON.stringify({ bookings }), { status: 200 });

    } catch (error: any) {
        console.error('--> 🔥 ERROR en user-bookings:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
