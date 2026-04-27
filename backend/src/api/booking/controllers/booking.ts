/**
 * booking controller
 */

import { factories } from '@strapi/strapi';

/** Generates a unique booking code: SL-XXXXXX (6 uppercase alphanumeric chars) */
function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SL-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({

  /**
   * Custom action: creates a booking with the room relation via the Document Service,
   * bypassing the public REST API sanitizer that blocks relation fields for certain tokens.
   * Also generates a unique bookingCode in the format SL-XXXXXX.
   */
  async createWithRoom(ctx) {
    const { data } = ctx.request.body as { data: Record<string, any> };

    if (!data) {
      return ctx.badRequest('Missing data in request body');
    }

    const { room: roomDocumentId, ...bookingData } = data;

    // Generate a unique code (retry up to 5 times on collision)
    let bookingCode = generateBookingCode();
    for (let attempt = 0; attempt < 4; attempt++) {
      const existing = await strapi.documents('api::booking.booking').findMany({
        filters: { bookingCode } as any,
      });
      if (!existing.length) break;
      bookingCode = generateBookingCode();
    }

    const created = await strapi.documents('api::booking.booking').create({
      data: {
        ...bookingData,
        bookingCode,
        ...(roomDocumentId ? { room: roomDocumentId } : {}),
      } as any,
      status: 'published',
      populate: ['room'],
    });

    return { data: created };
  },

  /**
   * Custom action: updates contact details on an existing booking via Document Service,
   * bypassing the REST API permission layer.
   * Accepts: documentId, phone, notes, country, city
   */
  async updateDetails(ctx) {
    const { documentId, phone, notes, country, city } =
      ctx.request.body as Record<string, any>;

    if (!documentId) {
      return ctx.badRequest('documentId is required');
    }

    const updateData: Record<string, any> = {};
    if (phone !== undefined && phone !== null) updateData.customerPhone = phone;
    if (notes !== undefined) updateData.notes = notes || null;
    if (country) updateData.customerCountry = country;
    if (city) updateData.customerCity = city;

    const updated = await strapi.documents('api::booking.booking').update({
      documentId,
      data: updateData as any,
      status: 'published',
    });

    return { data: updated };
  },

  /**
   * Custom action: Confirms the payment of a booking by updating its status to 'confirmed'.
   * Called securely from the Astro backend after Stripe verification.
   */
  async confirmPayment(ctx) {
    const { documentId } = ctx.request.body as Record<string, any>;

    if (!documentId) {
      return ctx.badRequest('documentId is required');
    }

    const updated = await strapi.documents('api::booking.booking').update({
      documentId,
      data: {
        bookingStatus: 'confirmed',
      } as any,
      status: 'published',
    });

    return { data: updated };
  },
}));
