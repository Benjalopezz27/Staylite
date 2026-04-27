import fetchApi from "@/services/strapi";

export async function getCategories() {
    return fetchApi({
        endpoint: 'categories',
        wrappedByKey: 'data',
    })
}

export async function getCategory(slug: string) {
    const response = await fetchApi({
        endpoint: 'categories',
        query: {
            filters: { slug: { $eq: slug } },
            populate: '*'
        },
    });
    // Strapi v5 returns { data: [...], meta: {} } — we need the first item
    const items = response?.data || response || [];
    return items[0] ?? null;
}