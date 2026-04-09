# Registration + Online Payment System

## TL;DR

> **Quick Summary**: Build a student registration system with Razorpay online payment for 10th and 12th class admissions. Admin can configure fees, enable/disable forms, and view all registrations with stats and export.
> 
> **Deliverables**:
> - Public registration form page (`/[locale]/registration`) with bilingual support
> - Razorpay payment integration (order creation, checkout, verification, webhook)
> - Admin registration settings page (enable/disable, fees, date windows)
> - Admin registrations list with filters, detail view, stats dashboard, CSV export
> - Email notifications (student confirmation + admin notification via Nodemailer)
> - File uploads for student photo + marksheet (including PDF support)
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 5 → Task 7 → Task 9 → Task 11 → Task 13 → F1-F4

---

## Context

### Original Request
User wants a new section where admin can enable/disable 10th and 12th registration forms, students can pay online via Razorpay, and all data is visible in admin panel.

### Interview Summary
**Key Discussions**:
- **Registration fields**: Comprehensive — name, father/mother name, phone, email, DOB, gender, class (10th/12th), previous school, address, Aadhar number, category (Gen/OBC/SC/ST), stream for 12th (Science PCM/PCB, Commerce, Arts), previous marks, photo upload, marksheet upload
- **Fee structure**: Admin-configurable — different amounts for 10th and 12th, set from admin panel
- **Registration window**: Admin-configurable start/end dates per class
- **Payment gateway**: Razorpay — server-side order creation, client-side checkout.js, signature verification, webhook handler
- **Post-registration**: Confirmation page + email to student + email notification to admin (Nodemailer SMTP)
- **File uploads**: Local `/public/images/uploads/` directory (matching existing upload pattern)
- **Admin panel**: List with filters + detail view + CSV/Excel export + dashboard stats
- **12th streams**: Science (PCM), Science (PCB), Commerce, Arts/Humanities
- **Form UX**: Multi-step wizard for mobile-friendliness (15+ fields)

**Research Findings**:
- Existing form pattern: `ContactForm.tsx` — controlled inputs with useState, fetch POST, error/success states
- Existing API pattern: validate → `connectDB()` → `Model.create()` → `NextResponse.json()`
- Existing model pattern: singleton export `(models.X as Model<T>) || model<T>("X", schema)`, barrel in `index.ts`
- Existing upload: native Web API `request.formData()`, stored in `public/images/uploads/`, 5MB limit, images only
- No existing payment/registration code — fully greenfield
- Admin CSS has comprehensive classes for forms, tables, panels, stats — no new CSS needed
- Middleware auto-protects `/api/admin/*` routes via JWT verification

### Metis Review
**Identified Gaps** (addressed):
- **Duplicate prevention**: Unique constraint on Aadhar per academic session
- **Payment abandonment**: Registration saved as "pending" before order creation, retry allowed
- **Registration number**: Auto-generated unique format (PVP-{year}-{class}-{sequence})
- **PDF support**: Extended upload validation to accept PDF for marksheets
- **Academic session**: Scoped to configurable session year
- **Idempotent webhooks**: Check current status before updating, deduplicate by event ID
- **Fire-and-forget emails**: Don't await email sending in payment response path
- **Paid registration protection**: Paid registrations cannot be deleted by admin (soft-delete or block)

---

## Work Objectives

### Core Objective
Enable students to register for 10th/12th class admissions online with Razorpay payment, with admin-configurable settings and full data visibility.

### Concrete Deliverables
- 2 new Mongoose models: `Registration`, `RegistrationSettings`
- 1 Razorpay utility module: `src/lib/razorpay.ts`
- 1 email utility module: `src/lib/email.ts`
- 10 new API routes (public registration + Razorpay + admin)
- 1 public registration page with multi-step form
- 3 new admin pages (settings, list, detail)
- i18n keys for both `en.json` and `hi.json`
- Updated admin sidebar navigation
- Updated `.env.local.example`

### Definition of Done
- [ ] Registration form accessible at `/en/registration` and `/hi/registration`
- [ ] Admin can enable/disable 10th/12th independently from admin panel
- [ ] Students can fill form and pay via Razorpay
- [ ] Payment status updates correctly (pending → paid)
- [ ] Confirmation email sent to student after payment
- [ ] Admin notification email sent after payment
- [ ] Admin can view all registrations with filters
- [ ] Admin can export registrations as CSV
- [ ] Admin dashboard shows registration stats
- [ ] `npx next build` passes clean

### Must Have
- Razorpay payment with signature verification
- Admin-configurable fees per class
- Admin-configurable registration date windows per class
- Duplicate Aadhar prevention per academic session
- File upload support for photos (JPEG/PNG) and marksheets (JPEG/PNG/PDF)
- Stream selection for 12th class only
- Registration number generation
- Bilingual form labels (English/Hindi)

### Must NOT Have (Guardrails)
- **NO student accounts/login** — registration is a one-time public form
- **NO refund functionality** — refunds handled via Razorpay dashboard
- **NO SMS notifications** — email only
- **NO seat capacity/limits** — out of scope
- **NO registration approval workflow** — paid = confirmed
- **NO installment payments** — one registration = one payment
- **NO new CSS files** for admin pages — use existing `admin.css` classes
- **NO new npm packages** beyond `razorpay`, `nodemailer`, `@types/nodemailer`
- **NO modifications** to existing models, APIs, or components (additive only, except barrel + nav + i18n + .env.example)
- **NO multer/formidable** — use native Web API for uploads
- **NO client-side exposure** of `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET`
- **NO dashboard charts/graphs** — stat cards with numbers only
- **NO edit registration after payment** — admin can view, student cannot edit
- **NO PDF receipt generation** — confirmation page + email is sufficient for V1

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (no test framework in project)
- **Framework**: None

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **API routes**: Use Bash (curl) — Send requests, assert status + response fields
- **Admin pages**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Public pages**: Use Playwright — Navigate form, fill fields, assert rendering
- **Models/Modules**: Use Bash (bun/node) — Import, verify schema, check exports

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — models + utilities + config):
├── Task 1: Registration & RegistrationSettings models + barrel export [quick]
├── Task 2: Razorpay utility module (lib/razorpay.ts) [quick]
├── Task 3: Email utility module (lib/email.ts) [quick]
├── Task 4: Update .env.local.example + add env vars [quick]

Wave 2 (APIs — all independent once models exist):
├── Task 5: Registration settings admin API (GET/PUT) [quick]
├── Task 6: Registration submission API (POST) + file upload [unspecified-high]
├── Task 7: Razorpay order creation API [quick]
├── Task 8: Razorpay verify + webhook APIs [unspecified-high]
├── Task 9: Email sending integration (post-payment hook) [quick]

Wave 3 (Pages — depend on APIs):
├── Task 10: Admin registration settings page [visual-engineering]
├── Task 11: Public registration form page (multi-step) [visual-engineering]
├── Task 12: Admin registrations list page + stats [visual-engineering]
├── Task 13: Admin registration detail page [visual-engineering]
├── Task 14: Admin CSV export + download button [quick]

