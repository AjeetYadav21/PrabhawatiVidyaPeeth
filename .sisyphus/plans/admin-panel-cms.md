# Admin Panel with CMS + Full Next.js Migration — Prabhawati Vidyapeeth

## TL;DR

> **Quick Summary**: Migrate the static Prabhawati Vidyapeeth school website from a single-page HTML site (GitHub Pages) to a full-stack Next.js 14+ application with MongoDB-backed CMS, JWT-authenticated admin panel, SSR public pages, and EN/HI internationalization — all hosted on user's own server via Cloudflare Tunnel.
> 
> **Deliverables**:
> - Next.js 14+ App Router application with TypeScript
> - MongoDB database with Mongoose models for all content sections
> - JWT-authenticated admin panel at `/admin/*` for managing all 10 site sections
> - SSR public-facing website pixel-matching the current design
> - EN/HI internationalization via next-intl
> - Dynamic SEO (meta, OG, Twitter, JSON-LD, sitemap) from CMS content
> - Image upload and management for Gallery + other sections
> - Contact form submissions stored in MongoDB
> - Announcements/Notices feature (new)
> - Seed script populating CMS with current site content
> 
> **Estimated Effort**: Large (30+ tasks across 5 waves)
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: Setup → Models/Auth → API Routes → Admin UI → Public Pages → SEO/i18n → Final QA

---

## Context

### Original Request
User wants an admin panel with CMS for their school website (Prabhawati Vidyapeeth, Ballia UP). Chose Option B (dedicated backend + API) over git-based CMS for future extensibility. Selected full migration at once, SSR for SEO preservation, and all sections CMS-editable.

### Interview Summary
**Key Discussions**:
- **Stack**: Next.js 14+ App Router (full-stack) — handles admin, API, and public site
- **Database**: MongoDB (flexible schema for evolving CMS content)
- **Auth**: Email/Password + JWT (single admin, no roles for now)
- **Hosting**: User's own server via Cloudflare Tunnel
- **Content Delivery**: SSR — pages fetch from MongoDB at request time, full HTML sent to crawlers
- **Migration**: Full migration at once (not phased)
- **CMS Scope**: User selected 8 sections + the 2 unselected sections (Why Us, Hall of Fame) are included as well = 10 total + Announcements (new)
- **Multilingual**: EN/HI — port from client-side translations.js to next-intl

**Research Findings**:
- Current site: 958-line index.html, styles.css (1441 lines, CSS custom properties), script.js (453 lines, 14 features), translations.js (126 keys per language)
- SEO score 9/10: Full meta tags, OG, Twitter Card, JSON-LD, sitemap, robots.txt, hreflang, geo tags
- 44 image files across gallery/, events/, banners/, news/, icons/
- No backend, database, auth, or test infrastructure exists currently
- Hindi is LTR (NOT RTL) — Devanagari script

### Metis Review
**Identified Gaps** (addressed):
- Section mismatch resolved: All 10 existing sections + Announcements (new) = 11 CMS-managed sections
- Contact form: submissions stored in MongoDB, no email notifications (future)
- Single admin user, no roles (future extensibility)
- Image management: Gallery uploads + section hero images
- CSS custom properties ported directly, NOT replaced with Tailwind
- Mongoose singleton connection pattern for dev hot-reload safety
- `jose` for JWT (Edge Runtime compatible), `next-intl` for i18n
- Middleware composition: next-intl + auth in single middleware.ts

---

## Work Objectives

### Core Objective
Replace the static GitHub Pages school website with a full-stack Next.js application featuring a CMS admin panel, SSR public pages, and MongoDB content storage — preserving the exact current design, SEO score, and bilingual support while enabling dynamic content management.

### Concrete Deliverables
- `/` — SSR public homepage with all 10 sections rendered from CMS data
- `/admin` — Protected admin dashboard
- `/admin/sections/*` — CMS editors for each of the 11 content sections
- `/admin/gallery` — Image upload/management
- `/admin/contact-submissions` — View contact form submissions
- `/api/content/*` — Public GET endpoints for section content
- `/api/admin/*` — Protected CRUD endpoints for admin operations
- `/api/auth/*` — Login/logout/verify endpoints
- Dynamic sitemap.xml, robots.txt
- Seed script for initial admin user + content from current HTML
- MongoDB models for all sections

### Definition of Done
- [ ] `npm run build` succeeds with zero errors
- [ ] All 10 public sections render with SSR (view-source shows content in HTML)
- [ ] Admin login works with JWT auth
- [ ] Admin can edit all 11 sections and changes reflect on public site
- [ ] Gallery image upload works
- [ ] Contact form submissions are stored in MongoDB
- [ ] EN/HI language toggle works on all pages
- [ ] SEO meta tags, OG, Twitter Card, JSON-LD render dynamically
- [ ] Lighthouse SEO score ≥ 90
- [ ] Site visually matches current design at desktop and mobile (768px breakpoint)

### Must Have
- SSR for all public pages (no client-side-only content fetching for main content)
- All existing CSS custom properties preserved (colors, typography, spacing)
- All 14 interactive features from script.js ported (stars, scroll reveal, lightbox, etc.)
- All 126 translation keys per language working
- JWT auth with httpOnly cookies (not localStorage)
- Mongoose singleton connection pattern (dev hot-reload safe)
- .gitignore file
- Seed script with actual content from current HTML

### Must NOT Have (Guardrails)
- NO Tailwind CSS — port existing CSS custom properties as global stylesheet
- NO rich text editor (WYSIWYG) — plain text/markdown fields only
- NO draft/publish workflow — edits go live immediately
- NO content versioning or revision history
- NO multi-user or role-based access — single admin account
- NO email sending service (contact form stores only, no notifications)
- NO next-pwa or service worker setup
- NO API versioning (/api/v1/) — flat API routes
- NO over-abstraction — no generic "block editor" or "widget system"
- NO dir="rtl" — Hindi (Devanagari) is LTR
- NO Tailwind — use existing CSS design system
- NO excessive JSDoc/comments — clean code speaks for itself
- NO placeholder content — seed script uses ACTUAL current site content

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: NO (Agent-Executed QA is primary verification)
- **Framework**: None for now
- **Rationale**: No test infrastructure exists. Focus on comprehensive agent QA. Testing infra can be added as a future task.

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API**: Use Bash (curl) — Send requests, assert status + response fields
- **Build**: Use Bash — Run build commands, check exit codes
- **Admin Panel**: Use Playwright — Login, navigate admin, edit content, verify changes on public site

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — all independent, start immediately):
├── Task 1: Next.js project scaffolding + config [quick]
├── Task 2: MongoDB connection + Mongoose setup [quick]
├── Task 3: Global CSS design system port [quick]
├── Task 4: Content type definitions (TypeScript) [quick]
├── Task 5: Static assets migration (images/fonts) [quick]
└── Task 6: .gitignore + project config files [quick]

Wave 2 (Core Infrastructure — depends on Wave 1):
├── Task 7: Auth system (JWT + middleware) (depends: 2, 4) [deep]
├── Task 8: Mongoose models for all sections (depends: 2, 4) [unspecified-high]
├── Task 9: next-intl i18n setup + translation port (depends: 1) [unspecified-high]
├── Task 10: Shared UI components (Header/Footer/Layout) (depends: 3, 5) [visual-engineering]
├── Task 11: Stars animation React component (depends: 3) [visual-engineering]
└── Task 12: Scroll effects + interactive utilities (depends: 3) [visual-engineering]

Wave 3 (API + Admin Foundation — depends on Wave 2):
├── Task 13: Public content API routes (depends: 8) [unspecified-high]
├── Task 14: Admin CRUD API routes (depends: 7, 8) [unspecified-high]
├── Task 15: Image upload API + storage (depends: 7, 8) [unspecified-high]
├── Task 16: Seed script (depends: 8, 9) [unspecified-high]
├── Task 17: Admin layout + dashboard page (depends: 7, 10) [visual-engineering]
├── Task 18: Admin auth pages (login) (depends: 7) [visual-engineering]
└── Task 19: Contact form submission API (depends: 8) [quick]

Wave 4 (Admin Editors + Public Pages — depends on Wave 3):
├── Task 20: Admin CMS editors — Hero + About + Contact (depends: 14, 17) [visual-engineering]
├── Task 21: Admin CMS editors — Academics + Why Us + Hall of Fame (depends: 14, 17) [visual-engineering]
├── Task 22: Admin CMS editors — Gallery + Events (depends: 14, 15, 17) [visual-engineering]
├── Task 23: Admin CMS editors — Admissions + Announcements (depends: 14, 17) [visual-engineering]
├── Task 24: Admin contact submissions viewer (depends: 17, 19) [visual-engineering]
├── Task 25: Public page — Hero + About sections (depends: 10, 11, 12, 13) [visual-engineering]
├── Task 26: Public page — Academics + Why Us sections (depends: 10, 12, 13) [visual-engineering]
├── Task 27: Public page — Hall of Fame + Gallery sections (depends: 10, 12, 13) [visual-engineering]
├── Task 28: Public page — Events + Admissions sections (depends: 10, 12, 13) [visual-engineering]
├── Task 29: Public page — Contact + Announcements sections (depends: 10, 12, 13, 19) [visual-engineering]
└── Task 30: Gallery lightbox component (depends: 27) [visual-engineering]

