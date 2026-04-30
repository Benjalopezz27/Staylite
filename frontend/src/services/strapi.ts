interface Props {
    endpoint: string;
    query?: Record<string, any>;
    wrappedByKey?: string;
    wrappedByList?: boolean;
    method?: string;
    options?: RequestInit;
}

/**
 * Recursively serializes a nested query object into URL search params
 * using bracket notation, e.g. { filters: { slug: { $eq: 'x' } } }
 * becomes filters[slug][$eq]=x
 */
function serializeQuery(params: URLSearchParams, obj: Record<string, any>, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !Array.isArray(value)) {
                serializeQuery(params, value, fullKey);
            } else if (Array.isArray(value)) {
                value.forEach((v, i) => params.append(`${fullKey}[${i}]`, String(v)));
            } else {
                params.append(fullKey, String(value));
            }
        }
    }
}

export default async function fetchApi({
    endpoint,
    query,
    wrappedByKey,
    wrappedByList,
    method = "GET",
    options = {},
}: Props) {
    if (endpoint.startsWith('/')) {
        endpoint = endpoint.slice(1);
    }

    // Captura tanto el prefijo de Vite como el de Astro para evitar conflictos
    const STRAPI_URL: string | undefined = import.meta.env.VITE_STRAPI_URL || import.meta.env.PUBLIC_STRAPI_URL;

    if (!STRAPI_URL) {
        throw new Error("❌ STRAPI_URL sigue vacía. El build no leyó el archivo .env dinámico.");
    }

    const url = new URL(`${STRAPI_URL}/api/${endpoint}`);

    if (query) {
        serializeQuery(url.searchParams, query);
    }

    try {
        const defaultHeaders: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Si no se provee un Authorization header en options, usamos el token público por defecto
        const hasAuth = options.headers && (
            (options.headers as Record<string, string>)["Authorization"] ||
            (options.headers as any).get?.("Authorization")
        );

        if (!hasAuth) {
            defaultHeaders["Authorization"] = `Bearer ${import.meta.env.PUBLIC_STRAPI_API_TOKEN}`;
        }

        const res = await fetch(url.toString(), {
            method,
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {}),
            },
        });

        if (!res.ok) {
            let errorMessage = `Error HTTP ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData?.error?.message || errorData?.message || errorMessage;

                console.error(`\n🚨 ERROR DE STRAPI (${res.status})`);
                console.error(`➤ Mensaje: ${errorMessage}`);
                console.error(`➤ URL: ${url.toString()}`);
                console.error(`➤ Detalles:`, JSON.stringify(errorData?.error?.details, null, 2));

            } catch (e) {
                console.error(`Error en la petición: ${res.statusText}`);
            }

            throw new Error(errorMessage);
        }

        let data = await res.json();

        if (wrappedByKey) {
            data = data[wrappedByKey];
        }

        if (wrappedByList) {
            data = data[0];
        }

        return data;

    } catch (error) {
        if (error instanceof TypeError) {
            console.error(`❌ Error de Red o URL inválida:`, error);
        } else {
            console.error(`❌ Error en fetchApi:`, error);
        }

        // Mantener compatibilidad: devolver array vacío si se esperaba lista, o null si no.
        return wrappedByList ? [] : null;
    }
}