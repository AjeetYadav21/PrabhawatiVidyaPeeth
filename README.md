# Prabhawati Vidyapeeth

Next.js 16 + MongoDB CMS migration for the Prabhawati Vidyapeeth website.

The project now contains:

- A bilingual public site under `src/app/(public)/[locale]`
- An admin CMS under `/admin`
- MongoDB + Mongoose models for all planned content sections
- Auth, protected admin routes, uploads, and contact submission handling
- Seed scripts for initial content and the admin user

## Status

Implemented now:

- Next.js app scaffold and global design system
- `next-intl` locale routing for `en` and `hi`
- MongoDB connection, Mongoose models, and section registry
- Admin auth API and protected admin shell
- Admin editors for all 11 CMS sections
- Admin inbox for contact submissions
- Registration settings, registration management, and CSV export
- Registration submission with uploads and Razorpay payment flow
- Public homepage rendering from CMS-backed server data with seed fallback
- Public contact form posting to `/api/contact`
- CMS-backed footer and structured data on the public site

Still in progress:

- Final polish and QA from later plan waves

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- MongoDB + Mongoose
- `next-intl`
- `jose` for JWT
- `bcryptjs` for password hashing

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create local env file

Copy `.env.local.example` to `.env.local` and set values as needed.

```env
MONGODB_URI=mongodb://localhost:27017/pvp
JWT_SECRET=change-this-to-a-long-random-secret
ADMIN_EMAIL=admin@prabhawatividyapeeth.in
ADMIN_PASSWORD=change-this-password
NEXT_PUBLIC_SITE_URL=https://prabhawatividyapeeth.in
```

### 3. Start MongoDB

The admin login, content saves, uploads metadata, and valid contact submissions require MongoDB to be available at `MONGODB_URI`.

### 4. Seed the database

```bash
npm run seed
```

This creates or updates:

- The admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Singleton documents for main site sections
- Collection documents for gallery, events, and announcements

### 5. Start development server

```bash
npm run dev
```

### 6. Production build

```bash
npm run build
npm run start
```

## Main Routes

Public:

- `/en`
- `/hi`

Admin:

- `/admin/login`
- `/admin`
- `/admin/sections/[section]`
- `/admin/registration-settings`
- `/admin/registrations`
- `/admin/contact-submissions`

API:

- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/verify`
- `/api/contact`
- `/api/content/[section]`
- `/api/admin/sections/[section]`
- `/api/admin/contact-submissions`
- `/api/admin/upload`

## Project Structure

```text
src/
  app/
    (public)/[locale]/        Public site
    (admin)/admin/            Admin UI
    api/                      Route handlers
  components/
    admin/                    Admin UI components
    public/                   Public interactive components
    shared/                   Shared layout/navigation components
  lib/
    auth.ts                   JWT + password helpers
    db.ts                     MongoDB connection
    public-home-content.ts    Public CMS data loader
    section-registry.ts       Section model mapping
  scripts/
    seed.ts                   Seed runner
    seed-data.ts              Default content
  types/
    content.ts                CMS contracts
```

## Notes

- The public homepage uses CMS-backed server data when MongoDB is available.
- If MongoDB is not available, the homepage falls back to seeded default content so the public route still renders.
- Admin routes stay protected; unauthenticated access redirects to `/admin/login`.
- Root-level legacy static site files are still present for reference during migration.
- The request gate now uses `proxy.ts` instead of the deprecated `middleware.ts` convention.

## Verification

Recent checks completed in this workspace:

- `npx tsc --noEmit`
- `npm run build`
- Runtime smoke checks for `/en`, `/admin/login`, admin redirect behavior, and contact API validation