Wave 5 (SEO + Integration + Polish — depends on Wave 4):
├── Task 31: Dynamic SEO — meta, OG, Twitter, JSON-LD (depends: 25-29) [deep]
├── Task 32: Dynamic sitemap.xml + robots.txt (depends: 13) [quick]
├── Task 33: Middleware composition (auth + i18n) (depends: 7, 9) [deep]
├── Task 34: Back-to-top + preloader + misc features (depends: 25) [quick]
└── Task 35: Full build verification + Lighthouse audit (depends: all) [deep]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA with Playwright (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T2 → T8 → T13/T14 → T20-23/T25-29 → T31 → T35 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 6 (Wave 1, Wave 4)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 9, 10, 11, 12 | 1 |
| 2 | — | 7, 8 | 1 |
| 3 | — | 10, 11, 12 | 1 |
| 4 | — | 7, 8 | 1 |
| 5 | — | 10 | 1 |
| 6 | — | — | 1 |
| 7 | 2, 4 | 14, 15, 17, 18, 33 | 2 |
| 8 | 2, 4 | 13, 14, 15, 16, 19 | 2 |
| 9 | 1 | 16, 33 | 2 |
| 10 | 3, 5 | 17, 25-29 | 2 |
| 11 | 3 | 25 | 2 |
| 12 | 3 | 25-29 | 2 |
| 13 | 8 | 25-29, 32 | 3 |
| 14 | 7, 8 | 20-23 | 3 |
| 15 | 7, 8 | 22 | 3 |
| 16 | 8, 9 | — | 3 |
| 17 | 7, 10 | 20-24 | 3 |
| 18 | 7 | — | 3 |
| 19 | 8 | 24, 29 | 3 |
| 20-24 | 14, 17 (varies) | — | 4 |
| 25-29 | 10, 12, 13 (varies) | 31 | 4 |
| 30 | 27 | — | 4 |
| 31 | 25-29 | 35 | 5 |
| 32 | 13 | 35 | 5 |
| 33 | 7, 9 | 35 | 5 |
| 34 | 25 | 35 | 5 |
| 35 | all | F1-F4 | 5 |

### Agent Dispatch Summary

- **Wave 1**: **6 tasks** — All `quick`
- **Wave 2**: **6 tasks** — T7 `deep`, T8-9 `unspecified-high`, T10-12 `visual-engineering`
- **Wave 3**: **7 tasks** — T13-16 `unspecified-high`, T17-18 `visual-engineering`, T19 `quick`
- **Wave 4**: **11 tasks** — T20-30 all `visual-engineering`
- **Wave 5**: **5 tasks** — T31/33/35 `deep`, T32/34 `quick`
- **FINAL**: **4 tasks** — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high` + playwright skill, F4 `deep`

---

## TODOs

- [x] 1. Next.js Project Scaffolding + Configuration

  **What to do**:
  - Initialize Next.js 14+ with App Router and TypeScript: `npx create-next-app@latest . --typescript --app --src-dir --no-tailwind --eslint`
  - Configure `next.config.js` with image domains, i18n stub, and server-side settings
  - Set up the directory structure:
    ```
    src/
      app/
        (public)/          # Route group for public pages
          [locale]/         # i18n segment (en/hi)
            page.tsx        # Homepage (SSR)
            layout.tsx      # Public layout
        (admin)/           # Route group for admin panel
          admin/
            layout.tsx     # Admin layout
            page.tsx       # Dashboard
        api/               # API routes
          auth/
          content/
          admin/
      components/
        public/            # Public site components
        admin/             # Admin panel components
        shared/            # Shared (Header, Footer, etc.)
      lib/
        db.ts              # MongoDB connection
        auth.ts            # JWT utilities
        models/            # Mongoose models
      types/               # TypeScript type definitions
    ```
  - Create `.env.local.example` with required env vars (MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
  - Install core dependencies: `mongoose`, `jose`, `next-intl`, `bcryptjs`
  - Install dev dependencies: `@types/bcryptjs`
  - Configure ESLint with Next.js recommended rules
  - Set `package.json` scripts: `dev`, `build`, `start`, `seed`

  **Must NOT do**:
  - Do NOT install Tailwind CSS
  - Do NOT install any UI component library (shadcn, Ant Design, MUI)
  - Do NOT install next-pwa or any PWA tooling
  - Do NOT add API versioning paths

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard project scaffolding with clear commands, no complex logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser testing needed for scaffolding

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6)
  - **Blocks**: Tasks 9, 10, 11, 12
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - Current `index.html` lines 1-10 — see doctype and lang structure to understand the site
  - Current project root directory listing — understand what files exist now

  **External References**:
  - Next.js App Router docs: https://nextjs.org/docs/app — App Router directory conventions
  - next-intl docs: https://next-intl-docs.vercel.app/ — i18n routing setup with [locale]

  **WHY Each Reference Matters**:
  - The current site structure informs what the new structure needs to accommodate
  - Next.js App Router conventions dictate the exact directory layout

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Next.js dev server starts successfully
    Tool: Bash
    Preconditions: All dependencies installed
    Steps:
      1. Run `npm run dev` in background, wait 10s
      2. Run `curl http://localhost:3000` — assert HTTP 200
      3. Kill dev server
    Expected Result: Dev server starts without errors, returns 200
    Failure Indicators: Port conflict, missing dependencies, TypeScript errors
    Evidence: .sisyphus/evidence/task-1-dev-server.txt

  Scenario: Project structure matches specification
    Tool: Bash
    Preconditions: Project initialized
    Steps:
      1. Verify directories exist: src/app/(public), src/app/(admin), src/app/api, src/components, src/lib, src/types
      2. Verify package.json has mongoose, jose, next-intl, bcryptjs in dependencies
      3. Verify .env.local.example exists with MONGODB_URI, JWT_SECRET
      4. Verify no tailwind.config.js or tailwind references
    Expected Result: All directories exist, all deps listed, no Tailwind
    Failure Indicators: Missing directories, missing dependencies
    Evidence: .sisyphus/evidence/task-1-structure.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(setup): initialize Next.js project with App Router and TypeScript`
  - Files: `package.json, next.config.js, tsconfig.json, .env.local.example, src/app/**`

- [x] 2. MongoDB Connection + Mongoose Setup

  **What to do**:
  - Create `src/lib/db.ts` — Mongoose connection with global singleton pattern for dev hot-reload safety:
    ```typescript
    // Cache connection on global object to prevent multiple connections during hot reload
    const cached = global.mongoose || { conn: null, promise: null }
    if (!global.mongoose) global.mongoose = cached
    ```
  - Use `MONGODB_URI` from env vars, throw clear error if missing
  - Export an `async function connectDB()` that returns the cached connection or creates new one
  - Add TypeScript augmentation for `global.mongoose` in `src/types/global.d.ts`

  **Must NOT do**:
  - Do NOT create any models yet (Task 8 handles that)
  - Do NOT use connection pooling settings beyond Mongoose defaults
  - Do NOT add retry logic or complex error handling — simple throw on failure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, well-known pattern, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5, 6)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - Mongoose global caching pattern is standard in Next.js projects — the singleton prevents new connections on every hot reload in development

  **External References**:
  - Next.js + Mongoose example: https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose

  **WHY Each Reference Matters**:
  - The singleton pattern is critical — without it, each hot reload creates a new MongoDB connection, eventually hitting connection limits

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: MongoDB connection succeeds
    Tool: Bash
    Preconditions: MongoDB running (local or Atlas), MONGODB_URI set in .env.local
    Steps:
      1. Create a temp test script: `node -e "const {connectDB} = require('./src/lib/db'); connectDB().then(() => console.log('CONNECTED')).catch(e => console.log('FAILED', e))"`
      2. Run the script
      3. Assert output contains "CONNECTED"
    Expected Result: "CONNECTED" printed, no errors
    Failure Indicators: "FAILED" with connection error, timeout, missing URI error
    Evidence: .sisyphus/evidence/task-2-db-connection.txt

  Scenario: Missing MONGODB_URI throws clear error
    Tool: Bash
    Preconditions: MONGODB_URI not set
    Steps:
      1. Temporarily unset MONGODB_URI
      2. Attempt to call connectDB()
      3. Assert error message mentions "MONGODB_URI"
    Expected Result: Clear error message about missing env var
    Failure Indicators: Generic/cryptic error, silent failure
    Evidence: .sisyphus/evidence/task-2-missing-uri.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(db): add MongoDB connection with Mongoose singleton pattern`
  - Files: `src/lib/db.ts, src/types/global.d.ts`

- [x] 3. Global CSS Design System Port

  **What to do**:
  - Create `src/app/globals.css` — port ALL CSS custom properties from current `styles.css`:
    - Colors: primary (#1e3a8a), secondary (#f97316), accent (#16a34a), full neutral scale (gray-50 to gray-900)
    - Typography: fluid clamp() sizes (fs-xs through fs-5xl)
    - Spacing scale (space-1 through space-24)
    - Container max-width 1280px
    - Border-radius scale, shadow scale
    - Transition speed tokens
    - Z-index scale
  - Port ALL component classes: .container, .section, .btn variants, .card, .feature-card, .gallery-grid, .gallery-item, .form-group, .reveal, .topper-card, .achievement-card
  - Port ALL animations: fadeInUp, twinkle, orbit-small/medium/large, orbit-reverse-small/medium
  - Port grid classes: grid-2, grid-3, grid-4 with their minmax responsive patterns
  - Port html[lang="hi"] font override selectors
  - Port ALL content from `fixes.css` (back-to-top button styles, language toggle styles)
  - Use `next/font/google` for Inter, Poppins, Noto Sans Devanagari in `src/app/layout.tsx` (root layout)
  - Import Font Awesome 6.4.0 via CDN in root layout head (or install @fortawesome/fontawesome-free)
  - Breakpoint: maintain single 768px breakpoint

  **Must NOT do**:
  - Do NOT use Tailwind CSS — port the CSS as-is
  - Do NOT change any color values, spacing values, or font choices
  - Do NOT "modernize" or "optimize" the CSS — pixel-match is the goal
  - Do NOT remove any existing CSS classes even if they seem unused

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Primarily copying/porting CSS, no complex logic, but large volume
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5, 6)
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `styles.css` (ALL 1441 lines) — this is the source of truth. Port EVERY custom property and class
  - `fixes.css` (ALL 78 lines) — back-to-top and language toggle overrides, merge into globals.css
  - `index.html` lines 1-101 — head section shows font imports and Font Awesome CDN link

  **WHY Each Reference Matters**:
  - styles.css is the complete design system — missing even one variable will break visual parity
  - fixes.css has critical UI fixes that must be included
  - The HTML head shows exact CDN versions used for fonts and icons

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All CSS custom properties defined
    Tool: Bash
    Preconditions: globals.css created
    Steps:
      1. Count CSS custom properties (--) in original styles.css
      2. Count CSS custom properties in new globals.css
      3. Assert counts match (or new >= original)
      4. Specifically check: --color-primary, --fs-5xl, --space-24, --shadow-lg exist
    Expected Result: All custom properties from styles.css present in globals.css
    Failure Indicators: Missing properties, different values
    Evidence: .sisyphus/evidence/task-3-css-properties.txt

  Scenario: Animations defined correctly
    Tool: Bash
    Preconditions: globals.css created
    Steps:
      1. Search for @keyframes in globals.css
      2. Assert these animations exist: fadeInUp, twinkle, orbit-small, orbit-medium, orbit-large, orbit-reverse-small, orbit-reverse-medium
    Expected Result: All 7 animation keyframes present
    Failure Indicators: Missing keyframes
    Evidence: .sisyphus/evidence/task-3-animations.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(styles): port complete CSS design system from static site`
  - Files: `src/app/globals.css, src/app/layout.tsx`

- [x] 4. Content Type Definitions (TypeScript)

  **What to do**:
  - Create `src/types/content.ts` with interfaces for all 11 CMS sections:
    - `HeroContent`: title (en/hi), subtitle1 (en/hi), subtitle2 (en/hi), ctaButtons [{text (en/hi), link}], backgroundImage
    - `AboutContent`: campusImage, paragraphs [{text (en/hi)}], upBoardLink, principalMessage {name (en/hi), image, message (en/hi)}
    - `AcademicsContent`: levels [{name (en/hi), icon, grades (en/hi), description (en/hi)}], subjects [{name (en/hi), icon}], languages [{name (en/hi)}]
    - `WhyUsContent`: features [{title (en/hi), description (en/hi), icon}]
    - `HallOfFameContent`: toppers [{name, class, year, image, score}], achievements [{title (en/hi), description (en/hi), icon}]
    - `GalleryContent`: items [{image, caption (en/hi), category}]
    - `EventsContent`: events [{title (en/hi), description (en/hi), date, image}]
    - `AdmissionsContent`: steps [{number, title (en/hi), description (en/hi)}], documents [{text (en/hi)}], inquiryInfo {phone, email, text (en/hi)}
    - `ContactContent`: info {address (en/hi), phone, email, hours (en/hi)}, tourImage
    - `AnnouncementsContent`: announcements [{title (en/hi), content (en/hi), date, isActive}]
    - `FooterContent`: aboutText (en/hi), quickLinks [{text (en/hi), href}], academicLinks [{text (en/hi), href}]
  - All bilingual fields should use pattern: `{ en: string, hi: string }`
  - Create `src/types/auth.ts`: `AdminUser` (email, passwordHash, createdAt), `LoginPayload`, `JWTPayload`
  - Create `src/types/contact.ts`: `ContactSubmission` (name, email, phone, subject, message, createdAt, isRead)

  **Must NOT do**:
  - Do NOT use generic content types — each section has its own specific shape
  - Do NOT add fields beyond what the current site displays
  - Do NOT add versioning or draft status fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure type definitions, no runtime logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5, 6)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `index.html` lines 142-158 — Hero section structure → HeroContent fields
  - `index.html` lines 162-227 — About section structure → AboutContent fields
  - `index.html` lines 231-370 — Academics section → AcademicsContent fields
  - `index.html` lines 374-440 — Why Choose Us → WhyUsContent fields
  - `index.html` lines 445-524 — Hall of Fame → HallOfFameContent fields
  - `index.html` lines 528-601 — Gallery → GalleryContent fields
  - `index.html` lines 605-647 — Events → EventsContent fields
  - `index.html` lines 651-772 — Admissions → AdmissionsContent fields
  - `index.html` lines 776-892 — Contact → ContactContent fields
  - `translations.js` — ALL 126 keys show which fields need en/hi variants

  **WHY Each Reference Matters**:
  - Each HTML section defines the exact data shape for its content type
  - translations.js reveals which fields need bilingual support (en/hi)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TypeScript types compile without errors
    Tool: Bash
    Preconditions: Type files created
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert zero type errors
    Expected Result: Clean TypeScript compilation
    Failure Indicators: Type errors, missing imports
    Evidence: .sisyphus/evidence/task-4-tsc-check.txt

  Scenario: All 11 section types defined
    Tool: Bash
    Preconditions: src/types/content.ts exists
    Steps:
      1. Search for "export interface" or "export type" in content.ts
      2. Assert these types exist: HeroContent, AboutContent, AcademicsContent, WhyUsContent, HallOfFameContent, GalleryContent, EventsContent, AdmissionsContent, ContactContent, AnnouncementsContent, FooterContent
    Expected Result: All 11 section content types defined
    Failure Indicators: Missing types, typos in names
    Evidence: .sisyphus/evidence/task-4-types-list.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(types): define TypeScript interfaces for all CMS content sections`
  - Files: `src/types/content.ts, src/types/auth.ts, src/types/contact.ts`

- [x] 5. Static Assets Migration (Images/Fonts)

  **What to do**:
  - Move ALL 44 image files from current `images/` directory to `public/images/` preserving exact subdirectory structure:
    - `public/images/` — root level images (logo.png, pv-logo.png, preview.jpg, preloader.gif, favicons, principal-removebg-preview.png, school_campus.jpg)
    - `public/images/gallery/` — all 10 gallery images
    - `public/images/events/` — all 4 event images
    - `public/images/banners/` — all 4 banner images (PV-banner-1.jpg, PV-banner-2.jpg, rev-1.jpg, rev-2.jpg)
    - `public/images/news/` — all 3 news images
    - `public/images/icons/` — all 4 academic level icons
  - Move favicon files to `public/` root
  - Move web-app icons (192x192, 512x512) to `public/`
  - Update `manifest.json` — fix outdated `/assets/images/` paths to `/images/`
  - Move error page images if they exist
  - Create a mapping document or comment listing old path → new path for reference

  **Must NOT do**:
  - Do NOT rename any image files
  - Do NOT compress or resize images
  - Do NOT change image formats
  - Do NOT delete original files until migration is verified

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File copy operations, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 6)
  - **Blocks**: Task 10
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `images/` directory — full listing of all 44 image files with subdirectories
  - `index.html` — all `<img src="images/..."` references show which images are used where
  - `manifest.json` — has outdated icon paths that need fixing

  **WHY Each Reference Matters**:
  - Every image path in the HTML must have a corresponding file in public/images/
  - manifest.json paths are currently broken and need updating

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 44 images accessible via public path
    Tool: Bash
    Preconditions: Images moved to public/images/
    Steps:
      1. Count files in public/images/ recursively
      2. Assert count >= 44
      3. Verify key files exist: public/images/logo.png, public/images/gallery/school_campus.jpg, public/images/banners/PV-banner-1.jpg, public/images/events/1.jpg
    Expected Result: All image files present in correct locations
    Failure Indicators: Missing files, wrong paths
    Evidence: .sisyphus/evidence/task-5-images-count.txt

  Scenario: Manifest.json paths corrected
    Tool: Bash
    Preconditions: manifest.json updated
    Steps:
      1. Read manifest.json
      2. Assert no paths contain "/assets/images/"
      3. Assert icon paths point to valid files in public/
    Expected Result: All manifest paths are valid
    Failure Indicators: Outdated /assets/images/ paths remain
    Evidence: .sisyphus/evidence/task-5-manifest.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `feat(assets): migrate all static images to public/ directory`
  - Files: `public/images/**, manifest.json`

- [x] 6. .gitignore + Project Configuration Files

  **What to do**:
  - Create `.gitignore` with standard Next.js ignores:
    ```
    node_modules/
    .next/
    out/
    .env.local
    .env*.local
    *.tsbuildinfo
    next-env.d.ts
    .sisyphus/evidence/
    ```
  - Create `.env.local.example` (if not done in Task 1):
    ```
    MONGODB_URI=mongodb://localhost:27017/pvp
    JWT_SECRET=your-secret-key-change-this
    ADMIN_EMAIL=admin@prabhawatividyapeeth.in
    ADMIN_PASSWORD=change-this-password
    NEXT_PUBLIC_SITE_URL=https://prabhawatividyapeeth.in
    ```
  - Verify `tsconfig.json` has proper path aliases (@/ for src/)
  - Add `src/lib/constants.ts` with site-wide constants: SITE_NAME, SITE_URL, DEFAULT_LOCALE, SUPPORTED_LOCALES

  **Must NOT do**:
  - Do NOT commit .env.local with real credentials
  - Do NOT add complex build configurations

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration files, minimal logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - Current project root — verify no .gitignore exists (confirmed by Metis)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: .gitignore covers sensitive files
    Tool: Bash
    Preconditions: .gitignore created
    Steps:
      1. Assert .gitignore contains: node_modules, .next, .env.local
      2. Create a test .env.local file
      3. Run `git status` — assert .env.local is NOT listed as untracked
    Expected Result: .env.local is ignored by git
    Failure Indicators: .env.local shows in git status
    Evidence: .sisyphus/evidence/task-6-gitignore.txt
  ```

  **Commit**: YES (group with Wave 1)
  - Message: `chore(config): add .gitignore, env example, and project constants`
  - Files: `.gitignore, .env.local.example, src/lib/constants.ts`

- [x] 7. Auth System (JWT + Middleware)

  **What to do**:
  - Create `src/lib/auth.ts`:
    - `hashPassword(password)` and `verifyPassword(password, hash)` using bcryptjs
    - `createToken(payload)` and `verifyToken(token)` using `jose` library (Edge Runtime compatible)
    - Token payload: `{ userId, email, iat, exp }` with 24h expiry
  - Create `src/middleware.ts`:
    - Check requests to `/admin/*` and `/api/admin/*`
    - Read JWT from httpOnly cookie named `admin-token`
    - Verify token using jose — redirect to `/admin/login` if invalid
    - Skip auth check for `/admin/login` route
    - Compose with next-intl middleware (stub for now, Task 33 will finalize)
  - Create `src/app/api/auth/login/route.ts`:
    - POST: Accept email/password, verify against AdminUser in MongoDB, return httpOnly cookie with JWT
    - Return 401 for invalid credentials with clear error message
  - Create `src/app/api/auth/logout/route.ts`:
    - POST: Clear the httpOnly cookie, return 200
  - Create `src/app/api/auth/verify/route.ts`:
    - GET: Check if current token is valid, return user info or 401

  **Must NOT do**:
  - Do NOT store JWT in localStorage — httpOnly cookies ONLY
  - Do NOT implement refresh token rotation
  - Do NOT implement password reset flow
  - Do NOT implement multi-user registration
  - Do NOT use next-auth — plain JWT with jose

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Security-critical code, middleware composition, Edge Runtime constraints
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9, 10, 11, 12)
  - **Blocks**: Tasks 14, 15, 17, 18, 33
  - **Blocked By**: Tasks 2, 4

  **References**:

  **Pattern References**:
  - `src/lib/db.ts` (from Task 2) — how to import and use the DB connection
  - `src/types/auth.ts` (from Task 4) — AdminUser, LoginPayload, JWTPayload types

  **External References**:
  - jose library docs: https://github.com/panva/jose — JWT creation/verification API
  - Next.js middleware docs: https://nextjs.org/docs/app/building-your-application/routing/middleware

  **WHY Each Reference Matters**:
  - jose is needed because jsonwebtoken doesn't work in Edge Runtime (middleware runs on Edge)
  - Middleware must compose auth + i18n correctly

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Login with valid credentials returns token cookie
    Tool: Bash (curl)
    Preconditions: Admin user seeded in DB, dev server running
    Steps:
      1. curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@pvp.in","password":"admin123"}' -c cookies.txt
      2. Assert HTTP 200
      3. Assert cookies.txt contains "admin-token" cookie with httpOnly flag
    Expected Result: 200 response with httpOnly cookie set
    Failure Indicators: 401, missing cookie, cookie without httpOnly
    Evidence: .sisyphus/evidence/task-7-login-success.txt

  Scenario: Login with invalid credentials returns 401
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"wrong@test.com","password":"wrong"}'
      2. Assert HTTP 401
      3. Assert response body contains error message
    Expected Result: 401 with clear error message
    Failure Indicators: 200 or 500, generic error
    Evidence: .sisyphus/evidence/task-7-login-fail.txt

  Scenario: Protected route redirects without token
    Tool: Bash (curl)
    Preconditions: Dev server running, no cookies
    Steps:
      1. curl -L http://localhost:3000/admin -o /dev/null -w "%{redirect_url}"
      2. Assert redirect to /admin/login
    Expected Result: 302 redirect to login page
    Failure Indicators: 200 (unprotected), 500
    Evidence: .sisyphus/evidence/task-7-protected-redirect.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(auth): add JWT authentication with jose, middleware, and login/logout API`
  - Files: `src/lib/auth.ts, src/middleware.ts, src/app/api/auth/*/route.ts`

- [x] 8. Mongoose Models for All Sections

  **What to do**:
  - Create individual model files in `src/lib/models/`:
    - `hero.ts` — singleton pattern (findOne/upsert), fields from HeroContent type
    - `about.ts` — singleton, paragraphs array, principal message object
    - `academics.ts` — singleton, levels/subjects/languages arrays
    - `whyUs.ts` — singleton, features array
    - `hallOfFame.ts` — singleton, toppers and achievements arrays
    - `gallery.ts` — collection (multiple docs), image path, caption (en/hi), category enum (campus/events/sports/activities)
    - `events.ts` — collection, title/description/date/image
    - `admissions.ts` — singleton, steps/documents/inquiry arrays
    - `contact.ts` — singleton, info object + tour image
    - `announcements.ts` — collection, title/content/date/isActive
    - `footer.ts` — singleton, aboutText, links arrays
    - `contactSubmission.ts` — collection, name/email/phone/subject/message/createdAt/isRead
    - `adminUser.ts` — collection, email/passwordHash/createdAt
  - All bilingual fields use: `{ en: { type: String, required: true }, hi: { type: String, required: true } }`
  - Singleton models should use a fixed identifier (e.g., `slug: 'default'`) for findOne
  - Add Mongoose timestamps option on all models
  - Use `mongoose.models.X || mongoose.model('X', schema)` pattern to prevent model recompilation in dev
  - Create `src/lib/models/index.ts` barrel export

  **Must NOT do**:
  - Do NOT add versioning fields (version, publishedAt, draftContent)
  - Do NOT add softDelete or trash functionality
  - Do NOT add complex validation beyond required fields
  - Do NOT add pre/post hooks for now

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 13 model files, repetitive but must be exact — each section has unique shape
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9, 10, 11, 12)
  - **Blocks**: Tasks 13, 14, 15, 16, 19
  - **Blocked By**: Tasks 2, 4

  **References**:

  **Pattern References**:
  - `src/types/content.ts` (from Task 4) — exact field shapes for each model
  - `src/types/auth.ts` (from Task 4) — AdminUser type
  - `src/types/contact.ts` (from Task 4) — ContactSubmission type
  - `src/lib/db.ts` (from Task 2) — connection pattern to use

  **External References**:
  - Mongoose schema docs: https://mongoosejs.com/docs/guide.html

  **WHY Each Reference Matters**:
  - Types define the exact schema shape — models must match 1:1
  - Singleton vs collection pattern differs per section

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 13 models import without errors
    Tool: Bash
    Preconditions: All model files created
    Steps:
      1. Create temp script importing all models from src/lib/models/index.ts
      2. Run with ts-node or tsx
      3. Assert no import errors, all models are Mongoose Model instances
    Expected Result: All 13 models importable and valid
    Failure Indicators: Import errors, missing exports
    Evidence: .sisyphus/evidence/task-8-model-imports.txt

  Scenario: Singleton model upsert works
    Tool: Bash
    Preconditions: MongoDB running, models created
    Steps:
      1. Connect to DB, call HeroModel.findOneAndUpdate({ slug: 'default' }, testData, { upsert: true, new: true })
      2. Assert document returned with correct fields
      3. Call again with different data — assert same document updated (not duplicated)
    Expected Result: Single document created/updated, no duplicates
    Failure Indicators: Duplicate documents, update failures
    Evidence: .sisyphus/evidence/task-8-singleton-upsert.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(models): add Mongoose models for all 11 CMS sections, auth, and contact`
  - Files: `src/lib/models/*.ts`

- [x] 9. next-intl i18n Setup + Translation Port

  **What to do**:
  - Install and configure `next-intl` for App Router:
    - Create `src/i18n.ts` — request config with messages loading
    - Create `messages/en.json` — port ALL 126 EN keys from translations.js
    - Create `messages/hi.json` — port ALL 126 HI keys from translations.js
    - Update `next.config.js` with next-intl plugin
    - Create `src/app/(public)/[locale]/layout.tsx` — locale-aware layout
  - Translation structure should match current translations.js organization (by section)
  - Preserve EXACT Hindi text — do not modify or re-translate
  - Language detection order: URL path ([locale]) → cookie → navigator.language → 'en'
  - Create language toggle component stub (UI in Task 10)

  **Must NOT do**:
  - Do NOT add languages beyond EN and HI
  - Do NOT modify any Hindi text content
  - Do NOT set dir="rtl" — Hindi (Devanagari) is LTR
  - Do NOT use next-translate or react-intl — use next-intl only

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 126 keys per language to port, next-intl configuration with App Router is non-trivial
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 10, 11, 12)
  - **Blocks**: Tasks 16, 33
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `translations.js` (ALL 309 lines) — THE source of truth for all translation keys and Hindi text. Every key must be ported.
  - `index.html` — `data-i18n` attributes show which elements use which translation keys

  **External References**:
  - next-intl App Router docs: https://next-intl-docs.vercel.app/docs/getting-started/app-router

  **WHY Each Reference Matters**:
  - translations.js contains the exact Hindi text that MUST be preserved character-for-character
  - data-i18n attributes map keys to DOM elements — this mapping guides component implementation

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 126 translation keys present in both languages
    Tool: Bash
    Preconditions: messages/en.json and messages/hi.json created
    Steps:
      1. Count keys in en.json (recursive) — assert >= 126
      2. Count keys in hi.json (recursive) — assert >= 126
      3. Assert key sets are identical (same keys in both files)
    Expected Result: Both files have identical key structure with 126+ keys
    Failure Indicators: Missing keys, mismatched structure
    Evidence: .sisyphus/evidence/task-9-translation-keys.txt

  Scenario: Hindi text preserved exactly
    Tool: Bash
    Preconditions: messages/hi.json created
    Steps:
      1. Compare 5 sample Hindi values from translations.js against hi.json
      2. Specifically check: nav_home, about_title, contact_title, hero_subtitle1, academics_title
      3. Assert character-for-character match
    Expected Result: Hindi text identical to original
    Failure Indicators: Modified text, encoding issues, missing diacriticals
    Evidence: .sisyphus/evidence/task-9-hindi-text.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(i18n): configure next-intl with EN/HI translations ported from static site`
  - Files: `src/i18n.ts, messages/en.json, messages/hi.json, next.config.js`

- [x] 10. Shared UI Components (Header/Footer/Layout)

  **What to do**:
  - Create `src/components/shared/Header.tsx`:
    - Logo (images/logo.png) + "Prabhawati Vidyapeeth" text
    - Language toggle button (#langToggle) — switches locale via next-intl
    - Mobile hamburger menu (#menuToggle)
    - 9 navigation links matching current site (home, about, academics, why-us, hall-of-fame, gallery, events, admissions, contact)
    - Sticky header behavior (.scrolled class at scrollY > 100)
    - Mobile nav: slide-in menu, body scroll lock, close on link/outside click
    - Use existing CSS classes from globals.css
  - Create `src/components/shared/Footer.tsx`:
    - 4 footer columns: about+logo, quick links, academics links, contact info
    - Content fetched from CMS (FooterContent) via props or server component
    - Copyright year dynamic
  - Create `src/components/shared/BackToTop.tsx`:
    - Client component, visible at scrollY > 300, smooth scroll to top
    - Uses existing CSS from fixes.css
  - Create `src/app/(public)/[locale]/layout.tsx`:
    - Server component wrapping all public pages
    - Includes Header, Footer, BackToTop
    - Passes locale to next-intl provider

  **Must NOT do**:
  - Do NOT redesign the header/footer — match current layout exactly
  - Do NOT add new navigation items not in current site
  - Do NOT use a component library — plain React + existing CSS

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI components that must pixel-match existing design, responsive behavior
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 11, 12)
  - **Blocks**: Tasks 17, 25, 26, 27, 28, 29
  - **Blocked By**: Tasks 3, 5

  **References**:

  **Pattern References**:
  - `index.html` lines 108-137 — Header/Nav HTML structure, class names, nav links
  - `index.html` lines 896-943 — Footer HTML structure, 4 columns, links
  - `index.html` lines 946-948 — Back to top button markup
  - `styles.css` — header, nav, footer CSS classes
  - `fixes.css` — back-to-top button styles, language toggle styles
  - `script.js` — sticky header logic (scrollY>100), mobile nav toggle, active nav highlighting

  **WHY Each Reference Matters**:
  - HTML structure defines exact component structure and class names
  - CSS classes must be reused as-is (ported in Task 3)
  - JS logic defines interactive behaviors that must be replicated

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Header renders with all navigation links
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert logo image visible (img[src*="logo"])
      3. Assert 9 nav links present with correct text: Home, About, Academics, Why Us, Hall of Fame, Gallery, Events, Admissions, Contact
      4. Assert language toggle button visible
      5. Screenshot at 1280px width
    Expected Result: Header matches current site header layout
    Failure Indicators: Missing links, wrong text, missing logo
    Evidence: .sisyphus/evidence/task-10-header-desktop.png

  Scenario: Mobile hamburger menu works
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 375x812 (mobile)
      2. Assert hamburger menu button visible
      3. Click hamburger menu
      4. Assert navigation links appear (slide-in)
      5. Click a nav link
      6. Assert menu closes
      7. Screenshot before and after menu open
    Expected Result: Mobile menu opens/closes correctly
    Failure Indicators: Menu doesn't open, links don't appear, menu doesn't close on link click
    Evidence: .sisyphus/evidence/task-10-mobile-menu.png
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(ui): add Header, Footer, BackToTop shared components and public layout`
  - Files: `src/components/shared/*.tsx, src/app/(public)/[locale]/layout.tsx`

