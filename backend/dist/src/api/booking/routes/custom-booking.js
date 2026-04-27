"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'POST',
            path: '/bookings/create-with-room',
            handler: 'booking.createWithRoom',
            config: {
                auth: false,
                policies: [],
            },
        },
        {
            method: 'PATCH',
            path: '/bookings/update-details',
            handler: 'booking.updateDetails',
            config: {
                // Auth handled upstream by Clerk in the Astro proxy.
                auth: false,
                policies: [],
            },
        },
        {
            method: 'PATCH',
            path: '/bookings/confirm-payment',
            handler: 'booking.confirmPayment',
            config: {
                auth: false,
                policies: [],
            },
        },
    ],
};
