import fetchApi from "./strapi";
import type { Review } from "../lib/types";

export async function getReviews(): Promise<Review[]> {
    return fetchApi({
        endpoint: 'reviews',
        wrappedByKey: 'data',
        wrappedByList: true
    })
}