- [x] 11. Stars Animation React Component

  **What to do**:
  - Create `src/components/public/StarsAnimation.tsx`:
    - Client component ("use client")
    - Generate 50 star elements with random position, size, duration (matching script.js logic)
    - 5 orbit types: orbit-small, orbit-medium, orbit-large, orbit-reverse-small, orbit-reverse-medium
    - 70% get orbital animation + twinkle, 30% get twinkle-only
    - Each star: absolute position, random width/height (1-3px), random top/left (%), random animation-duration (15-45s), random animation-delay
    - Use CSS animations from globals.css (twinkle, orbit-*)
    - Performance: use CSS transforms only, no JS animation loop, will-change: transform on container
    - Stars rendered inside #stars container, positioned behind hero content

  **Must NOT do**:
  - Do NOT use canvas or WebGL — pure CSS animation with DOM elements
  - Do NOT use framer-motion or any animation library
  - Do NOT reduce star count below 50
  - Do NOT change the animation names or timing

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual animation component requiring precise CSS matching
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 12)
  - **Blocks**: Task 25
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `script.js` lines 1-50 (approximately) — stars creation logic: random position, size, orbit type assignment, probability distribution (70/30)
  - `styles.css` — @keyframes twinkle, orbit-small, orbit-medium, orbit-large, orbit-reverse-small, orbit-reverse-medium definitions
  - `index.html` line ~145 — `<div id="stars">` container placement inside hero section

  **WHY Each Reference Matters**:
  - The JS logic defines exact randomization parameters that must be replicated
  - CSS keyframes must match for visual parity
  - Stars container placement determines z-index layering

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Stars render with correct count and animation
    Tool: Playwright
    Preconditions: Dev server running, hero section visible
    Steps:
      1. Navigate to http://localhost:3000
      2. Count elements inside #stars container — assert exactly 50
      3. Check a sample star element has: position absolute, animation property set
      4. Wait 3 seconds, take screenshot of hero area
    Expected Result: 50 animated star elements visible in hero section
    Failure Indicators: Wrong count, no animation, stars not visible
    Evidence: .sisyphus/evidence/task-11-stars-animation.png

  Scenario: Stars don't cause layout issues
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to homepage
      2. Assert no horizontal scrollbar appears
      3. Assert hero text content is still readable (not obscured by stars)
      4. Check #stars container has pointer-events: none or similar
    Expected Result: Stars are decorative, don't interfere with content or layout
    Failure Indicators: Horizontal scroll, content obscured, stars blocking clicks
    Evidence: .sisyphus/evidence/task-11-stars-layout.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(ui): add StarsAnimation component replicating CSS orbital star effects`
  - Files: `src/components/public/StarsAnimation.tsx`

- [x] 12. Scroll Effects + Interactive Utilities

  **What to do**:
  - Create `src/components/public/ScrollReveal.tsx`:
    - Client component wrapping children
    - Uses IntersectionObserver (threshold 0.15) to add `.active` class
    - Initial state: translateY(30px), opacity 0 → Active: translateY(0), opacity 1
    - Uses existing `.reveal` / `.reveal.active` CSS classes from globals.css
  - Create `src/hooks/useStickyHeader.ts`:
    - Custom hook for header scroll behavior (adds .scrolled at scrollY > 100)
    - Used by Header component (Task 10)
  - Create `src/hooks/useActiveNavSection.ts`:
    - IntersectionObserver on sections, returns current active section ID
    - Used by Header component for nav highlighting
  - Create `src/hooks/useSmoothScroll.ts`:
    - Intercepts hash link clicks, smooth scrolls minus header height offset
  - Create `src/components/public/CardHover.tsx` (optional wrapper):
    - Adds translateY(-8px) hover effect to cards
    - Or just ensure the CSS handles it (may not need a component)
  - Create `src/components/public/Preloader.tsx`:
    - Client component, shows preloader.gif, fades out on window.load
    - Uses existing preloader styles

  **Must NOT do**:
  - Do NOT use framer-motion — pure IntersectionObserver + CSS
  - Do NOT change thresholds or animation values
  - Do NOT add new scroll effects not in the original site

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Interactive behaviors that must match existing site feel
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 11)
  - **Blocks**: Tasks 25, 26, 27, 28, 29
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `script.js` — scroll reveal logic (IntersectionObserver, 0.15 threshold), sticky header (scrollY>100), active nav (IntersectionObserver on sections), smooth scroll, card hover, preloader
  - `styles.css` — .reveal, .reveal.active transition definitions
  - `index.html` — elements with class="reveal" identify which sections use scroll animation

  **WHY Each Reference Matters**:
  - Each JS feature must be replicated as React hooks/components with identical behavior
  - CSS classes already exist — hooks just need to toggle class names

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Scroll reveal animates sections into view
    Tool: Playwright
    Preconditions: Dev server running, page loaded
    Steps:
      1. Navigate to homepage
      2. Scroll to bottom slowly (multiple scrollTo calls with delays)
      3. Check that About section has class "active" after scrolling to it
      4. Assert About section is visible (opacity 1, translateY(0px))
    Expected Result: Sections animate in as user scrolls
    Failure Indicators: No animation, sections always visible, sections never appear
    Evidence: .sisyphus/evidence/task-12-scroll-reveal.png

  Scenario: Preloader hides after page load
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to homepage with network throttle (slow 3G) if possible
      2. Assert preloader element initially visible
      3. Wait for page load event
      4. Assert preloader element hidden (opacity 0 or display none)
    Expected Result: Preloader shows during load, hides after
    Failure Indicators: Preloader never shows, preloader never hides
    Evidence: .sisyphus/evidence/task-12-preloader.txt
  ```

  **Commit**: YES (group with Wave 2)
  - Message: `feat(ui): add scroll reveal, sticky header, smooth scroll, and preloader components`
  - Files: `src/components/public/ScrollReveal.tsx, src/hooks/*.ts, src/components/public/Preloader.tsx`

