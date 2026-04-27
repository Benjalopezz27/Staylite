import fetchApi from "./strapi";
import type { Room, Category } from "@/lib/types";

const API = { getRooms, getRoomsByCategory, getRoomBySlug }
export default API;

const ROOM_POPULATE = ['image', 'thumbnails', 'category', 'amenities', 'features'];

function mapStrapiRoom(item: any): Room {
    const attributes = item.attributes || item;

    // Handle nested category depending on v4/v5 format
    // In v5 flattened, category might be directly on attributes
    const categoryData = attributes.category?.data?.attributes || attributes.category || {};

    const strapiUrl = import.meta.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
    const formatUrl = (url: string) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `${strapiUrl}${url}`;
    };

    // Image handling for v4 and v5 (flattened or not)
    const imageNode = attributes.image?.data?.attributes || attributes.image;
    const imageUrl = imageNode?.url || '';

    // Thumbnails handling
    const thumbnailsData = attributes.thumbnails?.data || (Array.isArray(attributes.thumbnails) ? attributes.thumbnails : []);
    const thumbnails = thumbnailsData.map((t: any) => {
        const tAttr = t.attributes || t;
        return { src: formatUrl(tAttr.url) };
    }).filter((t: any) => t.src !== '');

    return {
        id: item.id,
        documentId: item.documentId,
        name: attributes.name || '',
        slug: attributes.slug || '',
        price: attributes.price || 0,
        discount: attributes.discount || 0,
        description: attributes.description || '',
        category: {
            name: categoryData.name || '',
            slug: categoryData.slug || '',
            image: categoryData.image ? [categoryData.image] : []
        } as Category,
        image: { src: formatUrl(imageUrl) } as any,
        thumbnails: thumbnails as any,
        amenities: attributes.amenities || [],
        features: attributes.features || []
    };
}

async function getRooms(): Promise<Room[]> {
    const response = await fetchApi({
        endpoint: 'rooms',
        query: { populate: ROOM_POPULATE },
    });

    const dataArray = response?.data || response || [];
    console.log(`[roomsData] getRooms found ${Array.isArray(dataArray) ? dataArray.length : 0} rooms`);
    
    if (!Array.isArray(dataArray)) {
        console.error('[roomsData] expected array but got:', typeof dataArray);
        return [];
    }

    return dataArray.map(mapStrapiRoom);
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
    console.log(`[roomsData] Fetching room by slug: ${slug}`);
    const response = await fetchApi({
        endpoint: 'rooms',
        query: {
            filters: { slug: { $eq: slug } },
            populate: ROOM_POPULATE
        },
    });

    const dataArray = response?.data || response || [];
    console.log(`[roomsData] getRoomBySlug found ${Array.isArray(dataArray) ? dataArray.length : 0} items for slug ${slug}`);

    if (!Array.isArray(dataArray) || dataArray.length === 0) return null;

    const mapped = mapStrapiRoom(dataArray[0]);
    console.log(`[roomsData] Mapped room: ${mapped.name} (id: ${mapped.id})`);
    return mapped;
}

export async function getRoomsByCategory(categorySlug: string): Promise<Room[]> {
    const response = await fetchApi({
        endpoint: 'rooms',
        query: {
            filters: { category: { slug: { $eq: categorySlug } } },
            populate: ROOM_POPULATE
        },
    });

    const dataArray = response?.data || response || [];
    if (!Array.isArray(dataArray)) return [];

    return dataArray.map(mapStrapiRoom);
}