Wave 4 (Integration — wiring):
├── Task 15: Admin sidebar nav update [quick]
├── Task 16: i18n keys for registration pages [quick]
├── Task 17: Final build verification + integration test [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
├── Task F4: Scope fidelity check (unspecified-high)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 |
| 2 | — | 7, 8 |
| 3 | — | 9 |
| 4 | — | — |
| 5 | 1 | 10, 11 |
| 6 | 1 | 11 |
| 7 | 1, 2 | 11 |
| 8 | 1, 2 | 11 |
| 9 | 1, 3 | — |
| 10 | 5 | — |
| 11 | 5, 6, 7, 8 | — |
| 12 | 1 | — |
| 13 | 1 | — |
| 14 | 1 | — |
| 15 | — | — |
| 16 | — | 11 |
| 17 | ALL | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: **5 tasks** — T5 → `quick`, T6 → `unspecified-high`, T7 → `quick`, T8 → `unspecified-high`, T9 → `quick`
- **Wave 3**: **5 tasks** — T10 → `visual-engineering`, T11 → `visual-engineering`, T12 → `visual-engineering`, T13 → `visual-engineering`, T14 → `quick`
- **Wave 4**: **3 tasks** — T15 → `quick`, T16 → `quick`, T17 → `unspecified-high`
- **FINAL**: **4 tasks** — F1 → `unspecified-high`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `unspecified-high`

---

## TODOs

- [ ] 1. Registration & RegistrationSettings Mongoose Models

  **What to do**:
  - Create `src/lib/models/registration.ts` with `RegistrationDocument` interface and schema:
    - `studentName: String` (required)
    - `fatherName: String` (required)
    - `motherName: String` (required)
    - `phone: String` (required, 10 digits)
    - `email: String` (required)
    - `dob: String` (required, ISO date)
    - `gender: String` (required, enum: 'male'|'female'|'other')
    - `class: String` (required, enum: '10th'|'12th')
    - `previousSchool: String` (required)
    - `address: String` (required)
    - `aadharNumber: String` (required, 12 digits)
    - `category: String` (required, enum: 'general'|'obc'|'sc'|'st')
    - `stream: String` (enum: 'science-pcm'|'science-pcb'|'commerce'|'arts', required only when class=12th)
    - `previousMarks: String` (optional, percentage or grade)
    - `photoUrl: String` (optional, file path)
    - `marksheetUrl: String` (optional, file path)
    - `registrationNumber: String` (unique, auto-generated format: `PVP-{YYYY}-{class}-{4-digit-sequence}`)
    - `academicSession: String` (required, e.g., '2026-27')
    - `razorpayOrderId: String`
    - `razorpayPaymentId: String`
    - `razorpaySignature: String`
    - `paymentStatus: String` (enum: 'pending'|'paid'|'failed', default: 'pending')
    - `amountPaid: Number` (in paise, default: 0)
    - `timestamps: true`
  - Add compound unique index on `{ aadharNumber: 1, academicSession: 1 }`
  - Add indexes on: `paymentStatus`, `class`, `registrationNumber`
  - Auto-generate `registrationNumber` in a pre-save hook: query max existing sequence for that session+class, increment
  - Create `src/lib/models/registrationSettings.ts` with singleton pattern:
    - `slug: String` (default: 'default', unique — use `singletonSlugField` from shared.ts)
    - `class10Enabled: Boolean` (default: false)
    - `class12Enabled: Boolean` (default: false)
    - `class10Fee: Number` (in paise, default: 0)
    - `class12Fee: Number` (in paise, default: 0)
    - `class10StartDate: String` (ISO date, optional)
    - `class10EndDate: String` (ISO date, optional)
    - `class12StartDate: String` (ISO date, optional)
    - `class12EndDate: String` (ISO date, optional)
    - `academicSession: String` (default: '2026-27')
    - `timestamps: true`
  - Export both models from `src/lib/models/index.ts` barrel file

  **Must NOT do**:
  - Do NOT modify any existing model file
  - Do NOT add validation beyond what's in the schema (API routes handle validation)
  - Do NOT add methods to the model (keep it data-only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Two model files + barrel update, follows well-established pattern
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant — this is pure Mongoose schema work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/models/contactSubmission.ts` — Model export pattern: `(models.ContactSubmission as Model<T>) || model<T>("ContactSubmission", schema)`. Follow this exactly.
  - `src/lib/models/admissions.ts` — Singleton model with `singletonSlugField` from shared.ts. Follow for RegistrationSettings.
  - `src/lib/models/shared.ts` — `singletonSlugField` utility and `localizedStringSchema`. Import `singletonSlugField` for RegistrationSettings.

  **API/Type References**:
  - `src/lib/models/index.ts` — Barrel export file. Add `export { RegistrationModel } from "./registration"` and `export { RegistrationSettingsModel } from "./registrationSettings"` here.

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Models compile and export correctly
    Tool: Bash (lsp_diagnostics)
    Preconditions: Files created
    Steps:
      1. Run lsp_diagnostics on src/lib/models/registration.ts — expect 0 errors
      2. Run lsp_diagnostics on src/lib/models/registrationSettings.ts — expect 0 errors
      3. Run lsp_diagnostics on src/lib/models/index.ts — expect 0 errors
      4. Grep src/lib/models/index.ts for "RegistrationModel" and "RegistrationSettingsModel"
    Expected Result: Zero TypeScript errors, both exports present in barrel
    Failure Indicators: Any error diagnostic, missing export
    Evidence: .sisyphus/evidence/task-1-models-compile.txt

  Scenario: Registration schema has required fields and indexes
    Tool: Bash (grep)
    Preconditions: registration.ts created
    Steps:
      1. Grep registration.ts for "aadharNumber" — must exist
      2. Grep registration.ts for "paymentStatus" — must exist with enum
      3. Grep registration.ts for "registrationNumber" — must exist with unique
      4. Grep registration.ts for "compound" or "index" — must have aadhar+session compound index
    Expected Result: All fields present with correct constraints
    Evidence: .sisyphus/evidence/task-1-schema-fields.txt
  ```

  **Commit**: YES (group 1)
  - Message: `feat(models): add Registration and RegistrationSettings models`
  - Files: `src/lib/models/registration.ts`, `src/lib/models/registrationSettings.ts`, `src/lib/models/index.ts`
  - Pre-commit: `lsp_diagnostics` on all 3 files

- [ ] 2. Razorpay Utility Module

  **What to do**:
  - Install `razorpay` package: `npm install razorpay`
  - Create `src/lib/razorpay.ts` with:
    - Import `Razorpay` from 'razorpay' and `crypto` from 'crypto'
    - Export `getRazorpayInstance()` — lazy singleton: `new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })`
    - Export `createOrder(amountInPaise: number, receipt: string, notes?: Record<string, string>)` — calls `razorpay.orders.create({ amount: amountInPaise, currency: 'INR', receipt, notes, payment_capture: true })`
    - Export `verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean` — HMAC-SHA256 of `${orderId}|${paymentId}` with `RAZORPAY_KEY_SECRET`, compare using `crypto.timingSafeEqual`
    - Export `verifyWebhookSignature(rawBody: string, signature: string): boolean` — HMAC-SHA256 of `rawBody` with `RAZORPAY_WEBHOOK_SECRET`, compare using `crypto.timingSafeEqual`

  **Must NOT do**:
  - Do NOT expose `RAZORPAY_KEY_SECRET` in any exported value
  - Do NOT use `===` for signature comparison (must use `timingSafeEqual`)
  - Do NOT add error handling — callers handle errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single utility file with 4 exported functions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/lib/db.ts` — Existing utility module pattern. Follow same export style.

  **External References**:
  - Razorpay Node.js SDK: `npm install razorpay` — `orders.create()` expects `{ amount, currency, receipt, notes, payment_capture }`
  - Signature verification: `crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex')` then `crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(received))`
  - Webhook verification: Same HMAC but with `RAZORPAY_WEBHOOK_SECRET` and raw request body

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Module compiles and exports all functions
    Tool: Bash (lsp_diagnostics)
    Steps:
      1. Run lsp_diagnostics on src/lib/razorpay.ts — expect 0 errors
      2. Grep for "export function createOrder" — must exist
      3. Grep for "export function verifyPaymentSignature" — must exist
      4. Grep for "export function verifyWebhookSignature" — must exist
      5. Grep for "timingSafeEqual" — must exist (security requirement)
      6. Grep for "RAZORPAY_KEY_SECRET" — must only appear in server-side context
    Expected Result: All 4 functions exported, timingSafeEqual used, no client exposure
    Evidence: .sisyphus/evidence/task-2-razorpay-module.txt

  Scenario: No secret exposure
    Tool: Bash (grep)
    Steps:
      1. Grep entire src/lib/razorpay.ts for "NEXT_PUBLIC" — must NOT contain any NEXT_PUBLIC env vars
      2. Verify file does NOT have "use client" directive
    Expected Result: No client-side markers, no public env vars
    Evidence: .sisyphus/evidence/task-2-no-secret-exposure.txt
  ```

  **Commit**: YES (group 2)
  - Message: `feat(lib): add Razorpay utility module`
  - Files: `src/lib/razorpay.ts`, `package.json`, `package-lock.json`

- [ ] 3. Email Utility Module (Nodemailer)

  **What to do**:
  - Install packages: `npm install nodemailer` and `npm install -D @types/nodemailer`
  - Create `src/lib/email.ts` with:
    - Import `nodemailer` and `createTransport`
    - Export `getTransporter()` — lazy singleton: `createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })`
    - Export `sendRegistrationConfirmation(to: string, data: { studentName: string, class: string, registrationNumber: string, amountPaid: number, paymentId: string })` — sends HTML email with registration details
    - Export `sendAdminNotification(data: { studentName: string, class: string, phone: string, amountPaid: number, registrationNumber: string })` — sends to `process.env.ADMIN_NOTIFICATION_EMAIL`
    - Email templates: Simple HTML with inline styles (no template engine)
    - Both functions return `Promise<void>`, catch errors internally and `console.error` (fire-and-forget pattern)

  **Must NOT do**:
  - Do NOT let email errors propagate — catch and log only
  - Do NOT install template engines (handlebars, ejs, etc.)
  - Do NOT add retry logic — single attempt, fire-and-forget

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single utility file with transporter + 2 email functions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/lib/db.ts` — Utility module export pattern

  **External References**:
  - Nodemailer: `createTransport({ host, port, secure, auth })`, `transporter.sendMail({ from, to, subject, html })`
  - Amount display: Convert paise to rupees with `(amountInPaise / 100).toLocaleString('en-IN')` for ₹ formatting

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Module compiles and exports correctly
    Tool: Bash (lsp_diagnostics)
    Steps:
      1. Run lsp_diagnostics on src/lib/email.ts — expect 0 errors
      2. Grep for "export function sendRegistrationConfirmation" — must exist
      3. Grep for "export function sendAdminNotification" — must exist
      4. Grep for "console.error" — must exist (fire-and-forget error handling)
    Expected Result: All functions exported, error handling present
    Evidence: .sisyphus/evidence/task-3-email-module.txt
  ```

  **Commit**: YES (group 2)
  - Message: `feat(lib): add email notification utility module`
  - Files: `src/lib/email.ts`, `package.json`, `package-lock.json`

- [ ] 4. Update .env.local.example with New Variables

  **What to do**:
  - Edit `D:\PrabhawatiVidyaPeeth\.env.local.example` to append new variables:
    ```
    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
    RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

    # Email (SMTP)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-app-password
    SMTP_FROM=Prabhawati Vidyapeeth <noreply@prabhawatividyapeeth.in>
    ADMIN_NOTIFICATION_EMAIL=admin@prabhawatividyapeeth.in
    ```

  **Must NOT do**:
  - Do NOT include actual credentials
  - Do NOT modify existing variables

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file edit, append only
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `D:\PrabhawatiVidyaPeeth\.env.local.example` — Existing env template format to follow

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: All new env vars present
    Tool: Bash (grep)
    Steps:
      1. Grep .env.local.example for "RAZORPAY_KEY_ID" — must exist
      2. Grep for "RAZORPAY_KEY_SECRET" — must exist
      3. Grep for "NEXT_PUBLIC_RAZORPAY_KEY_ID" — must exist
      4. Grep for "RAZORPAY_WEBHOOK_SECRET" — must exist
      5. Grep for "SMTP_HOST" — must exist
      6. Grep for "ADMIN_NOTIFICATION_EMAIL" — must exist
    Expected Result: All 10 new env vars present
    Evidence: .sisyphus/evidence/task-4-env-vars.txt
  ```

  **Commit**: YES (group 3)
  - Message: `chore: update .env.local.example with payment and email variables`
  - Files: `.env.local.example`