- [x] 13. Public Content API Routes

  **What to do**:
  - Create `src/app/api/content/[section]/route.ts`:
    - GET handler that accepts section name as dynamic param
    - Valid sections: hero, about, academics, whyUs, hallOfFame, gallery, events, admissions, contact, announcements, footer
    - Connects to MongoDB, fetches content using appropriate model
    - Singleton sections: returns single document
    - Collection sections (gallery, events, announcements): returns array, sorted by date/order
    - Announcements: filter by `isActive: true` for public API
    - Returns JSON with proper Content-Type header
    - Returns 404 for invalid section names
    - Cache-Control headers: `s-maxage=60, stale-while-revalidate=300` (1min fresh, 5min stale)
  - These are PUBLIC endpoints — no auth required

  **Must NOT do**:
  - Do NOT add pagination for MVP (gallery/events lists are small)
  - Do NOT add filtering/search params
  - Do NOT add API versioning (/api/v1/)
  - Do NOT add rate limiting

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Dynamic route with multiple section handlers, DB queries, error handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 17, 18, 19)
  - **Blocks**: Tasks 25, 26, 27, 28, 29, 32
  - **Blocked By**: Task 8

  **References**:

  **Pattern References**:
  - `src/lib/models/index.ts` (from Task 8) — model imports and which are singleton vs collection
  - `src/types/content.ts` (from Task 4) — response shapes

  **External References**:
  - Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

  **WHY Each Reference Matters**:
  - Models determine query pattern (findOne for singleton, find for collection)
  - Types define the JSON response shape

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Fetch hero content returns valid JSON
    Tool: Bash (curl)
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. curl http://localhost:3000/api/content/hero
      2. Assert HTTP 200
      3. Assert Content-Type: application/json
      4. Assert response has "title" field with "en" and "hi" subfields
    Expected Result: Valid JSON with bilingual hero content
    Failure Indicators: 404, 500, empty response, missing fields
    Evidence: .sisyphus/evidence/task-13-hero-api.txt

  Scenario: Invalid section returns 404
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl http://localhost:3000/api/content/nonexistent
      2. Assert HTTP 404
      3. Assert response contains error message
    Expected Result: 404 with descriptive error
    Failure Indicators: 200 with empty data, 500
    Evidence: .sisyphus/evidence/task-13-invalid-section.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(api): add public content API routes for all CMS sections`
  - Files: `src/app/api/content/[section]/route.ts`

- [x] 14. Admin CRUD API Routes

  **What to do**:
  - Create `src/app/api/admin/sections/[section]/route.ts`:
    - GET: Fetch current content for admin editing (same as public but no cache)
    - PUT: Update content for singleton sections (hero, about, academics, whyUs, hallOfFame, admissions, contact, footer)
    - POST: Add new item to collection sections (gallery, events, announcements)
    - DELETE: Remove item from collection sections (by ID in request body or query param)
  - All routes protected by auth middleware (JWT verification)
  - Validate request body shape matches expected type
  - Return updated/created document in response
  - Handle Mongoose validation errors with 400 status
  - Create `src/app/api/admin/sections/[section]/[id]/route.ts` for collection item operations:
    - PUT: Update specific gallery/event/announcement item
    - DELETE: Delete specific item

  **Must NOT do**:
  - Do NOT add bulk operations
  - Do NOT add content versioning or undo
  - Do NOT add draft/publish workflow — saves go live immediately
  - Do NOT add webhooks or notifications on save

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple HTTP methods, auth protection, both singleton and collection patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 15, 16, 17, 18, 19)
  - **Blocks**: Tasks 20, 21, 22, 23
  - **Blocked By**: Tasks 7, 8

  **References**:

  **Pattern References**:
  - `src/lib/auth.ts` (from Task 7) — verifyToken function for protecting routes
  - `src/lib/models/index.ts` (from Task 8) — model imports
  - `src/types/content.ts` (from Task 4) — request body validation shapes

  **WHY Each Reference Matters**:
  - Auth verification must be called at the start of each handler
  - Models define query patterns (upsert for singleton, create/delete for collection)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Update hero section with valid token
    Tool: Bash (curl)
    Preconditions: Dev server running, admin logged in (cookie from Task 7)
    Steps:
      1. Login to get cookie: curl -X POST .../api/auth/login -d '...' -c cookies.txt
      2. curl -X PUT http://localhost:3000/api/admin/sections/hero -H "Content-Type: application/json" -b cookies.txt -d '{"title":{"en":"New Title","hi":"नया शीर्षक"}}'
      3. Assert HTTP 200
      4. Assert response contains updated title
      5. Verify via public API: curl .../api/content/hero — assert new title
    Expected Result: Content updated, visible via public API
    Failure Indicators: 401, 500, content not updated
    Evidence: .sisyphus/evidence/task-14-update-hero.txt

  Scenario: Unauthenticated request returns 401
    Tool: Bash (curl)
    Preconditions: Dev server running, no cookies
    Steps:
      1. curl -X PUT http://localhost:3000/api/admin/sections/hero -H "Content-Type: application/json" -d '{"title":{"en":"Hack","hi":"हैक"}}'
      2. Assert HTTP 401
    Expected Result: 401 Unauthorized
    Failure Indicators: 200 (no auth check), 500
    Evidence: .sisyphus/evidence/task-14-unauth.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(api): add protected admin CRUD API routes for all sections`
  - Files: `src/app/api/admin/sections/[section]/route.ts, src/app/api/admin/sections/[section]/[id]/route.ts`

- [x] 15. Image Upload API + Storage

  **What to do**:
  - Create `src/app/api/admin/upload/route.ts`:
    - POST: Accept multipart/form-data with image file
    - Validate file type (jpg, jpeg, png, webp, gif) and size (max 5MB)
    - Save to `public/images/uploads/` directory with unique filename (timestamp + original name)
    - Return the public URL path: `/images/uploads/{filename}`
    - Protected by auth middleware
  - Create `src/app/api/admin/upload/[filename]/route.ts`:
    - DELETE: Remove uploaded image file from filesystem
    - Protected by auth middleware
  - Ensure `public/images/uploads/` directory exists (create on first upload)
  - Add `public/images/uploads/` to .gitignore (user-uploaded content shouldn't be in git)

  **Must NOT do**:
  - Do NOT use cloud storage (S3, Cloudinary) — local filesystem on server
  - Do NOT add image compression or resizing
  - Do NOT add image cropping
  - Do NOT create thumbnails

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: File upload handling, multipart parsing, filesystem operations
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 16, 17, 18, 19)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 7, 8

  **References**:

  **Pattern References**:
  - `src/lib/auth.ts` (from Task 7) — auth verification
  - `public/images/` (from Task 5) — existing image directory structure

  **External References**:
  - Next.js file upload handling: Route Handlers can parse FormData natively

  **WHY Each Reference Matters**:
  - Upload path must be under public/ for Next.js static serving
  - Auth is required for all admin endpoints

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Upload image successfully
    Tool: Bash (curl)
    Preconditions: Dev server running, admin logged in
    Steps:
      1. Login to get cookie
      2. curl -X POST http://localhost:3000/api/admin/upload -b cookies.txt -F "file=@public/images/logo.png"
      3. Assert HTTP 200
      4. Assert response contains "url" field with /images/uploads/ path
      5. curl the returned URL — assert HTTP 200 (file accessible)
    Expected Result: Image uploaded and accessible via returned URL
    Failure Indicators: 500, file not saved, URL not accessible
    Evidence: .sisyphus/evidence/task-15-upload-success.txt

  Scenario: Reject oversized file
    Tool: Bash (curl)
    Preconditions: Dev server running, admin logged in
    Steps:
      1. Create a dummy file > 5MB
      2. Attempt upload
      3. Assert HTTP 400 with clear error about file size
    Expected Result: 400 with "file too large" error
    Failure Indicators: 200 (accepts oversized), 500
    Evidence: .sisyphus/evidence/task-15-oversized.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(api): add image upload and deletion API with local storage`
  - Files: `src/app/api/admin/upload/route.ts, src/app/api/admin/upload/[filename]/route.ts`

- [x] 16. Seed Script

  **What to do**:
  - Create `src/scripts/seed.ts`:
    - Connect to MongoDB
    - Create admin user (from ADMIN_EMAIL/ADMIN_PASSWORD env vars, hash password with bcryptjs)
    - Populate ALL 11 CMS sections with ACTUAL content from current index.html:
      - Hero: exact title, subtitles, CTA buttons from current site
      - About: exact paragraphs, principal's message from current site
      - Academics: exact 5 levels, subjects, languages from current site
      - Why Us: exact 8 feature cards from current site
      - Hall of Fame: exact topper cards and achievements from current site
      - Gallery: exact 9 gallery items with categories from current site
      - Events: exact 3 events from current site
      - Admissions: exact 4 steps, 7 documents, inquiry info from current site
      - Contact: exact address, phone, email, hours from current site
      - Announcements: 1-2 sample announcements
      - Footer: exact about text, quick links, academic links from current site
    - All bilingual content must have BOTH en and hi text from translations.js
    - Upsert pattern — safe to run multiple times without duplicating
  - Add npm script: `"seed": "tsx src/scripts/seed.ts"` in package.json
  - Create `src/scripts/seed-data.ts` with all the content as typed constants

  **Must NOT do**:
  - Do NOT use placeholder/lorem ipsum content — use REAL content from the site
  - Do NOT skip any section
  - Do NOT skip Hindi translations

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Must extract exact content from HTML and translations.js for all 11 sections
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 15, 17, 18, 19)
  - **Blocks**: None (but enables QA of all subsequent tasks)
  - **Blocked By**: Tasks 8, 9

  **References**:

  **Pattern References**:
  - `index.html` (ALL 958 lines) — every piece of content must be extracted into seed data
  - `translations.js` (ALL 309 lines) — every Hindi translation must be included in seed data
  - `src/lib/models/index.ts` (from Task 8) — models to populate
  - `src/lib/auth.ts` (from Task 7) — hashPassword for admin user creation

  **WHY Each Reference Matters**:
  - index.html is THE source for all English content
  - translations.js is THE source for all Hindi content
  - Models define the exact shape the seed data must conform to

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Seed script populates all sections
    Tool: Bash
    Preconditions: MongoDB running, models created
    Steps:
      1. Run `npm run seed`
      2. Assert script exits with code 0
      3. Query MongoDB: count documents in each collection
      4. Assert: hero=1, about=1, academics=1, whyUs=1, hallOfFame=1, gallery>=9, events>=3, admissions=1, contact=1, announcements>=1, footer=1, adminUsers>=1
    Expected Result: All 11 sections + admin user populated
    Failure Indicators: Script errors, missing collections, empty collections
    Evidence: .sisyphus/evidence/task-16-seed-complete.txt

  Scenario: Seed script is idempotent
    Tool: Bash
    Preconditions: Seed already run once
    Steps:
      1. Run `npm run seed` again
      2. Assert script exits with code 0
      3. Assert document counts haven't doubled (no duplicates)
    Expected Result: No duplicate documents created
    Failure Indicators: Duplicate admin users, duplicate gallery items
    Evidence: .sisyphus/evidence/task-16-seed-idempotent.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(seed): add seed script with actual site content for all CMS sections`
  - Files: `src/scripts/seed.ts, src/scripts/seed-data.ts, package.json`

