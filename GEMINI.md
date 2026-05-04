# StayLite - Project Memory

## 🚀 Project Overview
StayLite is a premium room booking platform.
- **Frontend**: Astro (v5+), React (v19), Tailwind CSS (v4).
- **Backend**: Strapi v5 (Migration from Sanity in progress).
- **Auth**: Clerk integration.

## 🛠️ Technology Stack
- **Framework**: Astro (v5.16+)
- **UI Logic**: React (v19.2+)
- **Styling**: Tailwind CSS (v4.1+)
- **CMS**: Strapi v5 (Backend folder)
- **Auth**: Clerk (@clerk/astro)
- **State Management**: Nanostores
- **Deployment**: Netlify

## 📍 Current Status
- **Frontend**: Home page sections (Hero, Welcome, Category, Amenities, Dining, CTA) implemented. Reservation component detailed.
- **Backend**: Strapi initialized in `backend/` directory. Server running correctly.
- **Migration**: Sanity removed; transitioning to Strapi for dynamic content.
- **Environment**: Docker integration with PostgreSQL completed. Local port 5433 mapped to DB for host development.

## 📝 Active Tasks
- [x] Restore/Setup Strapi environment and Docker integration.
- [x] Replicate Room/Category schemas in Strapi.
- [x] Seed Strapi with initial data from constants.
- [x] Connect Astro frontend to Strapi API (`strapi.ts`, `roomsData.ts`, `categoryData.ts`, `reviewData.ts`).
- [x] Fetch and display room details dynamically from Strapi (including IDs for booking).
- [x] Implement booking logic with Strapi/Clerk/Stripe (Frontend form, service integration, and checkout flow completed).
- [x] Implement Stripe Webhook for payment confirmation (`webhook.ts`).
- [x] Implement User Bookings dashboard (`user-bookings.ts`, `bookings.astro`).
- [x] Implement Booking Cancellation logic (`cancel-booking.ts`).
- [x] Implement User Account Settings dashboard (Profile, Security, Billing, Notifications).
- [] Refine "About" page.

## 📓 Session Compact
- **2026-05-04**: Initialized project memory and audited filesystem. Fixed React `useContext` null error in `account.astro` by adding `client:load` and refactoring `ProfileSettings.tsx` to use `@clerk/astro/client` stores (avoiding version conflicts). Installed Stripe frontend SDKs (`@stripe/stripe-js`, `@stripe/react-stripe-js`) for the Billing settings. Implemented a comprehensive Account dashboard with multiple tabs and deep Clerk/Stripe integration.

## 🗂️ Project Structure
- `/frontend`: Astro application.
  - `src/sections/`: Modular UI sections.
  - `src/components/`: Reusable components.
  - `src/pages/`: Project routes.
- `/backend`: Strapi CMS application.
  - `src/api/`: Content types and controllers.