- [ ] 5. Registration Settings Admin API (GET/PUT)

  **What to do**:
  - Create `src/app/api/admin/registration-settings/route.ts`:
    - `GET` handler: `connectDB()` → `RegistrationSettingsModel.findOne({ slug: 'default' })` → return settings JSON (or defaults if not found)
    - `PUT` handler: `connectDB()` → validate body → `RegistrationSettingsModel.findOneAndUpdate({ slug: 'default' }, body, { upsert: true, new: true })` → return updated settings
    - Validation: `class10Fee` and `class12Fee` must be non-negative integers (paise). Dates must be valid ISO strings if provided. `academicSession` format: `YYYY-YY`.
    - This route is under `/api/admin/` so middleware auto-protects it (JWT required)

  **Must NOT do**:
  - Do NOT add custom auth logic — middleware handles it
  - Do NOT validate fee amounts as rupees — they are stored as paise

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single API route file, GET + PUT, follows existing admin API pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/app/api/admin/sections/[section]/route.ts` — Admin API pattern: connectDB → Model query → NextResponse.json. Follow GET (findOne) and PUT (findOneAndUpdate with upsert) pattern.

  **API/Type References**:
  - `src/lib/db.ts` — `connectDB()` import
  - `src/lib/models/index.ts` — `RegistrationSettingsModel` import (from Task 1)

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: GET returns default settings when none exist
    Tool: Bash (curl)
    Preconditions: No settings document in DB
    Steps:
      1. Start dev server
      2. Get admin token via POST /api/auth/login with admin credentials
      3. curl -s http://localhost:3000/api/admin/registration-settings -H "Cookie: admin-token=<token>"
      4. Assert response has class10Enabled, class12Enabled, class10Fee, class12Fee fields
    Expected Result: 200 with default values (both disabled, fees 0)
    Evidence: .sisyphus/evidence/task-5-get-defaults.txt

  Scenario: PUT updates settings and GET reflects changes
    Tool: Bash (curl)
    Steps:
      1. curl -X PUT http://localhost:3000/api/admin/registration-settings -H "Cookie: admin-token=<token>" -H "Content-Type: application/json" -d '{"class10Enabled":true,"class10Fee":50000,"class10StartDate":"2026-04-01","class10EndDate":"2026-06-30","academicSession":"2026-27"}'
      2. Assert response has ok:true and updated values
      3. curl GET same endpoint — verify class10Enabled is true, class10Fee is 50000
    Expected Result: PUT returns 200, GET confirms persistence
    Evidence: .sisyphus/evidence/task-5-put-update.txt

  Scenario: PUT without auth returns 401
    Tool: Bash (curl)
    Steps:
      1. curl -X PUT http://localhost:3000/api/admin/registration-settings -H "Content-Type: application/json" -d '{"class10Enabled":true}' (no cookie)
      2. Assert response is 401 or redirect
    Expected Result: Unauthorized response
    Evidence: .sisyphus/evidence/task-5-auth-check.txt
  ```

  **Commit**: YES (group 4)
  - Message: `feat(api): add registration settings admin API`
  - Files: `src/app/api/admin/registration-settings/route.ts`