- [x] 17. Admin Layout + Dashboard Page

  **What to do**:
  - Create `src/app/(admin)/admin/layout.tsx`:
    - Server component that checks auth (redirect to login if not authenticated)
    - Sidebar navigation with links to all CMS sections + Gallery + Contact Submissions
    - Top bar with admin user info and logout button
    - Main content area for child pages
    - Clean, functional design — doesn't need to match public site styling
    - Use a simple admin color scheme: white background, gray sidebar, blue accents
  - Create `src/app/(admin)/admin/page.tsx`:
    - Dashboard with overview cards: total gallery items, total events, total announcements, latest contact submissions count
    - Quick links to most-used admin sections
    - Welcome message
  - Create `src/components/admin/AdminSidebar.tsx`:
    - Links: Dashboard, Hero, About, Academics, Why Us, Hall of Fame, Gallery, Events, Admissions, Contact Info, Announcements, Footer, Contact Submissions
    - Active link highlighting
    - Collapsible on mobile
  - Admin pages use their OWN CSS (not the public site's globals.css for layout) — create `src/app/(admin)/admin/admin.css`

  **Must NOT do**:
  - Do NOT use a component library (shadcn, MUI, Ant Design)
  - Do NOT over-design the admin — functional and clean is sufficient
  - Do NOT add a notification system
  - Do NOT add activity logs or audit trail

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI layout with sidebar, responsive behavior, admin-specific styling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 15, 16, 18, 19)
  - **Blocks**: Tasks 20, 21, 22, 23, 24
  - **Blocked By**: Tasks 7, 10

  **References**:

  **Pattern References**:
  - `src/lib/auth.ts` (from Task 7) — verifyToken for auth check
  - `src/components/shared/Header.tsx` (from Task 10) — reference for component structure patterns

  **WHY Each Reference Matters**:
  - Auth check in layout ensures ALL admin pages are protected
  - Header component shows the component pattern style used in this project

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Admin dashboard accessible after login
    Tool: Playwright
    Preconditions: Dev server running, admin seeded
    Steps:
      1. Navigate to /admin/login
      2. Fill email input with "admin@pvp.in"
      3. Fill password input with "admin123"
      4. Click login button
      5. Assert redirected to /admin
      6. Assert sidebar visible with 13 navigation links
      7. Assert dashboard shows overview cards
      8. Screenshot
    Expected Result: Dashboard renders with sidebar and overview
    Failure Indicators: Login fails, redirect doesn't work, sidebar missing
    Evidence: .sisyphus/evidence/task-17-admin-dashboard.png

  Scenario: Sidebar navigation works
    Tool: Playwright
    Preconditions: Logged into admin
    Steps:
      1. Click "Gallery" in sidebar
      2. Assert URL changes to /admin/gallery or /admin/sections/gallery
      3. Click "Hero" in sidebar
      4. Assert URL changes to /admin/sections/hero
    Expected Result: Sidebar links navigate to correct admin pages
    Failure Indicators: Links don't work, wrong URLs
    Evidence: .sisyphus/evidence/task-17-sidebar-nav.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(admin): add admin layout with sidebar, dashboard, and admin-specific styling`
  - Files: `src/app/(admin)/admin/layout.tsx, src/app/(admin)/admin/page.tsx, src/components/admin/AdminSidebar.tsx, src/app/(admin)/admin/admin.css`

- [x] 18. Admin Auth Pages (Login)

  **What to do**:
  - Create `src/app/(admin)/admin/login/page.tsx`:
    - Login form: email input, password input, submit button
    - Client component for form handling
    - On submit: POST to /api/auth/login, handle success (redirect to /admin) and error (show message)
    - Clean, centered design with school logo
    - Error message display for invalid credentials
    - Loading state on submit button
  - This page should NOT use the admin layout (no sidebar) — it's a standalone page
  - Create `src/app/(admin)/admin/login/layout.tsx` — minimal layout without sidebar

  **Must NOT do**:
  - Do NOT add "forgot password" functionality
  - Do NOT add "remember me" checkbox
  - Do NOT add registration/signup

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with validation, loading states, error handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 15, 16, 17, 19)
  - **Blocks**: None
  - **Blocked By**: Task 7

  **References**:

  **Pattern References**:
  - `src/app/api/auth/login/route.ts` (from Task 7) — API endpoint to call
  - `public/images/logo.png` (from Task 5) — school logo for login page

  **WHY Each Reference Matters**:
  - Login page must call the correct API endpoint with expected payload shape
  - Logo adds branding to the login page

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Successful login redirects to dashboard
    Tool: Playwright
    Preconditions: Dev server running, admin user seeded
    Steps:
      1. Navigate to /admin/login
      2. Fill email: "admin@pvp.in"
      3. Fill password: "admin123"
      4. Click submit
      5. Wait for navigation
      6. Assert URL is /admin (dashboard)
      7. Assert sidebar is visible
    Expected Result: Successful login → redirect to dashboard
    Failure Indicators: Stays on login, error message, wrong redirect
    Evidence: .sisyphus/evidence/task-18-login-success.png

  Scenario: Invalid credentials show error
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /admin/login
      2. Fill email: "wrong@test.com"
      3. Fill password: "wrong"
      4. Click submit
      5. Assert error message appears on page
      6. Assert still on /admin/login
    Expected Result: Error message displayed, stays on login page
    Failure Indicators: No error shown, redirected anyway, page crashes
    Evidence: .sisyphus/evidence/task-18-login-fail.png
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(admin): add login page with form validation and error handling`
  - Files: `src/app/(admin)/admin/login/page.tsx, src/app/(admin)/admin/login/layout.tsx`

