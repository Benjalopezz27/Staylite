import React, { useEffect, useState } from 'react';
import type { Review } from '@/lib/types';
import fetchApi from '@/services/strapi';

export default function ReviewList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetchApi({
          endpoint: 'reviews',
          query: { populate: '*' },
        });

        // Ensure we properly map Strapi response structure. 
        // In Strapi v5, data usually comes as response.data, and attributes are flattened by default unless modified.
        // We handle both v4 (item.attributes) and v5 (item directly) formats for robustness.
        const dataArray = response?.data || response || [];
        
        const mappedReviews: Review[] = dataArray.map((item: any) => {
          const attributes = item.attributes || item;
          return {
            user: attributes.user,
            rating: attributes.rating || 5,
            comment: attributes.comment,
            role: attributes.role,
            date: attributes.date,
          };
        });

        setReviews(mappedReviews);
      } catch (error) {
        console.error("Error fetching reviews from Strapi:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 w-full col-span-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground col-span-full text-center py-10">
        No hay reseñas disponibles en este momento.
      </p>
    );
  }

  return (
    <>
      {reviews.map((review, index) => (
        <div
          key={index}
          className="bg-card border border-muted-foreground/10 rounded-2xl p-6 flex flex-col gap-6 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {/* Stars */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < review.rating;
              return (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={filled ? "#f97316" : "none"}
                  stroke={filled ? "#f97316" : "currentColor"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={filled ? "" : "text-muted-foreground/20"}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              );
            })}
          </div>

          {/* Comment */}
          <blockquote className="text-muted-foreground text-base leading-relaxed grow italic">
            "{review.comment}"
          </blockquote>

          {/* Separator Line */}
          <div className="h-[1px] bg-muted-foreground/10 w-full"></div>

          {/* Guest Footer */}
          <div className="flex flex-col">
            <h4 className="font-bold text-foreground text-lg">{review.user}</h4>
            <p className="text-sm text-muted-foreground/80">
              {review.role || "Huésped del Hotel"}
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1 font-medium">
              {review.date}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