- [ ] 6. Registration Submission API (POST with File Upload)

  **What to do**:
  - Create `src/app/api/registration/submit/route.ts`:
    - `POST` handler: Accepts `multipart/form-data` (for file uploads)
    - Parse form data using native `request.formData()` (matching existing upload pattern)
    - Extract text fields: studentName, fatherName, motherName, phone, email, dob, gender, class, previousSchool, address, aadharNumber, category, stream, previousMarks
    - Extract file fields: `photo` (optional, JPEG/PNG, max 2MB), `marksheet` (optional, JPEG/PNG/PDF, max 5MB)
    - Validate all required fields server-side:
      - phone: exactly 10 digits
      - email: standard email regex
      - aadharNumber: exactly 12 digits
      - class: '10th' or '12th'
      - stream: required if class='12th', must be one of 'science-pcm'|'science-pcb'|'commerce'|'arts'
      - gender: 'male'|'female'|'other'
      - category: 'general'|'obc'|'sc'|'st'
    - Save uploaded files to `public/images/uploads/registrations/` with unique filename (timestamp + original name)
    - Fetch current `RegistrationSettings` to verify:
      - Registration is enabled for the requested class
      - Current date is within the registration window (if dates set)
    - If validation passes: `connectDB()` → `RegistrationModel.create(data)` → return `{ ok: true, registrationId: doc._id, registrationNumber: doc.registrationNumber }`
    - Handle duplicate Aadhar: catch MongoDB duplicate key error (code 11000) → return 409 with "Already registered with this Aadhar number for this session"

  **Must NOT do**:
  - Do NOT use multer or formidable — use native Web API only
  - Do NOT create Razorpay order here — that's a separate endpoint (Task 7)
  - Do NOT send emails here — that happens after payment (Task 9)
  - Do NOT store files outside `public/images/uploads/registrations/`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex validation logic + file upload handling + registration window checks
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8, 9)
  - **Blocks**: Task 11
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/app/api/admin/upload/route.ts` — File upload pattern: `request.formData()`, `Buffer.from(await file.arrayBuffer())`, `writeFile()`. CRITICAL: This is the exact file handling pattern to follow. Currently only accepts images — extend validation to accept PDF for marksheets.
  - `src/app/api/contact/route.ts` — Public API validation pattern: manual field checks, early return with `{ error }`, `connectDB()` then `Model.create()`.

  **API/Type References**:
  - `src/lib/models/index.ts` — `RegistrationModel`, `RegistrationSettingsModel` imports
  - `src/lib/db.ts` — `connectDB()` import

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Successful registration submission (10th class)
    Tool: Bash (curl)
    Preconditions: Registration settings enabled for 10th, valid date window
    Steps:
      1. Enable 10th registration via settings API (Task 5)
      2. curl -X POST http://localhost:3000/api/registration/submit -F "studentName=Test Student" -F "fatherName=Test Father" -F "motherName=Test Mother" -F "phone=9876543210" -F "email=test@example.com" -F "dob=2010-05-15" -F "gender=male" -F "class=10th" -F "previousSchool=Test School" -F "address=Test Address, City" -F "aadharNumber=123456789012" -F "category=general" -F "previousMarks=85"
      3. Assert response: 201 with ok:true, registrationId present, registrationNumber matches PVP-YYYY-10-XXXX format
    Expected Result: Registration created with paymentStatus 'pending'
    Evidence: .sisyphus/evidence/task-6-submit-success.txt

  Scenario: 12th class without stream returns 400
    Tool: Bash (curl)
    Steps:
      1. curl -X POST same endpoint with class=12th but no stream field
      2. Assert response: 400 with error message about stream required
    Expected Result: Validation error
    Evidence: .sisyphus/evidence/task-6-stream-required.txt

  Scenario: Duplicate Aadhar returns 409
    Tool: Bash (curl)
    Steps:
      1. Submit registration with aadharNumber=123456789012
      2. Submit again with same aadharNumber and same academic session
      3. Assert second response: 409 with duplicate message
    Expected Result: Duplicate prevented
    Evidence: .sisyphus/evidence/task-6-duplicate-aadhar.txt

  Scenario: Disabled class returns 403
    Tool: Bash (curl)
    Steps:
      1. Disable 12th registration via settings API
      2. Submit registration with class=12th
      3. Assert response: 403 with "Registration is not open for Class 12th"
    Expected Result: Registration blocked when disabled
    Evidence: .sisyphus/evidence/task-6-disabled-class.txt
  ```

  **Commit**: YES (group 5)
  - Message: `feat(api): add registration submission API with file upload`
  - Files: `src/app/api/registration/submit/route.ts`

- [ ] 7. Razorpay Order Creation API

  **What to do**:
  - Create `src/app/api/razorpay/create-order/route.ts`:
    - `POST` handler: Accepts JSON `{ registrationId: string }`
    - Validate `registrationId` is provided
    - `connectDB()` → fetch Registration by ID → verify it exists and `paymentStatus === 'pending'`
    - Fetch RegistrationSettings → get fee for the registration's class (class10Fee or class12Fee)
    - If registration already has a `razorpayOrderId`, check if the order is still valid (not expired) — if valid, return existing orderId; if expired or none, create new
    - Call `createOrder(feeInPaise, receipt, { registrationId, class, studentName })` from `src/lib/razorpay.ts`
    - Update registration with `razorpayOrderId`
    - Return `{ ok: true, orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID }`

  **Must NOT do**:
  - Do NOT accept amount from client — always calculate from settings
  - Do NOT expose `RAZORPAY_KEY_SECRET` in response
  - Do NOT create order if registration doesn't exist or is already paid

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single API route, straightforward logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8, 9)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/app/api/contact/route.ts` — API response pattern

  **API/Type References**:
  - `src/lib/razorpay.ts` — `createOrder()` function (from Task 2)
  - `src/lib/models/index.ts` — `RegistrationModel`, `RegistrationSettingsModel`

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Create order for pending registration
    Tool: Bash (curl)
    Preconditions: Registration exists with paymentStatus 'pending', Razorpay test keys in .env.local
    Steps:
      1. Create a registration via Task 6's API
      2. curl -X POST http://localhost:3000/api/razorpay/create-order -H "Content-Type: application/json" -d '{"registrationId":"<id-from-step-1>"}'
      3. Assert response: 200 with orderId starting with "order_", amount matching class fee in paise, currency "INR", keyId present
    Expected Result: Razorpay order created, registration updated with orderId
    Evidence: .sisyphus/evidence/task-7-create-order.txt

  Scenario: Reject order for already-paid registration
    Tool: Bash (curl)
    Steps:
      1. Use a registration with paymentStatus 'paid'
      2. curl -X POST same endpoint with that registrationId
      3. Assert response: 400 with error about already paid
    Expected Result: Order creation rejected
    Evidence: .sisyphus/evidence/task-7-already-paid.txt
  ```

  **Commit**: YES (group 6)
  - Message: `feat(api): add Razorpay order creation API`
  - Files: `src/app/api/razorpay/create-order/route.ts`

- [ ] 8. Razorpay Payment Verification + Webhook APIs

  **What to do**:
  - Create `src/app/api/razorpay/verify/route.ts`:
    - `POST` handler: Accepts JSON `{ registrationId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }`
    - Call `verifyPaymentSignature()` from `src/lib/razorpay.ts`
    - If valid: update Registration → `paymentStatus: 'paid'`, store `razorpayPaymentId`, `razorpaySignature`, `amountPaid`
    - Fire-and-forget: call `sendRegistrationConfirmation()` and `sendAdminNotification()` without awaiting
    - Return `{ ok: true, valid: true, registrationNumber: doc.registrationNumber }`
    - If invalid: return `{ ok: false, valid: false, error: 'Invalid payment signature' }` with status 400
  - Create `src/app/api/razorpay/webhook/route.ts`:
    - `POST` handler: Read raw body via `request.text()`
    - Get `x-razorpay-signature` header
    - Call `verifyWebhookSignature()` — if invalid, return 400
    - Parse JSON body, switch on `event`:
      - `payment.captured`: Find registration by `razorpayOrderId` from `payload.payment.entity.order_id`, update to 'paid' if currently 'pending' (idempotent)
      - `payment.failed`: Find registration, update to 'failed' if currently 'pending'
    - Return `{ received: true }` with status 200
    - CRITICAL: Handler must be idempotent — check current status before updating

  **Must NOT do**:
  - Do NOT use `===` for signature comparison — must use `crypto.timingSafeEqual`
  - Do NOT await email sending in verify response path
  - Do NOT process webhook events that don't match known types
  - Do NOT let webhook handler take >5 seconds (Razorpay timeout)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Two API routes with security-critical signature verification + idempotency logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 9)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/app/api/contact/route.ts` — API response shape pattern

  **API/Type References**:
  - `src/lib/razorpay.ts` — `verifyPaymentSignature()`, `verifyWebhookSignature()` (from Task 2)
  - `src/lib/email.ts` — `sendRegistrationConfirmation()`, `sendAdminNotification()` (from Task 3)
  - `src/lib/models/index.ts` — `RegistrationModel`

  **External References**:
  - Razorpay webhook events: `payment.captured` has `payload.payment.entity.order_id`
  - Razorpay expects webhook response within 5 seconds
  - Webhook retry: Razorpay retries up to 24 hours — handler must be idempotent

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Verify endpoint compiles and has correct structure
    Tool: Bash (lsp_diagnostics)
    Steps:
      1. lsp_diagnostics on src/app/api/razorpay/verify/route.ts — 0 errors
      2. lsp_diagnostics on src/app/api/razorpay/webhook/route.ts — 0 errors
      3. Grep verify/route.ts for "verifyPaymentSignature" — must exist
      4. Grep webhook/route.ts for "verifyWebhookSignature" — must exist
      5. Grep webhook/route.ts for "idempotent" or check status before update pattern
    Expected Result: Both files compile, security functions used
    Evidence: .sisyphus/evidence/task-8-verify-webhook.txt

  Scenario: Webhook is idempotent
    Tool: Bash (grep)
    Steps:
      1. Read webhook/route.ts
      2. Verify it checks current paymentStatus before updating (e.g., only update if 'pending')
      3. Verify it returns 200 even if already processed
    Expected Result: Idempotency pattern present
    Evidence: .sisyphus/evidence/task-8-idempotent.txt
  ```

  **Commit**: YES (group 6)
  - Message: `feat(api): add Razorpay verify and webhook APIs`
  - Files: `src/app/api/razorpay/verify/route.ts`, `src/app/api/razorpay/webhook/route.ts`

