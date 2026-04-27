// src/services/bookingData.ts (o la ruta donde lo tengas)
import type { Booking } from "@/lib/types";

export async function createBooking(payload: Partial<Booking>): Promise<any> {
    // Debug: inspect what the room object looks like
    console.log('[bookingData] payload.room:', JSON.stringify(payload.room, null, 2));

    // Estructura exacta que requiere Strapi
    const strapiPayload = {
        data: {
            checkIn: payload.checkIn ? payload.checkIn.toISOString().split('T')[0] : null,
            checkOut: payload.checkOut ? payload.checkOut.toISOString().split('T')[0] : null,
            customerName: payload.customerName,
            customerPhone: null,
            customerEmail: payload.customerEmail,
            noOfRooms: payload.noOfRooms,
            adults: payload.adults,
            childrens: payload.childrens,
            bookingStatus: payload.bookingStatus || 'pending',
            // bookingCode: omitido — Strapi lo auto-genera (tipo uid)
            // notes: omitido — se completará en el flujo de pago
            totalPrice: payload.totalPrice,
            room: payload.room?.documentId ?? null,
        }
    };

    try {
        // Hacemos un fetch simple a nuestro backend de Astro. 
        // ¡OJO! Ya no usamos tu función fetchApi de Strapi aquí, ni pasamos el JWT.
        // El navegador envía las cookies de Clerk automáticamente a este endpoint.
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(strapiPayload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Error al crear la reserva en el servidor");
        }

        return data;
    } catch (error) {
        console.error("[bookingData.ts] Error creando la reserva:", error);
        throw error;
    }
}

/**
 * Fetches all bookings for the currently logged-in user.
 * Calls the Astro proxy which uses STRAPI_SERVER_TOKEN to query Strapi.
 */
export async function getUserBookings(email?: string): Promise<any[]> {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (email) headers['X-User-Email'] = email;

        const response = await fetch('/api/user-bookings', {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            console.error('[bookingData] Failed to fetch user bookings:', response.status);
            return [];
        }

        const data = await response.json();
        return data.bookings || [];
    } catch (error) {
        console.error('[bookingData] Error fetching user bookings:', error);
        return [];
    }
}