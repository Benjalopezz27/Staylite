import type { APIRoute } from 'astro';

// 1. CRÍTICO: Si tu proyecto de Astro está configurado como "static" o "hybrid", 
// necesitas esta línea para que el endpoint funcione dinámicamente y no falle.
export const prerender = false;

// --- HELPER DE ENTORNOS (BLINDAJE SSR) ---
// Astro API Routes corren en Node.js, por lo que process.env es más confiable que import.meta.env aquí.
const getEnvVars = () => {
    const url = (typeof process !== 'undefined' && process.env.PUBLIC_STRAPI_URL)
        ? process.env.PUBLIC_STRAPI_URL
        : (import.meta.env.PUBLIC_STRAPI_URL || 'https://backend-production-9fac.up.railway.app'); // Fallback directo a prod

    const token = (typeof process !== 'undefined' && process.env.STRAPI_SERVER_TOKEN)
        ? process.env.STRAPI_SERVER_TOKEN
        : import.meta.env.STRAPI_SERVER_TOKEN;

    return { url, token };
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        console.log("--> 1. Petición recibida en API Route de Astro");

        // 2. Verificamos la sesión de Clerk
        const auth = locals.auth ? locals.auth() : null;
        const userId = auth?.userId;

        console.log("--> 2. ID del usuario autenticado:", userId);

        if (!userId) {
            return new Response(JSON.stringify({ error: "No autorizado por Clerk" }), { status: 401 });
        }

        const body = await request.json();
        console.log("--> 3. Datos recibidos de React:", body);

        // Usamos nuestras variables blindadas
        const { url: strapiUrl, token: strapiToken } = getEnvVars();

        // 3. Validamos que el Token de servidor exista
        if (!strapiToken) {
            console.error("--> ❌ ERROR FATAL: STRAPI_SERVER_TOKEN no está definido en las variables de entorno");
            return new Response(JSON.stringify({ error: "Falta configuración en el servidor" }), { status: 500 });
        }

        console.log("--> 4. Enviando datos a Strapi (custom endpoint)...");
        console.log("--> 4b. Body que se envía a Strapi:", JSON.stringify(body, null, 2));

        const strapiResponse = await fetch(`${strapiUrl}/api/bookings/create-with-room`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${strapiToken}`
            },
            body: JSON.stringify(body)
        });

        const data = await strapiResponse.json();
        console.log("--> 5. Respuesta de Strapi HTTP:", strapiResponse.status);

        if (!strapiResponse.ok) {
            console.error("--> ❌ Strapi rechazó la reserva:");
            console.dir(data, { depth: null });
            return new Response(JSON.stringify(data), { status: strapiResponse.status });
        }

        console.log("--> ✅ Reserva creada exitosamente");
        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error: any) {
        // 4. Atrapamos el error 500 y lo mostramos en la terminal
        console.error("--> 🔥 ERROR 500 (CRASHEO DEL SERVIDOR):", error);
        return new Response(JSON.stringify({
            error: "Error interno del servidor",
            details: error.message || "Error desconocido"
        }), { status: 500 });
    }
}