- [ ] 9. Email Integration in Payment Flow

  **What to do**:
  - This task ensures Task 8's verify route correctly calls email functions from Task 3
  - Verify that `src/app/api/razorpay/verify/route.ts` (from Task 8) includes:
    - After successful signature verification and DB update:
    - `sendRegistrationConfirmation(registration.email, { studentName, class, registrationNumber, amountPaid, paymentId })` — fire-and-forget (no await, or wrap in try-catch with no-op)
    - `sendAdminNotification({ studentName, class, phone, amountPaid, registrationNumber })` — fire-and-forget
  - If Task 8 already integrated emails, this task is verification-only
  - If not, add the email calls to the verify route

  **Must NOT do**:
  - Do NOT await email calls in the response path — use `.catch(console.error)` pattern
  - Do NOT add emails to the webhook handler — webhook is for state reconciliation only

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification + potential small edit to verify route
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 8)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - `src/app/api/razorpay/verify/route.ts` — (from Task 8) The file to verify/update

  **API/Type References**:
  - `src/lib/email.ts` — `sendRegistrationConfirmation()`, `sendAdminNotification()` (from Task 3)

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Email calls present in verify route
    Tool: Bash (grep)
    Steps:
      1. Grep src/app/api/razorpay/verify/route.ts for "sendRegistrationConfirmation" — must exist
      2. Grep for "sendAdminNotification" — must exist
      3. Verify neither call is awaited in the main response path (check for .catch or no await)
    Expected Result: Both email functions called, fire-and-forget pattern used
    Evidence: .sisyphus/evidence/task-9-email-integration.txt
  ```

  **Commit**: YES (group 7)
  - Message: `feat(api): integrate email notifications in payment verification`
  - Files: `src/app/api/razorpay/verify/route.ts` (if modified)

- [ ] 10. Admin Registration Settings Page

  **What to do**:
  - Create `src/app/(admin)/admin/(cms)/registration-settings/page.tsx`:
    - `"use client"` component following existing admin page pattern
    - Fetch settings on mount: `GET /api/admin/registration-settings`
    - Form with toggle switches (checkboxes styled as toggles) for `class10Enabled` and `class12Enabled`
    - Fee inputs for each class: number input, display as rupees (÷100 for display, ×100 for save)
    - Date picker inputs for start/end dates per class (HTML `<input type="date">`)
    - Academic session input (text, format: YYYY-YY)
    - Save button: `PUT /api/admin/registration-settings` with all fields
    - Use existing CSS classes: `.admin-page-stack`, `.admin-panel`, `.admin-form-card`, `.admin-field`, `.admin-field-grid.two`, `.admin-button-row`, `.admin-save-button`
    - Status message on save success/error (same pattern as section editors)

  **Must NOT do**:
  - Do NOT create new CSS classes — use existing admin.css classes
  - Do NOT add custom auth logic — CMS layout handles auth
  - Do NOT store fees as rupees — always convert to paise before saving

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Admin form page with toggle UI, date pickers, fee inputs — needs good UX
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13, 14)
  - **Blocks**: None
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `src/app/(admin)/admin/(cms)/sections/hero/page.tsx` — Admin editor page pattern: "use client", useState for form/loading/saving/status, useEffect fetch on mount, handleSubmit with PUT, status message. Follow this exactly.
  - `src/app/(admin)/admin/(cms)/sections/contact/page.tsx` — Another editor pattern with simpler fields

  **API/Type References**:
  - `GET /api/admin/registration-settings` — Returns settings object (from Task 5)
  - `PUT /api/admin/registration-settings` — Accepts settings object (from Task 5)

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Settings page renders with current values
    Tool: Playwright
    Preconditions: Admin logged in, settings already configured
    Steps:
      1. Navigate to http://localhost:3000/admin/registration-settings
      2. Wait for page load (loading spinner disappears)
      3. Assert toggle for class 10 exists (input[type="checkbox"] or similar)
      4. Assert fee input fields exist for both classes
      5. Assert date inputs exist for both classes
      6. Screenshot the page
    Expected Result: All form fields rendered with current DB values
    Evidence: .sisyphus/evidence/task-10-settings-page.png

  Scenario: Toggle and save works
    Tool: Playwright
    Steps:
      1. Toggle class 10 enabled checkbox
      2. Set class 10 fee to 500 (rupees)
      3. Set class 10 start date to 2026-04-01
      4. Click save button
      5. Wait for success message
      6. Refresh page — verify values persist
    Expected Result: Settings saved and persisted
    Evidence: .sisyphus/evidence/task-10-settings-save.png
  ```

  **Commit**: YES (group 8)
  - Message: `feat(admin): add registration settings page`
  - Files: `src/app/(admin)/admin/(cms)/registration-settings/page.tsx`

