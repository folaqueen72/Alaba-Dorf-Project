# Implementation Plan — Alaba Dorf Outlet Management & Ordering System

## Current State

- `PRODUCT REQUIREMENTS DOCUMENT (PRD).md` — V1.0 MVP spec, source of truth.
- `Alaba Dorf Project/` — git repo synced to `origin/main`, contains `README.md`, `.gitignore`.
- No application code yet.

## 0. Architectural Decisions (decide first, before code)

### Decided stack (self-hosted, no subscriptions)

- **App:** Next.js (App Router) + TypeScript — one codebase for customer site + admin dashboard
- **UI:** Tailwind CSS + shadcn/ui
- **DB:** PostgreSQL 16 self-hosted on your local device (Docker Compose + volume persistence) + Prisma ORM. No Supabase. Postgres is required over SQLite because you need row-level locking (`SELECT ... FOR UPDATE`) and unique slot constraints for stock/slot concurrency.
- **Auth:** Better Auth (not NextAuth). Admins use email + password with roles. Customers get both paths: anonymous guest checkout (Better Auth anonymous plugin) with upgrade-to-account, plus optional login via email OTP (and phone OTP later).
- **Payments:** Paystack (Nigerian cards, bank transfer, USSD, webhooks). Flutterwave as fallback.
- **Files/storage:** Yes, needed — menu photos, animal images, session covers. Cloudflare R2 (S3-compatible, zero egress fees). Admin uploads via presigned URLs, public read through an R2 custom domain behind Cloudflare CDN.
- **Images:** R2 as origin + Next.js `<Image>` optimization (sharp) + client-side compression before upload. No Supabase Storage.
- **Email:** Resend (recommended over ZeptoMail for V1 — better Next.js/React Email DX, simple API + webhooks, 3k free/mo is enough for order/booking confirmations and password resets; revisit ZeptoMail later if volume makes cost an issue).
- **Hosting:** Local device via Docker Compose (app + postgres + Caddy reverse proxy) + Cloudflare Tunnel for public HTTPS without port-forwarding. No Vercel, no Supabase hosting.
- **Order numbers:** `ADO-{sequence}` e.g. `#ADO1042`, generated server-side via DB sequence

### Why

Single self-hosted deployable with no monthly platform lock-in, Postgres transactions solve
stock decrement and no double-booking, R2 removes storage egress cost, Resend keeps
transactional email simple, Cloudflare Tunnel gives you public HTTPS on a local box.

### Alternative (not recommended for V1)

React (Vite) + NestJS/Express API + PostgreSQL. More flexible, more ops overhead.

### Key rules to lock in

1. Separate department flows, no combined cart (PRD §25).
2. Stock/slot changes only in DB transactions, never client-side.
3. Payment truth = webhook, not redirect or screenshot (PRD §10).
4. Every state change writes to `activity_logs` (PRD §27).
5. Guest orders carry an anonymous Better Auth user id so they merge into the customer account on signup/login — never orphan orders.

## 1. Design System + UX (1-2 weeks)

- **Palette (flat, no gradients):** Deep lemon green `#6B9E0E` (primary) / dark `#4C7500` / tint `#EDF4D7`; White `#FFFFFF` + off-white `#FAFAF6`; Ash scale `#E4E6DD → #B4B8A6 → #6F7362 → #33362B`; Black `#141610`
- **Type:** Display `Fraunces` (organic serif, headings) + Body `Public Sans` (humanist sans) — avoids generic AI-looking geometric sans pairings
- **Rules:** solid fills only, 1px ash borders, 12px radius cards, status badges in lemon/ash/black
- Mobile-first breakpoints: 360px → 768px → 1024px+
- Core components: Button, Input, Card, Badge (order status), Quantity stepper,
  Slot picker, Cart row, Data table + filters, Alert/Toast, Modal/Sheet
- Customer flows to wireframe: Homepage → Farm/Eggs → Meat sharing →
  Eatery/Menu/Cart → Studio/Slots → Checkout (6 steps) → Tracking (`#ADO1042`)
- Admin flows: Login → Dashboard → Requires Attention → Orders list/detail →
  Inventory → Animal detail → Studio calendar → Menu editor → Reports → Users/permissions
- Accessibility: large tap targets, simple language, low-data images

Exit: clickable wireframes or Figma + component inventory.

## 2. Data Model + Core Backend (2-3 weeks)

Tables:

- Better Auth managed: `user, session, account, verification` (do not hand-roll; `user` covers both admins and customers)
- `admin_profiles (userId FK, role: top|farm|eatery|studio, active)` + `permissions (userId, resource, action)` — Top Admin manages (PRD §4)
- `customers (id, userId FK nullable, name, phone, email?, address?)` — `userId null` = pure guest; dedupe by phone; backfill `userId` on guest→account upgrade
- `egg_inventory (id, total_crates, reserved_crates, sold_crates, price_per_crate, status)`
- `animals (id, type: cow|pig, tag, total_kg, available_kg, price_per_kg, status)`
- `animal_reservations (id, animal_id, customer_id, kg, amount, payment_status)`
- `session_types (id, name, duration_min, price, cover_image_key?, active)`
- `studio_slots (id, date, start_time, end_time, status: available|booked|blocked, booking_id?)` — unique(date,start_time)
- `bookings (id, customer_id, session_type_id, slot_id, status)`
- `menu_items (id, name, price, image_key, available, description)` — `image_key` is the R2 object key, never a base64 blob in the DB
- `orders (id, order_no, dept: farm|eatery, customer_id, items_json, subtotal, delivery_fee, total, fulfillment: pickup|delivery, payment_status, order_status, delivery_info)`
- `payments (id, order_id|booking_id, provider, reference, amount, status, webhook_payload)`
- `activity_logs (id, actor_id, action, entity, before, after, created_at)`
- `egg_inventory (id, total_crates, reserved_crates, sold_crates, price_per_crate, status)`
- `animals (id, type: cow|pig, tag, total_kg, available_kg, price_per_kg, status)`
- `animal_reservations (id, animal_id, customer_id, kg, amount, payment_status)`
- `session_types (id, name, duration_min, price, active)`
- `studio_slots (id, date, start_time, end_time, status: available|booked|blocked, booking_id?)` — unique(date,start_time)
- `bookings (id, customer_id, session_type_id, slot_id, status)`
- `menu_items (id, name, price, image_url, available, description)`
- `orders (id, order_no, dept: farm|eatery, customer_id, items_json, subtotal, delivery_fee, total, fulfillment: pickup|delivery, payment_status, order_status, delivery_info)`
- `payments (id, order_id|booking_id, provider, reference, amount, status, webhook_payload)`
- `activity_logs (id, actor_id, action, entity, before, after, created_at)`

State machines:

- Order: `pending_payment → confirmed → preparing → ready → out_for_delivery → completed | cancelled`
- Booking: `pending_payment → confirmed → upcoming → completed | cancelled`
- Payment: `unpaid → processing → paid | failed | refunded`

Concurrency:

- Eggs/meat: `BEGIN; SELECT ... FOR UPDATE; check available >= requested; decrement; COMMIT`
- Studio: unique constraint on slot + transactional book-or-fail

Exit: migrations + seed + RBAC middleware working.

## 3. Customer Platform (3-4 weeks, build per department)

1. Homepage with 3 sections
2. Farm/Eggs: qty selector, live total, pickup/delivery, sold-out at 0
3. Cow/Pig sharing: animal card (total/avail/₦/kg), kg input, multi-customer reservation
4. Eatery: menu grid, cart, mandatory prepay, no pay-on-delivery
5. Studio: session list → date picker → slot grid → hold slot for 10 min pending payment
6. Checkout: review → details → pickup/delivery → total → Paystack → confirmation + order no.
7. Tracking page: lookup by order no. + phone, timeline view

Exit: end-to-end guest AND logged-in orders work in test mode, and guest history appears after signup.

## 4. Admin Platform (3-4 weeks, parallelizable after Phase 2)

1. Auth + role guard + permission matrix UI
2. Dashboard: today orders, sales, egg crates, meat kg, bookings, pending deliveries
3. **Requires Attention** engine: rules (paid-but-unprocessed >X min, ready-but-undelivered,
   failed payment, low stock <threshold, slot upcoming <24h, animal >90% reserved)
4. Orders: search (order no, name, phone, dept, date), filters (paid/unpaid, status), status transitions
5. Inventory: adjust stock/price, final weight adjustment flow for animals
6. Studio calendar: month/week view, block dates/slots
7. Menu/product CRUD with availability toggle
8. Customer profile: history, totals
9. Reports: sales/orders by date/dept/product/status, CSV export
10. Activity log viewer

Exit: staff can run a full day of operations on test data.

## 5. Payments, Storage, Email, Hardening (1-2 weeks)

- Paystack inline + webhook verification + idempotency keys
- R2: private bucket, presigned admin uploads, 5MB cap + MIME allowlist, public read via custom domain; store only keys in DB
- Resend: order confirmation, booking confirmation, payment receipt, admin password reset, low-stock/attention digests; verify domain + SPF/DKIM before launch
- Refund/cancel policy implementation (who can cancel, when stock is restored)
- Weight adjustment: if final < reserved, pro-rata refund/credit flow
- Delivery fee: V1 = flat configurable fee per dept + free-pickup
- Rate limiting, input validation, audit logging, NDPR basics (minimal data, retention note)

## 6. QA, UAT, Launch (1-2 weeks)

- Unit (pricing, stock math, slot conflict) + integration (checkout → webhook → status) +
  E2E (Playwright: 1 egg order, 1 meat reserve, 1 food order, 1 studio book)
- UAT with real staff on phones + low bandwidth
- Deploy to local device: `docker compose up -d` (nextjs standalone + postgres:16 + caddy),
  nightly `pg_dump` to R2, Cloudflare Tunnel for public HTTPS, UPS recommended;
  runbook (how to restart, refund, block slot, adjust stock, restore backup)
- Success metrics from PRD §31 wired into dashboard

## Build Order + Estimate

0 → 1 → 2 → 3 (Farm first, then Eatery, then Studio) → 4 → 5 → 6.
Total ~10-14 weeks solo, ~6-8 weeks with 2 devs.

## Not in V1

SMS/WhatsApp, loyalty, coupons, reviews, combined cart, mobile app, AI (PRD §30).