- [x] 19. Contact Form Submission API

  **What to do**:
  - Create `src/app/api/contact/route.ts`:
    - POST: Accept contact form submission (name, email, phone, subject, message)
    - Validate required fields (name, email, message)
    - Validate email format
    - Save to MongoDB using ContactSubmission model
    - Return 201 on success, 400 on validation error
    - Public endpoint — no auth required
  - Create `src/app/api/admin/contact-submissions/route.ts`:
    - GET: List all submissions, sorted by newest first
    - Protected by auth
  - Create `src/app/api/admin/contact-submissions/[id]/route.ts`:
    - PUT: Mark as read/unread
    - DELETE: Delete submission
    - Protected by auth

  **Must NOT do**:
  - Do NOT send email notifications
  - Do NOT add rate limiting (future feature)
  - Do NOT add CAPTCHA

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard CRUD API, simple validation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 15, 16, 17, 18)
  - **Blocks**: Tasks 24, 29
  - **Blocked By**: Task 8

  **References**:

  **Pattern References**:
  - `src/lib/models/contactSubmission.ts` (from Task 8) — model to use
  - `src/types/contact.ts` (from Task 4) — ContactSubmission type
  - `index.html` lines 776-850 — contact form fields (name, email, phone, subject dropdown, message)
  - `script.js` — contact form validation logic (required fields, email regex)

  **WHY Each Reference Matters**:
  - HTML form defines exact fields to accept
  - JS validation logic shows current validation rules to replicate server-side

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Submit valid contact form
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","subject":"General Inquiry","message":"Test message"}'
      2. Assert HTTP 201
      3. Query admin endpoint to verify submission saved
    Expected Result: Submission created, retrievable via admin API
    Failure Indicators: 400, 500, submission not saved
    Evidence: .sisyphus/evidence/task-19-contact-submit.txt

  Scenario: Reject invalid email
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"not-an-email","message":"Test"}'
      2. Assert HTTP 400
      3. Assert error mentions email validation
    Expected Result: 400 with email validation error
    Failure Indicators: 201 (accepts invalid email), 500
    Evidence: .sisyphus/evidence/task-19-invalid-email.txt
  ```

  **Commit**: YES (group with Wave 3)
  - Message: `feat(api): add contact form submission and admin management API`
  - Files: `src/app/api/contact/route.ts, src/app/api/admin/contact-submissions/*/route.ts`

- [x] 20. Admin CMS Editors — Hero + About + Contact Info

  **What to do**:
  - Create `src/app/(admin)/admin/sections/hero/page.tsx`:
    - Client component form for editing Hero content
    - Fields: title (en/hi), subtitle1 (en/hi), subtitle2 (en/hi), CTA buttons (text en/hi + link), background image (with upload)
    - On load: GET /api/admin/sections/hero → populate form
    - On save: PUT /api/admin/sections/hero → show success/error toast
    - Each bilingual field shows two inputs side by side: EN | HI
  - Create `src/app/(admin)/admin/sections/about/page.tsx`:
    - Fields: campus image (upload), paragraphs array (add/remove, each en/hi), UP Board link, principal message (name en/hi, image upload, message en/hi)
  - Create `src/app/(admin)/admin/sections/contact/page.tsx`:
    - Fields: address (en/hi), phone, email, hours (en/hi), campus tour image (upload)
  - Create `src/components/admin/BilingualInput.tsx`:
    - Reusable component: label, EN input, HI input side by side
    - Used across all section editors
  - Create `src/components/admin/ImageUpload.tsx`:
    - Reusable component: current image preview, upload button, calls /api/admin/upload
    - Shows loading state during upload
    - Returns uploaded image URL to parent form
  - Create `src/components/admin/SaveButton.tsx`:
    - Reusable save button with loading state and success/error feedback

  **Must NOT do**:
  - Do NOT use rich text editor — plain text inputs and textareas
  - Do NOT add preview/draft functionality
  - Do NOT add content validation beyond required fields

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form-heavy UI with reusable components, image upload UX
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 23, 24, 25-30)
  - **Blocks**: None
  - **Blocked By**: Tasks 14, 17

  **References**:

  **Pattern References**:
  - `src/types/content.ts` (from Task 4) — HeroContent, AboutContent, ContactContent field shapes
  - `src/app/api/admin/sections/[section]/route.ts` (from Task 14) — API to call
  - `src/app/api/admin/upload/route.ts` (from Task 15) — image upload API
  - `index.html` lines 142-158 (Hero), 162-227 (About), 776-892 (Contact) — content structure reference

  **WHY Each Reference Matters**:
  - Types define exact form fields needed
  - API routes define request/response shapes
  - HTML shows what content the forms are editing

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Edit hero title and verify on public site
    Tool: Playwright
    Preconditions: Admin logged in, seed data loaded
    Steps:
      1. Navigate to /admin/sections/hero
      2. Assert form populated with current hero content
      3. Change EN title to "Updated School Name"
      4. Click Save button
      5. Assert success message appears
      6. Navigate to public homepage (/)
      7. Assert hero title shows "Updated School Name"
    Expected Result: Content edited in admin → visible on public site
    Failure Indicators: Save fails, public site not updated, form empty
    Evidence: .sisyphus/evidence/task-20-hero-edit.png

  Scenario: BilingualInput shows EN and HI side by side
    Tool: Playwright
    Preconditions: Admin on hero edit page
    Steps:
      1. Assert each bilingual field has two visible inputs
      2. Assert inputs labeled "EN" and "HI" (or similar)
      3. Assert both fields editable
    Expected Result: Bilingual inputs render correctly
    Failure Indicators: Only one input, labels missing
    Evidence: .sisyphus/evidence/task-20-bilingual-input.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(admin): add CMS editors for Hero, About, and Contact sections`
  - Files: `src/app/(admin)/admin/sections/hero/page.tsx, src/app/(admin)/admin/sections/about/page.tsx, src/app/(admin)/admin/sections/contact/page.tsx, src/components/admin/BilingualInput.tsx, src/components/admin/ImageUpload.tsx, src/components/admin/SaveButton.tsx`

- [x] 21. Admin CMS Editors — Academics + Why Us + Hall of Fame

  **What to do**:
  - Create `src/app/(admin)/admin/sections/academics/page.tsx`:
    - Edit 5 academic levels: each has name (en/hi), icon (Font Awesome class), grades (en/hi), description (en/hi)
    - Add/remove levels
    - Edit Core Subjects list: name (en/hi) + icon per subject
    - Edit Language Options: name (en/hi) per language
  - Create `src/app/(admin)/admin/sections/why-us/page.tsx`:
    - Edit 8 feature cards: each has title (en/hi), description (en/hi), icon (Font Awesome class)
    - Add/remove feature cards
  - Create `src/app/(admin)/admin/sections/hall-of-fame/page.tsx`:
    - Topper cards: name, class, year, image (upload), score
    - Achievement cards: title (en/hi), description (en/hi), icon
    - Add/remove both toppers and achievements
  - Create `src/components/admin/ArrayEditor.tsx`:
    - Reusable component for managing arrays of items (add/remove/reorder)
    - Each item renders a customizable form card
    - Used across academics, why-us, hall-of-fame editors

  **Must NOT do**:
  - Do NOT add drag-and-drop reordering (add/remove is sufficient)
  - Do NOT add icon picker — admin types Font Awesome class name directly

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex array-based forms, reusable editor patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 22, 23, 24, 25-30)
  - **Blocks**: None
  - **Blocked By**: Tasks 14, 17

  **References**:

  **Pattern References**:
  - `src/types/content.ts` — AcademicsContent, WhyUsContent, HallOfFameContent
  - `index.html` lines 231-370 (Academics), 374-440 (Why Us), 445-524 (Hall of Fame)
  - `src/components/admin/BilingualInput.tsx` (from Task 20) — reuse for bilingual fields
  - `src/components/admin/ImageUpload.tsx` (from Task 20) — reuse for topper images

  **WHY Each Reference Matters**:
  - Content types define form structure
  - HTML shows the array items that need editing (5 levels, 8 features, etc.)
  - Reusable components keep admin UI consistent

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Add new academic level
    Tool: Playwright
    Preconditions: Admin logged in, academics section loaded
    Steps:
      1. Navigate to /admin/sections/academics
      2. Count existing level cards
      3. Click "Add Level" button
      4. Fill in new level details (name, grades, etc.)
      5. Click Save
      6. Assert success message
      7. Refresh page — assert new level appears
    Expected Result: New academic level added and persisted
    Failure Indicators: Add button missing, save fails, new level not persisted
    Evidence: .sisyphus/evidence/task-21-add-level.png

  Scenario: Remove a Why Us feature card
    Tool: Playwright
    Preconditions: Admin logged in, why-us section loaded
    Steps:
      1. Navigate to /admin/sections/why-us
      2. Count feature cards — assert 8
      3. Click remove/delete button on last card
      4. Click Save
      5. Refresh page — assert 7 cards
    Expected Result: Feature card removed and change persisted
    Failure Indicators: Remove button missing, card not removed after save
    Evidence: .sisyphus/evidence/task-21-remove-feature.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(admin): add CMS editors for Academics, Why Us, and Hall of Fame sections`
  - Files: `src/app/(admin)/admin/sections/academics/page.tsx, src/app/(admin)/admin/sections/why-us/page.tsx, src/app/(admin)/admin/sections/hall-of-fame/page.tsx, src/components/admin/ArrayEditor.tsx`

- [x] 22. Admin CMS Editors — Gallery + Events

  **What to do**:
  - Create `src/app/(admin)/admin/sections/gallery/page.tsx`:
    - Grid view of all gallery items with thumbnail preview
    - Add new gallery item: image upload, caption (en/hi), category dropdown (campus/events/sports/activities)
    - Edit existing: change caption, category
    - Delete gallery item (with confirmation)
    - Each item shows: thumbnail, caption, category badge
  - Create `src/app/(admin)/admin/sections/events/page.tsx`:
    - List view of events, sorted by date
    - Add new event: title (en/hi), description (en/hi), date picker, image upload
    - Edit/delete existing events
    - Each item shows: title, date, thumbnail

  **Must NOT do**:
  - Do NOT add gallery image cropping or resizing
  - Do NOT add event categories/tags
  - Do NOT add event registration or RSVP features
  - Do NOT add image drag-and-drop reordering

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Image-heavy UI, grid layout, file uploads, collection CRUD
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 23, 24, 25-30)
  - **Blocks**: None
  - **Blocked By**: Tasks 14, 15, 17

  **References**:

  **Pattern References**:
  - `src/types/content.ts` — GalleryContent, EventsContent
  - `src/app/api/admin/upload/route.ts` (from Task 15) — image upload
  - `src/app/api/admin/sections/[section]/route.ts` (from Task 14) — CRUD for collection items
  - `src/components/admin/ImageUpload.tsx` (from Task 20) — reuse for image fields
  - `index.html` lines 528-601 (Gallery), 605-647 (Events) — content structure

  **WHY Each Reference Matters**:
  - Gallery and events are COLLECTION types (multiple documents) unlike singleton sections
  - Image upload is required for both gallery items and event cards

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Upload new gallery image
    Tool: Playwright
    Preconditions: Admin logged in
    Steps:
      1. Navigate to /admin/sections/gallery
      2. Click "Add Gallery Item"
      3. Upload an image file
      4. Fill caption EN: "New Campus Photo", HI: "नई परिसर तस्वीर"
      5. Select category: "campus"
      6. Click Save
      7. Assert new item appears in gallery grid
    Expected Result: Gallery item created with image and metadata
    Failure Indicators: Upload fails, item not visible, missing thumbnail
    Evidence: .sisyphus/evidence/task-22-gallery-upload.png

  Scenario: Delete gallery item with confirmation
    Tool: Playwright
    Preconditions: Gallery items exist
    Steps:
      1. Navigate to /admin/sections/gallery
      2. Count items
      3. Click delete on first item
      4. Assert confirmation dialog appears
      5. Confirm deletion
      6. Assert item count decreased by 1
    Expected Result: Item deleted after confirmation
    Failure Indicators: No confirmation, item not deleted, page error
    Evidence: .sisyphus/evidence/task-22-gallery-delete.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(admin): add CMS editors for Gallery and Events with image upload`
  - Files: `src/app/(admin)/admin/sections/gallery/page.tsx, src/app/(admin)/admin/sections/events/page.tsx`

- [x] 23. Admin CMS Editors — Admissions + Announcements + Footer

  **What to do**:
  - Create `src/app/(admin)/admin/sections/admissions/page.tsx`:
    - Admission process steps: array of {number, title en/hi, description en/hi} — add/remove/edit
    - Required documents: array of {text en/hi} — add/remove
    - Inquiry info: phone, email, text (en/hi)
  - Create `src/app/(admin)/admin/sections/announcements/page.tsx`:
    - List of announcements, sorted by date
    - Add new: title (en/hi), content (en/hi), date, isActive toggle
    - Edit/delete existing
    - Active toggle per announcement (show/hide on public site)
  - Create `src/app/(admin)/admin/sections/footer/page.tsx`:
    - About text (en/hi)
    - Quick links: array of {text en/hi, href} — add/remove
    - Academic links: array of {text en/hi, href} — add/remove
  - Reuse BilingualInput, ArrayEditor, SaveButton from Tasks 20-21

  **Must NOT do**:
  - Do NOT add announcement attachments/file uploads
  - Do NOT add announcement expiry dates
  - Do NOT add footer social media links (not in current site)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multiple form-based editors with array management
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 22, 24, 25-30)
  - **Blocks**: None
  - **Blocked By**: Tasks 14, 17

  **References**:

  **Pattern References**:
  - `src/types/content.ts` — AdmissionsContent, AnnouncementsContent, FooterContent
  - `index.html` lines 651-772 (Admissions), 896-943 (Footer)
  - `src/components/admin/ArrayEditor.tsx` (from Task 21) — reuse for list management
  - `src/components/admin/BilingualInput.tsx` (from Task 20) — reuse for bilingual fields

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Toggle announcement active/inactive
    Tool: Playwright
    Preconditions: Admin logged in, announcements exist
    Steps:
      1. Navigate to /admin/sections/announcements
      2. Find an active announcement
      3. Toggle its isActive switch to OFF
      4. Click Save
      5. Check public API: GET /api/content/announcements
      6. Assert the deactivated announcement is NOT in the public response
    Expected Result: Inactive announcements hidden from public API
    Failure Indicators: Toggle missing, still shows in public API
    Evidence: .sisyphus/evidence/task-23-announcement-toggle.txt

  Scenario: Edit footer quick links
    Tool: Playwright
    Preconditions: Admin logged in
    Steps:
      1. Navigate to /admin/sections/footer
      2. Assert existing quick links loaded
      3. Add a new quick link: text EN "New Link", HI "नया लिंक", href "/new"
      4. Save
      5. Refresh and verify new link persisted
    Expected Result: Footer links editable and persisted
    Failure Indicators: Links not loaded, save fails
    Evidence: .sisyphus/evidence/task-23-footer-links.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(admin): add CMS editors for Admissions, Announcements, and Footer`
  - Files: `src/app/(admin)/admin/sections/admissions/page.tsx, src/app/(admin)/admin/sections/announcements/page.tsx, src/app/(admin)/admin/sections/footer/page.tsx`

- [x] 24. Admin Contact Submissions Viewer

  **What to do**:
  - Create `src/app/(admin)/admin/contact-submissions/page.tsx`:
    - Table/list view of all contact form submissions
    - Columns: Name, Email, Subject, Date, Status (read/unread)
    - Click to expand/view full message
    - Mark as read/unread toggle
    - Delete submission
    - Sort by newest first
    - Unread count badge in sidebar (AdminSidebar from Task 17)
  - Simple, functional design — table with basic styling

  **Must NOT do**:
  - Do NOT add reply functionality
  - Do NOT add email sending
  - Do NOT add export to CSV
  - Do NOT add pagination (simple list is fine for school-level volume)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Table UI with interactive read/unread states
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 22, 23, 25-30)
  - **Blocks**: None
  - **Blocked By**: Tasks 17, 19

  **References**:

  **Pattern References**:
  - `src/app/api/admin/contact-submissions/route.ts` (from Task 19) — list API
  - `src/types/contact.ts` (from Task 4) — ContactSubmission type
  - `src/components/admin/AdminSidebar.tsx` (from Task 17) — add unread badge here

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: View and manage contact submissions
    Tool: Playwright
    Preconditions: Admin logged in, contact submissions exist in DB
    Steps:
      1. Navigate to /admin/contact-submissions
      2. Assert submissions listed in table format
      3. Click on a submission row
      4. Assert full message content displayed
      5. Click "Mark as Read"
      6. Assert status changes to read
      7. Screenshot
    Expected Result: Submissions viewable with read/unread management
    Failure Indicators: Empty table despite data, expand not working
    Evidence: .sisyphus/evidence/task-24-submissions.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(admin): add contact submissions viewer with read/unread management`
  - Files: `src/app/(admin)/admin/contact-submissions/page.tsx`

- [x] 25. Public Page — Hero + About Sections

  **What to do**:
  - Create `src/components/public/HeroSection.tsx`:
    - Server component: fetch Hero content from DB (direct Mongoose query, NOT API call)
    - Render: background image, StarsAnimation component, title, subtitle1, subtitle2, CTA buttons
    - Use next-intl for translated content (use locale from params)
    - Apply existing CSS classes: #home, hero classes from styles.css
    - Background image from CMS data
  - Create `src/components/public/AboutSection.tsx`:
    - Server component: fetch About content from DB
    - Render: campus image, vision/mission paragraphs, UP Board link, principal's message card
    - Principal's photo + name + message
    - Apply existing CSS classes: #about section classes
  - Compose both in `src/app/(public)/[locale]/page.tsx` (the homepage)
  - All text content comes from MongoDB via server-side fetch
  - Use `next/image` for optimized images with proper width/height/alt

  **Must NOT do**:
  - Do NOT fetch content via API calls in server components — use direct DB queries for SSR performance
  - Do NOT use client-side fetching for main content
  - Do NOT change the visual layout from current site

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual sections that must pixel-match current design, SSR data fetching
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-24, 26-30)
  - **Blocks**: Task 31
  - **Blocked By**: Tasks 10, 11, 12, 13

  **References**:

  **Pattern References**:
  - `index.html` lines 142-227 — Hero and About HTML structure, class names, content layout
  - `styles.css` — hero section styles, about section styles, .reveal classes
  - `src/lib/models/hero.ts` (from Task 8) — Mongoose model for direct query
  - `src/lib/models/about.ts` (from Task 8) — Mongoose model for direct query
  - `src/components/public/StarsAnimation.tsx` (from Task 11) — embed in hero
  - `src/components/public/ScrollReveal.tsx` (from Task 12) — wrap sections

  **WHY Each Reference Matters**:
  - HTML defines exact layout to replicate
  - Models are used for direct SSR queries (NOT API calls)
  - Stars and ScrollReveal components provide interactivity

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Hero section renders with CMS content via SSR
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert hero title text matches seed data
      3. Assert hero has background image
      4. Assert CTA buttons visible
      5. View page source — assert hero title present in raw HTML (proves SSR)
      6. Screenshot at 1280px width
    Expected Result: Hero renders with DB content, visible in page source
    Failure Indicators: Empty hero, missing text, content not in page source
    Evidence: .sisyphus/evidence/task-25-hero-ssr.png

  Scenario: About section with principal's message
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Scroll to About section
      2. Assert campus image visible
      3. Assert vision/mission paragraphs present
      4. Assert principal's message card with photo and name
      5. Screenshot
    Expected Result: About section renders all content from CMS
    Failure Indicators: Missing image, missing paragraphs, missing principal card
    Evidence: .sisyphus/evidence/task-25-about-section.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(public): add SSR Hero and About sections with CMS content`
  - Files: `src/components/public/HeroSection.tsx, src/components/public/AboutSection.tsx, src/app/(public)/[locale]/page.tsx`

- [x] 26. Public Page — Academics + Why Us Sections

  **What to do**:
  - Create `src/components/public/AcademicsSection.tsx`:
    - Server component: fetch Academics content from DB
    - 5 academic level cards with Font Awesome icons, name, grades, description
    - Core Subjects grid (Math, Science, Social Studies, Computer Science, PE)
    - Language Options display (Hindi, English, Sanskrit, Urdu)
    - Apply existing CSS classes: #academics, level cards, grid-3/grid-4
  - Create `src/components/public/WhyUsSection.tsx`:
    - Server component: fetch Why Us content from DB
    - 8 feature cards in grid layout
    - Each card: Font Awesome icon, title, description
    - Apply existing CSS classes: #why-us, feature-card
  - Add both to homepage page.tsx composition
  - Use ScrollReveal wrapper for animation

  **Must NOT do**:
  - Do NOT change grid layouts or card designs
  - Do NOT add tabbed navigation for academic levels

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Grid-heavy layouts, card components, icon rendering
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-25, 27-30)
  - **Blocks**: Task 31
  - **Blocked By**: Tasks 10, 12, 13

  **References**:

  **Pattern References**:
  - `index.html` lines 231-440 — Academics and Why Us HTML structure
  - `styles.css` — academic level cards, feature-card, grid-3, grid-4 classes
  - `src/lib/models/academics.ts`, `src/lib/models/whyUs.ts` (from Task 8)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Academics section shows all 5 levels
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Scroll to Academics section
      2. Count academic level cards — assert 5
      3. Assert each card has icon, name, description
      4. Assert Core Subjects grid visible
      5. Assert Language Options visible
      6. Screenshot
    Expected Result: 5 level cards, subjects grid, language options all rendered
    Failure Indicators: Missing cards, wrong count, missing subjects
    Evidence: .sisyphus/evidence/task-26-academics.png

  Scenario: Why Us shows 8 feature cards in grid
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Scroll to Why Us section
      2. Count feature cards — assert 8
      3. Assert each card has icon, title, description
      4. Check grid layout (cards wrap responsively)
      5. Screenshot at 1280px and 375px widths
    Expected Result: 8 feature cards in responsive grid
    Failure Indicators: Wrong count, broken grid, missing content
    Evidence: .sisyphus/evidence/task-26-why-us.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(public): add SSR Academics and Why Us sections`
  - Files: `src/components/public/AcademicsSection.tsx, src/components/public/WhyUsSection.tsx`

- [x] 27. Public Page — Hall of Fame + Gallery Sections

  **What to do**:
  - Create `src/components/public/HallOfFameSection.tsx`:
    - Server component: fetch Hall of Fame content from DB
    - Topper cards: student name, class, year, photo, score — using .topper-card class
    - Achievement cards: title, description, icon — using .achievement-card class
    - Apply existing CSS classes: #hall-of-fame
  - Create `src/components/public/GallerySection.tsx`:
    - Server component: fetch Gallery items from DB
    - Grid layout using .gallery-grid class
    - Each item: image with lazy loading, hover overlay with caption, data-category attribute
    - Click opens lightbox (interaction handled by Task 30)
    - Apply existing CSS classes: #gallery, .gallery-item
  - Add both to homepage page.tsx
  - Use `next/image` with lazy loading prop

  **Must NOT do**:
  - Do NOT add gallery filtering by category (not in current site)
  - Do NOT add infinite scroll or pagination

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Image-heavy gallery grid, card layouts, lazy loading
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-26, 28-30)
  - **Blocks**: Tasks 30, 31
  - **Blocked By**: Tasks 10, 12, 13

  **References**:

  **Pattern References**:
  - `index.html` lines 445-601 — Hall of Fame and Gallery HTML structure
  - `styles.css` — .topper-card, .achievement-card, .gallery-grid, .gallery-item classes
  - `src/lib/models/hallOfFame.ts`, `src/lib/models/gallery.ts` (from Task 8)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Gallery displays images in grid with hover effect
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Scroll to Gallery section
      2. Count gallery items — assert >= 9
      3. Assert images are visible (not broken)
      4. Hover over a gallery item — assert overlay appears
      5. Screenshot
    Expected Result: Gallery grid with images and hover overlays
    Failure Indicators: Broken images, no hover effect, wrong count
    Evidence: .sisyphus/evidence/task-27-gallery.png

  Scenario: Hall of Fame shows toppers and achievements
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Scroll to Hall of Fame section
      2. Assert topper cards visible with student info
      3. Assert achievement cards visible
      4. Screenshot
    Expected Result: Both toppers and achievements rendered
    Failure Indicators: Missing cards, empty section
    Evidence: .sisyphus/evidence/task-27-hall-of-fame.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(public): add SSR Hall of Fame and Gallery sections`
  - Files: `src/components/public/HallOfFameSection.tsx, src/components/public/GallerySection.tsx`

- [x] 28. Public Page — Events + Admissions Sections

  **What to do**:
  - Create `src/components/public/EventsSection.tsx`:
    - Server component: fetch Events from DB (sorted by date, newest first)
    - Event cards: image, title, description, date
    - Apply existing CSS classes: #events, event card styles
  - Create `src/components/public/AdmissionsSection.tsx`:
    - Server component: fetch Admissions content from DB
    - Admission process: 4 numbered steps
    - Required documents: 7 item list
    - Inquiry info box: phone, email, descriptive text
    - Apply existing CSS classes: #admissions
  - Add both to homepage page.tsx

  **Must NOT do**:
  - Do NOT add event detail pages (current site has no sub-pages)
  - Do NOT add admission application form (current site links to inquiry info)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Card-based event display, stepped process layout
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-27, 29, 30)
  - **Blocks**: Task 31
  - **Blocked By**: Tasks 10, 12, 13

  **References**:

  **Pattern References**:
  - `index.html` lines 605-772 — Events and Admissions HTML structure
  - `styles.css` — event card, admission step, document list styles
  - `src/lib/models/events.ts`, `src/lib/models/admissions.ts` (from Task 8)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Events section displays event cards
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Scroll to Events section
      2. Assert >= 3 event cards visible
      3. Each card has image, title, description, date
      4. Screenshot
    Expected Result: Event cards rendered with full content
    Failure Indicators: Empty section, missing images, wrong count
    Evidence: .sisyphus/evidence/task-28-events.png

  Scenario: Admissions shows 4-step process
    Tool: Playwright
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. Scroll to Admissions section
      2. Assert 4 numbered steps visible
      3. Assert required documents list has 7 items
      4. Assert inquiry info box with phone and email
      5. Screenshot
    Expected Result: Complete admissions info rendered
    Failure Indicators: Missing steps, incomplete document list
    Evidence: .sisyphus/evidence/task-28-admissions.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(public): add SSR Events and Admissions sections`
  - Files: `src/components/public/EventsSection.tsx, src/components/public/AdmissionsSection.tsx`

- [x] 29. Public Page — Contact + Announcements Sections

  **What to do**:
  - Create `src/components/public/ContactSection.tsx`:
    - Server component for contact info display (address, phone, email, hours, campus tour image)
    - Client component for contact form: name, email, phone, subject dropdown, message textarea
    - Form validation: required fields, email regex (match current script.js logic)
    - On submit: POST to /api/contact, show success/error message, reset form, auto-hide message after 5s
    - Loading state on submit button
    - Prevent double submission (match current resubmission prevention logic)
    - Apply existing CSS classes: #contact, .form-group, .contact-info
  - Create `src/components/public/AnnouncementsSection.tsx`:
    - Server component: fetch active announcements from DB
    - Display as a list/ticker: title, date, content preview
    - NEW section — design should match the site's existing card/section style
    - Only show announcements where isActive === true
  - Add both to homepage page.tsx

  **Must NOT do**:
  - Do NOT add CAPTCHA to the contact form
  - Do NOT send email on form submission
  - Do NOT add animations beyond the standard scroll reveal

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form with validation + new section design that must match existing style
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-28, 30)
  - **Blocks**: Task 31
  - **Blocked By**: Tasks 10, 12, 13, 19

  **References**:

  **Pattern References**:
  - `index.html` lines 776-892 — Contact section HTML structure (form fields, info display)
  - `script.js` — contact form validation logic, submission simulation, success/error messages, auto-hide, resubmission prevention
  - `styles.css` — .form-group, .contact-info, form element styles
  - `src/app/api/contact/route.ts` (from Task 19) — API endpoint for submissions

  **WHY Each Reference Matters**:
  - HTML shows exact form fields and layout
  - JS shows exact validation rules and UX behavior to replicate
  - API endpoint defines the submission target

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Submit contact form successfully
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Scroll to Contact section
      2. Fill name: "Test User"
      3. Fill email: "test@example.com"
      4. Fill phone: "9876543210"
      5. Select subject: "General Inquiry"
      6. Fill message: "This is a test message"
      7. Click submit button
      8. Assert success message appears
      9. Assert form fields are cleared
      10. Wait 6 seconds — assert success message auto-hides
    Expected Result: Form submits, success shown, form resets, message auto-hides
    Failure Indicators: Submit fails, no success message, form not reset
    Evidence: .sisyphus/evidence/task-29-contact-submit.png

  Scenario: Form validation rejects empty required fields
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Click submit without filling any fields
      2. Assert validation error messages appear
      3. Assert form not submitted (no network request to /api/contact)
    Expected Result: Client-side validation prevents empty submission
    Failure Indicators: Form submits with empty fields, no validation messages
    Evidence: .sisyphus/evidence/task-29-validation.png
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(public): add SSR Contact form, Announcements sections`
  - Files: `src/components/public/ContactSection.tsx, src/components/public/AnnouncementsSection.tsx`

- [x] 30. Gallery Lightbox Component

  **What to do**:
  - Create `src/components/public/GalleryLightbox.tsx`:
    - Client component ("use client")
    - Full-screen overlay (dark background, high z-index)
    - Shows clicked gallery image at large size
    - Close button (X) in top-right corner
    - Close on clicking outside the image
    - Close on pressing Escape key
    - Keyboard trap: Escape only interaction (no tab management needed)
    - Smooth open/close animation (opacity transition)
    - Body scroll lock when lightbox is open
  - Integrate with GallerySection (from Task 27) — gallery items onClick triggers lightbox
  - Use CSS from styles.css for lightbox styling (or port from script.js DOM creation logic)

  **Must NOT do**:
  - Do NOT add next/previous navigation between images
  - Do NOT add image zoom
  - Do NOT add image download button
  - Do NOT use any lightbox library — pure custom implementation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Overlay component with keyboard events, scroll lock, animations
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-29)
  - **Blocks**: None
  - **Blocked By**: Task 27

  **References**:

  **Pattern References**:
  - `script.js` — gallery lightbox logic: dynamic DOM creation, overlay click close, escape key close, body scroll lock
  - `styles.css` — any lightbox/overlay styles if defined
  - `src/components/public/GallerySection.tsx` (from Task 27) — parent component to integrate with

  **WHY Each Reference Matters**:
  - JS shows exact lightbox behavior to replicate (close triggers, scroll lock)
  - Must integrate with Gallery section component

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Lightbox opens on gallery image click
    Tool: Playwright
    Preconditions: Dev server running, gallery images loaded
    Steps:
      1. Scroll to Gallery section
      2. Click on first gallery image
      3. Assert full-screen overlay appears
      4. Assert large image displayed
      5. Assert close button (X) visible
      6. Screenshot
    Expected Result: Lightbox opens with clicked image at full size
    Failure Indicators: No overlay, wrong image, no close button
    Evidence: .sisyphus/evidence/task-30-lightbox-open.png

  Scenario: Lightbox closes on Escape key
    Tool: Playwright
    Preconditions: Lightbox is open
    Steps:
      1. Open lightbox by clicking gallery image
      2. Press Escape key
      3. Assert overlay is hidden
      4. Assert page scrolling is restored
    Expected Result: Lightbox closes, scroll restored
    Failure Indicators: Lightbox stays open, scroll still locked
    Evidence: .sisyphus/evidence/task-30-lightbox-escape.txt
  ```

  **Commit**: YES (group with Wave 4)
  - Message: `feat(ui): add gallery lightbox with keyboard and click-outside close`
  - Files: `src/components/public/GalleryLightbox.tsx`

- [x] 31. Dynamic SEO — Meta, OG, Twitter Card, JSON-LD

  **What to do**:
  - Create `src/lib/seo.ts`:
    - `generateMetadata()` function that fetches SEO-relevant content from MongoDB and returns Next.js Metadata object
    - Dynamic title: "Prabhawati VidyaPeeth - [from CMS]"
    - Dynamic description from About section content
    - Dynamic Open Graph tags: title, description, image (preview.jpg or CMS hero image), url, site_name, locale
    - Dynamic Twitter Card tags: card type, title, description, image
    - Canonical URL: https://prabhawatividyapeeth.in
    - hreflang tags: en, hi, x-default
    - Geo tags: Ballia, Uttar Pradesh, India (latitude/longitude from current site)
    - Keywords meta tag from CMS or current keywords
    - Author, robots tags
  - Create `src/components/shared/JsonLd.tsx`:
    - Server component rendering JSON-LD structured data
    - EducationalOrganization schema with dynamic fields from CMS:
      - name, description, url, logo, address, telephone, email
      - Fix foundingDate "XXXX" placeholder — use actual year from CMS or hardcode if known
    - Output as `<script type="application/ld+json">` in head
  - Apply metadata in `src/app/(public)/[locale]/layout.tsx` using Next.js `generateMetadata` export
  - Preserve ALL existing SEO tags from current site — this is critical

  **Must NOT do**:
  - Do NOT remove any existing SEO tags — only make them dynamic
  - Do NOT change the canonical URL
  - Do NOT add schema types beyond EducationalOrganization

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: SEO is critical — must preserve 9/10 score, complex metadata generation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 32, 33, 34)
  - **Blocks**: Task 35
  - **Blocked By**: Tasks 25-29 (needs public pages to attach metadata to)

  **References**:

  **Pattern References**:
  - `index.html` lines 1-101 — EVERY meta tag, OG tag, Twitter tag, hreflang, geo tag, JSON-LD script. This is the definitive reference — every tag here must be reproduced dynamically.
  - `SEO_DEPLOYMENT_CHECKLIST.md` — documents current SEO setup and pending items
  - `src/lib/models/about.ts` (from Task 8) — source for description content

  **External References**:
  - Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata

  **WHY Each Reference Matters**:
  - The HTML head has 50+ SEO tags — missing even one could hurt SEO score
  - Next.js Metadata API is the correct way to generate dynamic meta tags in App Router

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: View page source shows all SEO meta tags
    Tool: Bash (curl)
    Preconditions: Dev server running, seed data loaded
    Steps:
      1. curl http://localhost:3000 and capture HTML
      2. Assert: <title> contains "Prabhawati"
      3. Assert: meta description present and non-empty
      4. Assert: og:title, og:description, og:image present
      5. Assert: twitter:card, twitter:title present
      6. Assert: canonical link to prabhawatividyapeeth.in
      7. Assert: hreflang tags for en, hi, x-default
      8. Assert: JSON-LD script with EducationalOrganization
      9. Assert: geo.region, geo.placename, geo.position tags
    Expected Result: ALL SEO tags from current site present in SSR HTML
    Failure Indicators: Missing meta tags, empty values, missing JSON-LD
    Evidence: .sisyphus/evidence/task-31-seo-meta.txt

  Scenario: JSON-LD structured data validates
    Tool: Bash
    Preconditions: Dev server running
    Steps:
      1. Extract JSON-LD from page source
      2. Parse as JSON — assert valid JSON
      3. Assert @type is "EducationalOrganization"
      4. Assert has: name, url, address, telephone
      5. Assert foundingDate is NOT "XXXX"
    Expected Result: Valid JSON-LD with all required fields
    Failure Indicators: Invalid JSON, missing @type, "XXXX" still present
    Evidence: .sisyphus/evidence/task-31-jsonld.txt
  ```

  **Commit**: YES (group with Wave 5)
  - Message: `feat(seo): add dynamic meta tags, OG, Twitter Card, JSON-LD, and hreflang`
  - Files: `src/lib/seo.ts, src/components/shared/JsonLd.tsx, src/app/(public)/[locale]/layout.tsx`

- [x] 32. Dynamic Sitemap.xml + robots.txt

  **What to do**:
  - Create `src/app/sitemap.ts`:
    - Next.js sitemap generation function
    - Static URLs: /, /#about, /#academics, /#admissions, /#contact (matching current sitemap.xml)
    - Add locale variants (/en, /hi) for each URL
    - lastmod: current date or last CMS update
    - changefreq: weekly for main page
    - Priority: 1.0 for /, 0.8 for sections
  - Create `src/app/robots.ts`:
    - Allow all bots (matching current robots.txt)
    - Reference sitemap URL
    - Host: https://prabhawatividyapeeth.in

  **Must NOT do**:
  - Do NOT add URLs for pages that don't exist (no /about page, no /events page — it's single page)
  - Do NOT add admin routes to sitemap

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Next.js sitemap/robots generation, small scope
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 31, 33, 34)
  - **Blocks**: Task 35
  - **Blocked By**: Task 13

  **References**:

  **Pattern References**:
  - `sitemap.xml` — current sitemap structure to replicate
  - `robots.txt` — current robots rules to replicate

  **External References**:
  - Next.js sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
  - Next.js robots: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Sitemap accessible and valid
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl http://localhost:3000/sitemap.xml
      2. Assert HTTP 200
      3. Assert Content-Type contains XML
      4. Assert contains URLs for /, /#about, /#academics, /#admissions, /#contact
      5. Assert no /admin routes in sitemap
    Expected Result: Valid XML sitemap with public URLs only
    Failure Indicators: 404, invalid XML, admin routes exposed
    Evidence: .sisyphus/evidence/task-32-sitemap.txt

  Scenario: Robots.txt accessible
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl http://localhost:3000/robots.txt
      2. Assert HTTP 200
      3. Assert contains "User-agent: *" and "Allow: /"
      4. Assert contains sitemap reference
    Expected Result: Valid robots.txt allowing all crawlers
    Failure Indicators: 404, disallow rules
    Evidence: .sisyphus/evidence/task-32-robots.txt
  ```

  **Commit**: YES (group with Wave 5)
  - Message: `feat(seo): add dynamic sitemap.xml and robots.txt generation`
  - Files: `src/app/sitemap.ts, src/app/robots.ts`

- [x] 33. Middleware Composition (Auth + i18n)

  **What to do**:
  - Update `src/middleware.ts` to properly compose:
    1. next-intl middleware for locale detection and routing on public routes
    2. Auth middleware for protecting /admin/* routes
  - Logic flow:
    - If path starts with `/admin/login` → skip auth, no i18n
    - If path starts with `/admin` or `/api/admin` → check JWT auth, no i18n
    - If path starts with `/api/` (public) → no i18n, no auth
    - Otherwise (public pages) → apply next-intl locale routing
  - Matcher config: exclude static files, _next, images, etc.
  - Handle default locale redirect (/ → /en or based on Accept-Language header)
  - Use `createMiddleware` from next-intl with `locales: ['en', 'hi']`, `defaultLocale: 'en'`

  **Must NOT do**:
  - Do NOT create separate middleware files — single middleware.ts
  - Do NOT add rate limiting to middleware
  - Do NOT redirect admin routes through locale paths

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Middleware composition is tricky — next-intl + auth must coexist without conflicts
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 31, 32, 34)
  - **Blocks**: Task 35
  - **Blocked By**: Tasks 7, 9

  **References**:

  **Pattern References**:
  - `src/middleware.ts` (from Task 7) — current auth-only middleware to extend
  - `src/i18n.ts` (from Task 9) — next-intl configuration

  **External References**:
  - next-intl middleware: https://next-intl-docs.vercel.app/docs/routing/middleware
  - Composing middleware in Next.js: next-intl docs have a section on combining with other middleware

  **WHY Each Reference Matters**:
  - Auth middleware already exists from Task 7 — it must be extended, not replaced
  - next-intl's createMiddleware has specific requirements for how it interacts with other middleware

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Public routes get locale prefix
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -L http://localhost:3000/ -o /dev/null -w "%{url_effective}"
      2. Assert redirected to /en (or appropriate default locale)
      3. curl http://localhost:3000/hi — assert 200 with Hindi content
    Expected Result: Public routes have locale routing
    Failure Indicators: No locale prefix, 404 on /en, /hi
    Evidence: .sisyphus/evidence/task-33-locale-routing.txt

  Scenario: Admin routes bypass i18n
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl http://localhost:3000/admin/login — assert 200 (login page, no locale prefix)
      2. Assert URL is /admin/login (NOT /en/admin/login)
      3. curl http://localhost:3000/api/admin/sections/hero with auth — assert works without locale
    Expected Result: Admin routes work without locale prefix
    Failure Indicators: Admin routes get locale prefix, 404 on /admin
    Evidence: .sisyphus/evidence/task-33-admin-bypass.txt

  Scenario: Auth still protects admin after middleware composition
    Tool: Bash (curl)
    Preconditions: Dev server running, no cookies
    Steps:
      1. curl http://localhost:3000/admin -L -o /dev/null -w "%{redirect_url}"
      2. Assert redirected to /admin/login
    Expected Result: Auth protection still works with composed middleware
    Failure Indicators: Admin accessible without auth
    Evidence: .sisyphus/evidence/task-33-auth-preserved.txt
  ```

  **Commit**: YES (group with Wave 5)
  - Message: `feat(middleware): compose auth and i18n middleware for proper route handling`
  - Files: `src/middleware.ts`

- [x] 34. Back-to-Top + Preloader + Misc Features

  **What to do**:
  - Verify BackToTop component (from Task 12) is wired into the public layout
  - Verify Preloader component (from Task 12) is wired into the root layout
  - Add console branding messages (matching current script.js):
    - School name and tagline in styled console.log
    - Create a small client component or useEffect in root layout
  - Verify form resubmission prevention (history.replaceState pattern) in contact form
  - Verify all 14 features from script.js are accounted for:
    1. Stars animation ✓ (Task 11)
    2. Mobile nav ✓ (Task 10)
    3. Sticky header ✓ (Task 12 hook + Task 10)
    4. Active nav ✓ (Task 12 hook + Task 10)
    5. Smooth scroll ✓ (Task 12)
    6. Scroll reveal ✓ (Task 12)
    7. Gallery lightbox ✓ (Task 30)
    8. Contact form ✓ (Task 29)
    9. Back to top ✓ (Task 12 + this task)
    10. Lazy loading ✓ (next/image handles this)
    11. Card hover ✓ (CSS-only from Task 3)
    12. Form resubmission prevention ✓ (Task 29 + this task)
    13. Console branding ✓ (this task)
    14. Preloader ✓ (Task 12 + this task)
  - Fix any missing connections between components

  **Must NOT do**:
  - Do NOT add new features not in the original 14
  - Do NOT refactor existing components

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification and small wiring fixes, no major new code
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 31, 32, 33)
  - **Blocks**: Task 35
  - **Blocked By**: Task 25

  **References**:

  **Pattern References**:
  - `script.js` (ALL 453 lines) — the definitive list of all 14 features to verify
  - All components from Tasks 10-12, 29, 30 — verify integration

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 14 interactive features work
    Tool: Playwright
    Preconditions: Dev server running, all previous tasks complete
    Steps:
      1. Load homepage — assert preloader shows then hides
      2. Assert stars animating in hero
      3. Scroll down — assert header gets .scrolled class
      4. Scroll to About — assert nav "About" link highlighted
      5. Click nav link — assert smooth scroll
      6. Assert sections animate in on scroll (scroll reveal)
      7. Click gallery image — assert lightbox opens
      8. Close lightbox with Escape
      9. Scroll to bottom — assert back-to-top button appears
      10. Click back-to-top — assert scrolls to top
      11. Open browser console — assert branding messages present
      12. On mobile viewport — assert hamburger menu works
    Expected Result: All 14 features functional
    Failure Indicators: Any feature not working
    Evidence: .sisyphus/evidence/task-34-all-features.png
  ```

  **Commit**: YES (group with Wave 5)
  - Message: `feat(ui): wire back-to-top, preloader, console branding, and verify all features`
  - Files: `src/app/layout.tsx (or relevant layout), minor component updates`

- [x] 35. Full Build Verification + Lighthouse Audit

  **What to do**:
  - Run full build: `npm run build` — fix ALL errors and warnings
  - Run production server: `npm run start` — verify it works
  - Run Lighthouse audit in Playwright:
    - Performance score ≥ 80
    - SEO score ≥ 90 (critical — must match or exceed current 9/10)
    - Accessibility score ≥ 80
    - Best Practices score ≥ 80
  - Verify SSR: curl homepage, check that ALL section content is in raw HTML
  - Verify no TypeScript errors: `npx tsc --noEmit`
  - Check bundle size is reasonable (Next.js build output shows page sizes)
  - Verify all images load correctly
  - Verify both EN and HI versions render correctly
  - Test admin login → edit → see change on public site (full flow)
  - Document any issues found and fix them

  **Must NOT do**:
  - Do NOT optimize for perfect 100 scores — just meet minimums
  - Do NOT add performance optimizations beyond what Next.js provides by default

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Comprehensive verification requiring build, serve, audit, multi-step testing
  - **Skills**: [`playwright`]
    - `playwright`: Needed for Lighthouse audit and browser-based testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (last task before Final Verification)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: ALL previous tasks (31, 32, 33, 34)

  **References**:

  **Pattern References**:
  - Every component and file from ALL previous tasks
  - `.sisyphus/plans/admin-panel-cms.md` — this plan's acceptance criteria

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Production build succeeds
    Tool: Bash
    Preconditions: All tasks complete
    Steps:
      1. Run `npm run build`
      2. Assert exit code 0
      3. Assert no errors in output
      4. Check output for page sizes — flag any page > 200KB
    Expected Result: Clean build with no errors
    Failure Indicators: Build errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-35-build.txt

  Scenario: Lighthouse SEO score meets target
    Tool: Playwright
    Preconditions: Production server running (npm start)
    Steps:
      1. Navigate to http://localhost:3000
      2. Run Lighthouse audit for SEO category
      3. Assert SEO score >= 90
      4. If < 90, capture specific failures
    Expected Result: Lighthouse SEO >= 90
    Failure Indicators: SEO < 90, missing meta tags, inaccessible content
    Evidence: .sisyphus/evidence/task-35-lighthouse.json

  Scenario: Full admin-to-public content flow
    Tool: Playwright
    Preconditions: Production server running, seed data loaded
    Steps:
      1. Navigate to / — assert hero title matches seed data
      2. Login to /admin
      3. Go to /admin/sections/hero — change title to "Lighthouse Test Title"
      4. Save
      5. Navigate to / — assert hero title now says "Lighthouse Test Title"
      6. Change back to original title
    Expected Result: Admin edits immediately visible on public site
    Failure Indicators: Edit not reflected, SSR serving stale content
    Evidence: .sisyphus/evidence/task-35-full-flow.png
  ```

  **Commit**: YES
  - Message: `chore: fix build issues and verify Lighthouse scores`
  - Files: Various bug fixes identified during audit

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npm run lint` + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify Mongoose singleton pattern used correctly. Check no Tailwind classes anywhere.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Open browser. Navigate every public section — verify content renders from CMS, language toggle works, all animations play, gallery lightbox works, contact form submits. Login to admin — edit a section — verify change appears on public site. Check mobile (768px viewport). Run Lighthouse for SEO score. Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Sections [N/N rendered] | Admin [N/N functional] | Mobile [PASS/FAIL] | SEO [score] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", verify actual implementation matches. Check "Must NOT Have" compliance: no Tailwind, no rich text editor, no draft/publish, no versioning, no multi-user, no email service, no over-abstraction. Verify all 44 images migrated. Verify all 126 translation keys per language present. Flag anything built but not in spec (scope creep).
  Output: `Tasks [N/N compliant] | Guardrails [N/N clean] | Images [N/44] | Translations [N/126] | VERDICT`

---

## Commit Strategy

- After Wave 1: `feat(setup): initialize Next.js project with MongoDB, CSS design system, and static assets`
- After Wave 2: `feat(core): add auth system, content models, i18n, and shared UI components`
- After Wave 3: `feat(api): add content API routes, admin CRUD, image upload, and seed script`
- After Wave 4: `feat(ui): add admin CMS editors and SSR public pages for all sections`
- After Wave 5: `feat(seo): add dynamic SEO, sitemap, middleware composition, and final polish`
- After Final QA: `chore: final verification and cleanup`

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Expected: Build succeeds, zero errors
npm run start          # Expected: Server starts on port 3000
curl http://localhost:3000 | head -50  # Expected: Full HTML with content (not empty shell)
curl http://localhost:3000/api/content/hero  # Expected: 200 with JSON content
curl -X POST http://localhost:3000/api/auth/login -d '{"email":"admin@pvp.in","password":"..."}' # Expected: 200 with token
```

### Final Checklist
- [ ] All 10 public sections render with SSR content
- [ ] Admin can login and edit all 11 CMS sections
- [ ] Gallery image upload works
- [ ] Contact form stores submissions
- [ ] EN/HI toggle works on all sections (126 keys each)
- [ ] SEO: meta, OG, Twitter Card, JSON-LD all dynamic
- [ ] Sitemap.xml generated dynamically
- [ ] Lighthouse SEO ≥ 90
- [ ] Desktop + mobile (768px) layouts match current design
- [ ] Stars animation performs well
- [ ] All 14 JS features ported and working
- [ ] All 44 images accessible
- [ ] No Tailwind, no rich text editor, no draft/publish