- [ ] 11. Public Registration Form Page (Multi-Step Wizard)

  **What to do**:
  - Create `src/app/(public)/[locale]/registration/page.tsx` — Server component wrapper:
    - Fetch registration settings from `GET /api/registration/settings` (public endpoint, see below)
    - If neither class is enabled, show "Registration is currently closed" message
    - If within date window, render `<RegistrationForm settings={settings} />`
    - Page metadata: title/description for SEO
  - Create public settings endpoint `src/app/api/registration/settings/route.ts`:
    - `GET` handler: return only public-safe fields (enabled flags, fees in rupees, dates, session) — NO admin-only data
  - Create `src/components/public/RegistrationForm.tsx` — Client component:
    - Multi-step wizard with 4 steps:
      - **Step 1 — Personal Info**: studentName, fatherName, motherName, dob, gender, category
      - **Step 2 — Academic Info**: class selection (10th/12th, only show enabled classes), stream (conditional, only if 12th selected), previousSchool, previousMarks
      - **Step 3 — Contact & ID**: phone, email, address, aadharNumber
      - **Step 4 — Documents**: photo upload, marksheet upload, review summary
    - Step navigation: Next/Previous buttons, step indicator bar at top
    - Client-side validation per step before allowing Next
    - On final submit: POST to `/api/registration/submit` with FormData (multipart)
    - On successful submit: Create Razorpay order via POST `/api/razorpay/create-order`
    - Open Razorpay checkout modal (load `checkout.js` via `next/script`)
    - On payment success: POST to `/api/razorpay/verify` → show confirmation page with registration number
    - On payment failure/dismiss: Show "Payment pending" message with retry button
    - Razorpay checkout config: `{ key: settings.keyId, amount, currency: 'INR', name: 'Prabhawati Vidyapeeth', description: 'Registration Fee - Class {X}', order_id, prefill: { name, email, contact: phone } }`
    - Add `declare global { interface Window { Razorpay: any } }` for TypeScript
    - Use existing public page styles + add minimal inline styles for wizard steps
    - Bilingual labels via props or i18n (Task 16 adds keys)

  **Must NOT do**:
  - Do NOT accept fee amount from URL params or client state — always from settings API
  - Do NOT expose Razorpay key_secret to client
  - Do NOT skip client-side validation (but server-side is primary)
  - Do NOT use a third-party stepper/wizard library — build with simple state
  - Do NOT make more than necessary network requests — batch where possible

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex multi-step form with payment integration, needs excellent UX especially on mobile
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Wave 2 complete)
  - **Parallel Group**: Wave 3 (with Tasks 10, 12, 13, 14)
  - **Blocks**: None
  - **Blocked By**: Tasks 5, 6, 7, 8

  **References**:

  **Pattern References**:
  - `src/components/public/ContactForm.tsx` — Public form pattern: controlled inputs, useState, handleChange via e.target.name, fetch POST, error/success states, loading state. Follow this pattern for state management.
  - `src/app/(public)/[locale]/layout.tsx` — Public layout wrapper. Registration page will be wrapped by this automatically.

  **API/Type References**:
  - `POST /api/registration/submit` — Submit form data (from Task 6)
  - `POST /api/razorpay/create-order` — Create order (from Task 7)
  - `POST /api/razorpay/verify` — Verify payment (from Task 8)
  - `GET /api/registration/settings` — Public settings (created in this task)

  **External References**:
  - Razorpay checkout.js: Load via `<Script src="https://checkout.razorpay.com/v1/checkout.js" />` from `next/script`
  - Razorpay checkout: `new window.Razorpay({ key, amount, currency, name, description, order_id, prefill, handler, modal: { ondismiss } }).open()`

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Registration form renders with step wizard
    Tool: Playwright
    Preconditions: At least one class registration enabled via admin settings
    Steps:
      1. Navigate to http://localhost:3000/en/registration
      2. Assert step indicator shows "Step 1 of 4" or similar
      3. Assert personal info fields visible: studentName, fatherName, motherName, dob, gender, category
      4. Fill all Step 1 fields with valid data
      5. Click "Next" — assert Step 2 appears
      6. Assert class selection visible — only enabled classes shown
      7. Screenshot each step
    Expected Result: Multi-step form renders correctly, navigation works
    Evidence: .sisyphus/evidence/task-11-form-wizard.png

  Scenario: Stream field conditional on 12th class
    Tool: Playwright
    Steps:
      1. Navigate to registration page, proceed to Step 2
      2. Select "10th" class — assert stream dropdown is NOT visible
      3. Select "12th" class — assert stream dropdown IS visible with 4 options
    Expected Result: Stream field appears/disappears based on class
    Evidence: .sisyphus/evidence/task-11-stream-conditional.png

  Scenario: Registration closed message when disabled
    Tool: Playwright
    Preconditions: Both classes disabled in settings
    Steps:
      1. Navigate to http://localhost:3000/en/registration
      2. Assert "Registration is currently closed" message visible
      3. Assert form is NOT rendered
    Expected Result: Closed message shown, no form
    Evidence: .sisyphus/evidence/task-11-closed-message.png

  Scenario: Client validation prevents proceeding with empty required fields
    Tool: Playwright
    Steps:
      1. Navigate to registration page
      2. Leave all fields empty, click "Next"
      3. Assert validation error messages appear for required fields
      4. Assert user stays on Step 1
    Expected Result: Validation errors shown, navigation blocked
    Evidence: .sisyphus/evidence/task-11-validation.png
  ```

  **Commit**: YES (group 9)
  - Message: `feat: add public registration form with multi-step wizard and Razorpay payment`
  - Files: `src/app/(public)/[locale]/registration/page.tsx`, `src/components/public/RegistrationForm.tsx`, `src/app/api/registration/settings/route.ts`

- [ ] 12. Admin Registrations List Page + Stats Dashboard

  **What to do**:
  - Create `src/app/api/admin/registrations/route.ts`:
    - `GET` handler with query params: `class` (10th/12th/all), `paymentStatus` (pending/paid/failed/all), `search` (name/phone/registration number), `page` (pagination), `limit` (default 20)
    - `connectDB()` → build MongoDB filter from params → `RegistrationModel.find(filter).sort({ createdAt: -1 }).skip().limit()` + `countDocuments(filter)` for total
    - Return `{ ok: true, registrations: [...], total, page, limit }`
  - Create `src/app/api/admin/registrations/stats/route.ts`:
    - `GET` handler: aggregation pipeline:
      - Total registrations
      - Count by paymentStatus (pending/paid/failed)
      - Count by class (10th/12th)
      - Total revenue (sum of amountPaid where paymentStatus='paid')
    - Return `{ ok: true, stats: { total, paid, pending, failed, revenue, byClass: { "10th": { total, paid, pending }, "12th": { ... } } } }`
  - Create `src/app/(admin)/admin/(cms)/registrations/page.tsx`:
    - `"use client"` component
    - Top section: Stats cards (Total, Paid, Pending, Revenue) using existing `.admin-stat` / `.admin-section-card` CSS classes
    - Filter bar: Class dropdown, Payment Status dropdown, Search input, Export CSV button
    - Table: Name, Class, Phone, Payment Status (badge), Amount, Date, Registration #, Actions (View detail link)
    - Use existing CSS classes: `.admin-page-stack`, `.admin-panel`, `.admin-section-grid` for stats, table with `.admin-table` or custom flex layout
    - Pagination controls at bottom
    - Payment status badges: green for paid, amber for pending, red for failed

  **Must NOT do**:
  - Do NOT add charts/graphs — stat cards with numbers only
  - Do NOT add inline editing — view only in list, detail in separate page
  - Do NOT create new CSS files — use existing admin.css classes

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Data table with filters, stats cards, badges — needs polished admin UI
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 13, 14)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/app/(admin)/admin/(cms)/contact-submissions/page.tsx` — Admin list page pattern. Follow the data fetching, list rendering, and badge patterns.
  - `src/app/(admin)/admin/(cms)/page.tsx` — Dashboard stats card pattern with `.admin-stat-icon` divs and stat values.

  **API/Type References**:
  - `src/lib/models/index.ts` — `RegistrationModel`
  - `src/lib/db.ts` — `connectDB()`

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Registration list renders with stats
    Tool: Playwright
    Preconditions: Admin logged in, at least 2 registrations in DB (1 paid, 1 pending)
    Steps:
      1. Navigate to http://localhost:3000/admin/registrations
      2. Assert stats cards visible: Total, Paid, Pending, Revenue
      3. Assert table has rows with registration data
      4. Assert payment status badges are color-coded
      5. Screenshot the page
    Expected Result: Stats and table render correctly
    Evidence: .sisyphus/evidence/task-12-list-page.png

  Scenario: Filters work correctly
    Tool: Playwright
    Steps:
      1. Select class filter "10th" — assert only 10th class registrations shown
      2. Select payment status "paid" — assert only paid registrations shown
      3. Type search query (phone number) — assert matching results
    Expected Result: Filters narrow results correctly
    Evidence: .sisyphus/evidence/task-12-filters.png

  Scenario: Stats API returns correct aggregation
    Tool: Bash (curl)
    Steps:
      1. curl http://localhost:3000/api/admin/registrations/stats -H "Cookie: admin-token=<token>"
      2. Assert response has total, paid, pending, failed, revenue, byClass fields
      3. Assert revenue is sum of amountPaid for paid registrations
    Expected Result: Accurate aggregate statistics
    Evidence: .sisyphus/evidence/task-12-stats-api.txt
  ```

  **Commit**: YES (group 10)
  - Message: `feat(admin): add registrations list page with filters and stats dashboard`
  - Files: `src/app/(admin)/admin/(cms)/registrations/page.tsx`, `src/app/api/admin/registrations/route.ts`, `src/app/api/admin/registrations/stats/route.ts`

- [ ] 13. Admin Registration Detail Page

  **What to do**:
  - Create `src/app/api/admin/registrations/[id]/route.ts`:
    - `GET` handler: `connectDB()` → `RegistrationModel.findById(id)` → return full registration data
    - `DELETE` handler: Only allow deletion if `paymentStatus !== 'paid'` → if paid, return 403 "Cannot delete a paid registration". If pending/failed, `deleteOne({ _id: id })`.
  - Create `src/app/(admin)/admin/(cms)/registrations/[id]/page.tsx`:
    - `"use client"` component
    - Fetch full registration data on mount: `GET /api/admin/registrations/{id}`
    - Display all fields in organized sections:
      - **Personal Information**: name, father/mother name, DOB, gender, category
      - **Academic Information**: class, stream (if 12th), previous school, previous marks
      - **Contact Information**: phone, email, address, Aadhar
      - **Documents**: Photo thumbnail (clickable to view full), Marksheet link
      - **Payment Information**: Status badge, amount (in ₹), Razorpay order ID, payment ID, signature
      - **Registration Info**: Registration number, academic session, created date
    - Back button to registration list
    - Delete button (only shown for non-paid registrations) with confirmation dialog
    - Use existing CSS classes: `.admin-page-stack`, `.admin-panel`, `.admin-form-card` (read-only display)

  **Must NOT do**:
  - Do NOT allow editing registration data from admin
  - Do NOT allow deleting paid registrations
  - Do NOT show Razorpay signature in full — truncate or mask

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Detail view with organized sections, document previews, conditional delete
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12, 14)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/app/(admin)/admin/(cms)/contact-submissions/page.tsx` — Detail view pattern (if it has item detail view)
  - `src/app/(admin)/admin/(cms)/sections/hero/page.tsx` — Admin page layout pattern

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Detail page shows all registration data
    Tool: Playwright
    Preconditions: A registration exists in DB
    Steps:
      1. Navigate to http://localhost:3000/admin/registrations/<id>
      2. Assert all sections visible: Personal, Academic, Contact, Documents, Payment, Registration
      3. Assert student name matches expected value
      4. Assert payment status badge is visible
      5. Screenshot the page
    Expected Result: Complete registration detail rendered
    Evidence: .sisyphus/evidence/task-13-detail-page.png

  Scenario: Delete blocked for paid registration
    Tool: Playwright
    Preconditions: A paid registration exists
    Steps:
      1. Navigate to detail page for paid registration
      2. Assert delete button is NOT visible or is disabled
    Expected Result: No delete option for paid registrations
    Evidence: .sisyphus/evidence/task-13-no-delete-paid.png

  Scenario: Delete works for pending registration
    Tool: Playwright
    Preconditions: A pending registration exists
    Steps:
      1. Navigate to detail page for pending registration
      2. Click delete button
      3. Confirm in dialog
      4. Assert redirect to list page
      5. Verify registration no longer in list
    Expected Result: Pending registration deleted successfully
    Evidence: .sisyphus/evidence/task-13-delete-pending.png
  ```

  **Commit**: YES (group 10)
  - Message: `feat(admin): add registration detail page with delete for unpaid`
  - Files: `src/app/(admin)/admin/(cms)/registrations/[id]/page.tsx`, `src/app/api/admin/registrations/[id]/route.ts`

- [ ] 14. Admin CSV Export

  **What to do**:
  - Create `src/app/api/admin/registrations/export/route.ts`:
    - `GET` handler with same filter query params as list API (class, paymentStatus, search)
    - `connectDB()` → fetch ALL matching registrations (no pagination for export)
    - Build CSV string with headers: Registration Number, Student Name, Father Name, Mother Name, Phone, Email, DOB, Gender, Class, Stream, Previous School, Previous Marks, Address, Aadhar Number, Category, Payment Status, Amount (₹), Razorpay Payment ID, Academic Session, Registration Date
    - Amount: convert from paise to rupees for display
    - Set response headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename=registrations-{date}.csv`
    - Return CSV as response body
  - Add "Export CSV" button to the registrations list page (Task 12):
    - Button in filter bar area
    - On click: `window.location.href = '/api/admin/registrations/export?class={filter}&paymentStatus={filter}'` (triggers download)

  **Must NOT do**:
  - Do NOT install xlsx or any Excel library — plain CSV only
  - Do NOT include photo/marksheet URLs in CSV (not useful)
  - Do NOT paginate export — fetch all matching

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single API route generating CSV string + button addition
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12, 13)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/app/api/admin/registrations/route.ts` — (from Task 12) Same filter logic, reuse query building

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: CSV export downloads with correct data
    Tool: Bash (curl)
    Preconditions: At least 2 registrations in DB
    Steps:
      1. curl -s http://localhost:3000/api/admin/registrations/export -H "Cookie: admin-token=<token>" -o export.csv
      2. Assert file is valid CSV (check Content-Type header)
      3. Assert first line contains expected headers (Registration Number, Student Name, etc.)
      4. Assert data rows present with correct field count
      5. Assert amount is in rupees (not paise)
    Expected Result: Valid CSV with all fields, correct formatting
    Evidence: .sisyphus/evidence/task-14-csv-export.txt

  Scenario: Filtered export only includes matching records
    Tool: Bash (curl)
    Steps:
      1. curl with ?class=10th — assert only 10th class records in CSV
      2. curl with ?paymentStatus=paid — assert only paid records
    Expected Result: Filters applied to export
    Evidence: .sisyphus/evidence/task-14-filtered-export.txt
  ```

  **Commit**: YES (group 10)
  - Message: `feat(admin): add CSV export for registrations`
  - Files: `src/app/api/admin/registrations/export/route.ts`

