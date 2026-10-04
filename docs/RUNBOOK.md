# Alaba Dorf — Operations Runbook

How to run the system on the outlet's own machine. No cloud subscriptions:
PostgreSQL, the app and files all live here or on R2.

## Daily startup (after a reboot)

PostgreSQL does not auto-start. In PowerShell:

```powershell
& "$env:LOCALAPPDATA\alaba-tools\pgsql\bin\pg_ctl.exe" -D "$env:LOCALAPPDATA\alaba-tools\pgdata" -l "$env:LOCALAPPDATA\alaba-tools\pg.log" -o "-p 5432 -c listen_addresses=127.0.0.1" start
```

Then start the app (development):

```powershell
cd "Alaba Dorf Project\web"
npm run dev -- -p 3000
```

Open http://localhost:3000. For a public link on the same machine:

```powershell
& "$env:LOCALAPPDATA\alaba-tools\cloudflared.exe" tunnel --url http://localhost:3000 --no-autoupdate
```

## First admin account

With zero admins in the database, create the first Top Admin once:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/bootstrap" -Method Post `
  -Body (@{ name="Owner"; email="owner@example.com"; password="change-me-now-123" } | ConvertTo-Json) `
  -ContentType "application/json"
```

Sign in at `/admin/login`, then create the second Top Admin plus department
admins at `/admin/users`. The bootstrap endpoint refuses once an admin exists.

## Paystack (test, then live)

1. Put test keys in `web/.env`: `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`.
2. Restart the dev server so it picks them up.
3. Place a test order, open tracking, press **Pay Online Now**.
4. For webhooks in test: forward `https://<your-tunnel>/api/pay/webhook`
   in the Paystack dashboard and send a test `charge.success` event.
5. Go live by swapping in live keys. Never commit `.env`.

Without keys, orders still record and track normally; staff confirm payment
manually from `/admin/orders` (Confirm + Paid).

## Email (Resend)

Set `RESEND_API_KEY` + `EMAIL_FROM` (a verified domain) in `web/.env`.
Customers who enter an email at checkout get order, booking and payment
confirmations. Without keys, everything else works — email is skipped.

## Files (Cloudflare R2)

1. Create an R2 bucket, e.g. `alaba-dorf`, plus a custom public domain.
2. Create an API token with Object Read & Write on that bucket.
3. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
   `R2_BUCKET`, `R2_PUBLIC_URL` in `web/.env`.
4. Menu and animal photos upload from the admin pages.

Without keys, uploads show "File storage is not configured yet."

## Backup

- Database (dev box): stop Postgres, copy `%LOCALAPPDATA%\alaba-tools\pgdata`
  to an external drive, start Postgres again.
- Database (production docker): `docker compose exec postgres pg_dump -U alaba alaba > backup.sql`
- Uploaded files live on R2 (versioned by the provider).

## Common fixes

| Symptom | Fix |
|---|---|
| `Can't reach database server` | Start Postgres (see above) |
| Port 3000 busy | `npm run dev -- -p 3001` |
| `File storage is not configured` | Add R2 keys, restart dev |
| Pay button says "not set up" | Add Paystack keys, restart dev |
| Admin page bounces to login | Sign in with an admin account |
