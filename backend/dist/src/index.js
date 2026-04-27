"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register({ strapi }) { },
    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    async bootstrap({ strapi }) {
        const reviewsCount = await strapi.documents('api::review.review').count({});
        if (reviewsCount === 0) {
            console.log('Seeding reviews...');
            const reviewsData = [
                {
                    "user": "Carlos Mendoza",
                    "rating": 5,
                    "comment": "Una experiencia inolvidable. La habitación Royal superó todas mis expectativas y el servicio fue impecable desde el primer minuto.",
                    "role": "Huésped VIP",
                    "date": "2026-04-10"
                },
                {
                    "user": "Laura Gómez",
                    "rating": 4,
                    "comment": "Excelente ubicación y vistas maravillosas. El desayuno podría tener más opciones, pero en general fue una estadía fantástica.",
                    "role": "Huésped Frecuente",
                    "date": "2026-04-15"
                },
                {
                    "user": "Martín Suárez",
                    "rating": 5,
                    "comment": "El bar y lounge son increíbles. Recomiendo totalmente el servicio a la habitación, muy rápido y la comida de primer nivel.",
                    "role": "Viajero de Negocios",
                    "date": "2026-04-18"
                },
                {
                    "user": "Ana Paula Silva",
                    "rating": 5,
                    "comment": "Nos alojamos en la Suite Ejecutiva por nuestro aniversario. Cada detalle estuvo cuidado a la perfección. Definitivamente volveremos.",
                    "role": "Huésped",
                    "date": "2026-04-20"
                },
                {
                    "user": "Diego Torres",
                    "rating": 4,
                    "comment": "Muy buena atención del personal en la recepción. La cama es súper cómoda, el único detalle fue que el wifi iba un poco lento en la terraza.",
                    "role": "Huésped",
                    "date": "2026-04-21"
                }
            ];
            for (const review of reviewsData) {
                await strapi.documents('api::review.review').create({
                    data: review,
                    status: 'published'
                });
            }
            console.log('✅ Reviews seeded successfully!');
        }
    },
};