- [ ] 15. Admin Sidebar Navigation Update

  **What to do**:
  - Edit `src/components/admin/admin-nav.ts`:
    - Add a new nav group "Registration" (after Content Sections group) with `defaultOpen: true`:
      - Item: "Registration Settings" → `/admin/registration-settings`, icon: `fa-solid fa-gear`, `implemented: true`
      - Item: "All Registrations" → `/admin/registrations`, icon: `fa-solid fa-list-check`, `implemented: true`
    - OR add as standalone items below Contact Submissions (whichever matches the current nav structure better)
  - Update `AdminTopbar.tsx` route matching to include new routes:
    - `/admin/registration-settings` → title: "Registration Settings", breadcrumbs: Dashboard > Registration Settings
    - `/admin/registrations` → title: "All Registrations", breadcrumbs: Dashboard > Registrations
    - `/admin/registrations/[id]` → title: "Registration Detail", breadcrumbs: Dashboard > Registrations > Detail
  - Update `AdminSidebar.tsx` if needed to render the new group

  **Must NOT do**:
  - Do NOT modify existing nav items
  - Do NOT change existing route patterns
  - Do NOT add icons not already available via Font Awesome CDN

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file edits + minor component updates
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 16, 17)
  - **Blocks**: None
  - **Blocked By**: None (nav config is independent of page implementation)

  **References**:

  **Pattern References**:
  - `src/components/admin/admin-nav.ts` — Current nav structure: `dashboardNavItem`, `adminNavGroups` array with "Content Sections" group, `contactSubmissionsNavItem`. Follow the `AdminNavGroup` and `AdminNavItem` types.
  - `src/components/admin/AdminSidebar.tsx` — Renders groups from `adminNavGroups`, standalone items for dashboard and submissions. May need to render new group.
  - `src/components/admin/AdminTopbar.tsx` — `getPageInfo()` function with route pattern matching. Add new routes.

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Sidebar shows registration nav items
    Tool: Playwright
    Preconditions: Admin logged in
    Steps:
      1. Navigate to http://localhost:3000/admin
      2. Assert sidebar contains "Registration" section or items
      3. Assert "Registration Settings" link points to /admin/registration-settings
      4. Assert "All Registrations" link points to /admin/registrations
      5. Screenshot sidebar
    Expected Result: Registration nav items visible and correctly linked
    Evidence: .sisyphus/evidence/task-15-sidebar-nav.png

  Scenario: Topbar shows correct breadcrumbs for registration pages
    Tool: Playwright
    Steps:
      1. Navigate to /admin/registration-settings — assert breadcrumb shows "Registration Settings"
      2. Navigate to /admin/registrations — assert breadcrumb shows "Registrations"
    Expected Result: Dynamic titles and breadcrumbs for registration routes
    Evidence: .sisyphus/evidence/task-15-topbar-breadcrumbs.png
  ```

  **Commit**: YES (group 11)
  - Message: `feat(nav): add registration items to admin sidebar and topbar`
  - Files: `src/components/admin/admin-nav.ts`, `src/components/admin/AdminTopbar.tsx`, `src/components/admin/AdminSidebar.tsx` (if modified)

- [ ] 16. i18n Keys for Registration Pages

  **What to do**:
  - Edit `messages/en.json` — add `"registration"` section with keys for:
    - Page title: "Student Registration"
    - Step labels: "Personal Information", "Academic Information", "Contact & Identity", "Documents & Review"
    - Field labels: all 15+ form field labels in English
    - Button labels: "Next", "Previous", "Submit & Pay", "Retry Payment"
    - Status messages: "Registration is currently closed", "Registration successful", "Payment pending", etc.
    - Validation messages: "This field is required", "Invalid phone number", "Invalid Aadhar number", etc.
  - Edit `messages/hi.json` — add same `"registration"` section with Hindi translations:
    - Page title: "छात्र पंजीकरण"
    - Step labels, field labels, buttons, status messages, validation messages — all in Hindi
  - Ensure the registration form component uses these i18n keys via `useTranslations('registration')` from next-intl

  **Must NOT do**:
  - Do NOT modify existing i18n keys
  - Do NOT use machine-translated Hindi — use proper school/educational Hindi terminology
  - Do NOT add keys for admin pages (admin is English-only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: JSON file edits, translation key additions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 15, 17)
  - **Blocks**: Task 11 (form needs i18n keys)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `messages/en.json` — Existing i18n key structure. Follow same nesting pattern.
  - `messages/hi.json` — Hindi translation file. Must mirror en.json structure exactly.

  **External References**:
  - next-intl usage: `useTranslations('registration')` hook in client components, `getTranslations('registration')` in server components

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: i18n keys present in both language files
    Tool: Bash (grep)
    Steps:
      1. Grep messages/en.json for "registration" — must have registration section
      2. Grep messages/hi.json for "registration" — must have registration section
      3. Verify key count matches between en.json and hi.json registration sections
      4. Grep hi.json for "छात्र पंजीकरण" — Hindi title must exist
    Expected Result: Both files have matching registration key structure
    Evidence: .sisyphus/evidence/task-16-i18n-keys.txt

  Scenario: Hindi page renders with Hindi labels
    Tool: Playwright
    Preconditions: Registration enabled
    Steps:
      1. Navigate to http://localhost:3000/hi/registration
      2. Assert page title contains Hindi text (छात्र पंजीकरण)
      3. Assert form labels are in Hindi
      4. Screenshot
    Expected Result: Full Hindi rendering
    Evidence: .sisyphus/evidence/task-16-hindi-page.png
  ```

  **Commit**: YES (group 11)
  - Message: `feat(i18n): add registration page translations for English and Hindi`
  - Files: `messages/en.json`, `messages/hi.json`

