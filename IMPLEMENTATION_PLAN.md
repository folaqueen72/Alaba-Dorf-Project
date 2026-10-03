# Implementation Plan — Alaba Dorf Outlet Management & Ordering System

## Current State

- `PRODUCT REQUIREMENTS DOCUMENT (PRD).md` — V1.0 MVP spec, source of truth.
- `Alaba Dorf Project/` — git repo synced to `origin/main`, contains `README.md`, `.gitignore`.
- No application code yet.

## 0. Architectural Decisions (decide first, before code)

### Recommended stack (low-ops, low-cost, mobile-first)

- **App:** Next.js (App Router) + TypeScript — one codebase for customer site + admin dashboard
- **UI:** Tailwind CSS + shadcn/ui
- **DB:** PostgreSQL (Supabase or Neon) + Prisma ORM
- **Auth (admin only):** Email + password, server sessions, RBAC. Customers stay guest (name + phone + order no.)
- **Payments:** Paystack (Nigerian cards, bank transfer, USSD, webhooks). Flutterwave as fallback.
- **Images:** Supabase Storage
- **Hosting:** Vercel (app) + Supabase (db/storage)
- **Order numbers:** `ADO-{sequence}` e.g. `#ADO1042`, generated server-side via DB sequence

### Why

Single deployable, minimal DevOps for non-technical staff, good Paystack/Next.js docs,
Postgres transactions solve the two hardest requirements — stock decrement and no double-booking.

### Alternative (not recommended for V1)

React (Vite) + NestJS/Express API + PostgreSQL. More flexible, more ops overhead.

### Key rules to lock in

1. Separate department flows, no combined cart (PRD §25).
2. Stock/slot changes only in DB transactions, never client-side.
3. Payment truth = webhook, not redirect or screenshot (PRD §10).
4. Every state change writes to `activity_logs` (PRD §27).

## 1. Design System + UX (1-2 weeks)

- Mobile-first breakpoints: 360px → 768px → 1024px+
- Tokens: colors (primary farm-green, accent eatery-orange, neutrals), typography
  (1 display + 1 body, e.g. Inter), spacing, radius, shadows
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

- `admins (id, name, phone, email, password_hash, role: top|farm|eatery|studio, active)`
- `permissions (admin_id, resource, action)` — Top Admin manages (PRD §4)
- `customers (id, name, phone, email?, address?)` — dedupe by phone
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

Exit: end-to-end guest order works in test mode.

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

## 5. Payments, Edge Cases, Hardening (1-2 weeks)

- Paystack inline + webhook verification + idempotency keys
- Refund/cancel policy implementation (who can cancel, when stock is restored)
- Weight adjustment: if final < reserved, pro-rata refund/credit flow
- Delivery fee: V1 = flat configurable fee per dept + free-pickup
- Rate limiting, input validation, audit logging, NDPR basics (minimal data, retention note)

## 6. QA, UAT, Launch (1-2 weeks)

- Unit (pricing, stock math, slot conflict) + integration (checkout → webhook → status) +
  E2E (Playwright: 1 egg order, 1 meat reserve, 1 food order, 1 studio book)
- UAT with real staff on phones + low bandwidth
- Deploy: Vercel preview → production, Supabase backups on, env secrets,
  runbook (how to refund, block slot, adjust stock)
- Success metrics from PRD §31 wired into dashboard

## Build Order + Estimate

0 → 1 → 2 → 3 (Farm first, then Eatery, then Studio) → 4 → 5 → 6.
Total ~10-14 weeks solo, ~6-8 weeks with 2 devs.

## Not in V1

SMS/WhatsApp, loyalty, coupons, reviews, combined cart, mobile app, AI (PRD §30).