- [ ] 17. Final Build Verification + Integration Test

  **What to do**:
  - Run `npx next build` — must pass with zero errors
  - Run `lsp_diagnostics` on ALL new files (scan `src/lib/models/registration.ts`, `src/lib/models/registrationSettings.ts`, `src/lib/razorpay.ts`, `src/lib/email.ts`, all new API routes, all new pages)
  - Verify all new routes appear in build output
  - Verify existing functionality not broken: check that existing admin pages still load, existing API routes still respond
  - Integration smoke test:
    1. Admin login → navigate to registration settings → enable 10th class → set fee → save
    2. Visit /en/registration → verify form appears
    3. Verify /admin/registrations page loads (may be empty)
    4. Verify sidebar shows new nav items
    5. Verify breadcrumbs work on new pages

  **Must NOT do**:
  - Do NOT modify any code — this is verification only
  - Do NOT skip lsp_diagnostics on any new file

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Comprehensive verification across many files and routes
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO — Sequential (depends on all previous tasks)
  - **Parallel Group**: Wave 4 (after Tasks 15, 16)
  - **Blocks**: F1-F4
  - **Blocked By**: ALL previous tasks

  **References**:

  **Pattern References**:
  - All files from Tasks 1-16

  **Acceptance Criteria**:

  **QA Scenarios:**

  ```
  Scenario: Build passes clean
    Tool: Bash
    Steps:
      1. Run npx next build
      2. Assert exit code 0
      3. Assert all new routes in build output: /en/registration, /admin/registration-settings, /admin/registrations, /admin/registrations/[id]
      4. Assert all API routes present: /api/registration/*, /api/razorpay/*, /api/admin/registrations/*, /api/admin/registration-settings
    Expected Result: Clean build with all routes
    Evidence: .sisyphus/evidence/task-17-build.txt

  Scenario: End-to-end smoke test
    Tool: Playwright
    Steps:
      1. Login as admin at /admin/login
      2. Navigate to /admin/registration-settings — page loads
      3. Navigate to /admin/registrations — page loads
      4. Navigate to /en/registration — page loads (may show closed if not configured)
      5. Verify sidebar has registration nav items
      6. Screenshot each page
    Expected Result: All pages load without errors
    Evidence: .sisyphus/evidence/task-17-smoke-test.png

  Scenario: Existing functionality preserved
    Tool: Playwright
    Steps:
      1. Navigate to /admin — dashboard loads with stats
      2. Navigate to /admin/sections/hero — hero editor loads
      3. Navigate to /admin/contact-submissions — submissions page loads
    Expected Result: No regression in existing features
    Evidence: .sisyphus/evidence/task-17-no-regression.png
  ```

  **Commit**: NO (verification only)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `unspecified-high`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx next build`. Review all new files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify all Razorpay secrets are server-side only. Verify `crypto.timingSafeEqual` used for signature comparisons.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | Security [PASS/FAIL] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Test full flow: admin enables registration → configure fees/dates → student fills form → payment → verify confirmation page → verify admin list → verify stats → test CSV export. Test edge cases: disabled class, expired window, duplicate Aadhar, missing required fields.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `unspecified-high`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| # | Message | Files | Verification |
|---|---------|-------|-------------|
| 1 | `feat(models): add Registration and RegistrationSettings models` | models/registration.ts, models/registrationSettings.ts, models/index.ts | lsp_diagnostics |
| 2 | `feat(lib): add Razorpay and email utility modules` | lib/razorpay.ts, lib/email.ts | lsp_diagnostics |
| 3 | `chore: update .env.local.example with payment and email vars` | .env.local.example | file content check |
| 4 | `feat(api): add registration settings admin API` | api/admin/registration-settings/route.ts | curl test |
| 5 | `feat(api): add registration submission and file upload API` | api/registration/submit/route.ts | curl test |
| 6 | `feat(api): add Razorpay order, verify, and webhook APIs` | api/razorpay/*/route.ts | curl test |
| 7 | `feat(api): add email notification post-payment` | Updated verify/webhook routes | curl + SMTP check |
| 8 | `feat(admin): add registration settings page` | admin/(cms)/registration-settings/page.tsx | Playwright screenshot |
| 9 | `feat: add public registration form with multi-step wizard` | [locale]/registration/page.tsx, RegistrationForm.tsx | Playwright screenshot |
| 10 | `feat(admin): add registrations list, detail, stats, and CSV export` | admin/(cms)/registrations/*, api/admin/registrations/* | curl + Playwright |
| 11 | `feat(nav): add registration items to admin sidebar + i18n keys` | admin-nav.ts, messages/en.json, messages/hi.json | Build passes |

---

## Success Criteria

### Verification Commands
```bash
npx next build                    # Expected: Build succeeds, all routes present
curl localhost:3000/en/registration  # Expected: 200, form HTML rendered
curl localhost:3000/api/registration/settings  # Expected: 200, JSON with enabled/fee/dates
curl -X PUT localhost:3000/api/admin/registration-settings -H "Cookie: admin-token=<token>" -d '{"class10Enabled":true}'  # Expected: 200
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Build passes clean
- [ ] Registration form works end-to-end (form → payment → confirmation)
- [ ] Admin can configure settings
- [ ] Admin can view/filter/export registrations
- [ ] Emails sent on successful payment
- [ ] Duplicate Aadhar prevented
- [ ] Stream field conditional on class selection
