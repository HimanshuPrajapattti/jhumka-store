# AVRANI — Jhumka Store

An aesthetic, WhatsApp-first online store for a handcrafted jhumka jewellery
business — built with **Next.js 16 (App Router + Cache Components)**,
**Tailwind CSS 4**, with InsForge PostgreSQL/Storage for live products, new
orders, website appearance settings and uploaded images.

## How ordering works

1. Customer browses the shop and fills a bag (persisted in `localStorage`).
2. Checkout collects name, WhatsApp number, address and an optional note.
3. The server prices the order **from InsForge**, stores it
   (`orders` + `order_items`), decrements stock atomically and returns a formatted
   WhatsApp message.
4. The browser opens WhatsApp to **+91 92568 63315** with the order already
   typed out:

   ```
   🛍️ New Order — AVRANI
   Ref: AVR-1A2B3C4D

   Items:
   1. Royal Meenakari Jhumka
      ₹1,899 × 1 = ₹1,899

   Total: ₹1,899

   Customer:
   Name: Priya Sharma
   Phone: 919876543210
   Address: …
   ```

5. The same order **always** appears in the admin panel, even if the customer
   never presses send.

## Admin panel

- URL: `/admin` (login at `/admin/login`)
- Credentials live in `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **Dashboard** — revenue, orders, pending count, 14-day sales chart, top
  pieces, recent orders
- **Products** — create/edit/delete, photo uploads, price, category, stock,
  homepage feature flag
- **Website appearance** — homepage hero photo, homepage background image,
  storefront-wide background image and background color
- **Orders** — filter by status (pending → packed → shipped → delivered,
  plus cancelled), customer details, the exact WhatsApp message, copy button
  and a one-tap *Reply to customer* WhatsApp link

Every admin mutation invalidates the cached storefront instantly
(`updateTag("products")`), so edits go live on the next view.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 (storefront) and http://localhost:3000/admin.

Set `INSFORGE_URL` and `INSFORGE_API_KEY` in `.env.local` before running the
store. The admin key is server-only and must never be exposed to the browser.
The InsForge project needs the migrations in `migrations/` applied and a public
`avrani-media` Storage bucket. The local SQLite database is retained only as
the source for the one-time product migration and the legacy order smoke test.

To migrate the local product catalogue and local product images (but **not**
orders or customer details), run:

```bash
npx tsx scripts/migrate-products-to-insforge.mts
```

The script reads only SQLite `products` and uploads files from
`public/uploads/` (or `AVRANI_UPLOADS_DIR`). Generated artwork in
`public/products/` stays served from the app.

## Configuration

| Variable | Purpose |
| --- | --- |
| `WHATSAPP_NUMBER` | Business number orders are sent to (defaults to 919256863315) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login |
| `SESSION_SECRET` | Signs the admin session cookie — use a long random string |
| `INSFORGE_URL` | InsForge project URL |
| `INSFORGE_API_KEY` | Server-side InsForge admin API key; never use a `NEXT_PUBLIC_` prefix |
| `AVRANI_DB_PATH` | Optional SQLite source path for the one-time product migration |
| `AVRANI_UPLOADS_DIR` | Optional local upload directory for the one-time product migration |

### Render deployment

In Render → your service → **Environment**, add `INSFORGE_URL` and
`INSFORGE_API_KEY` using the values from the InsForge project. Do not paste the
admin key into chat or add it to GitHub. Products, new orders, appearance
settings and uploaded images are stored outside Render's temporary filesystem.
Existing local orders are intentionally not migrated.

## Project structure

```
src/
  actions/        server actions (checkout, auth, product CRUD, order status)
  components/     cart provider/drawer, site chrome, product cards, admin UI
  lib/            InsForge data layer, auth, whatsapp
  app/
    (site)/       storefront: home, shop, product, checkout, thanks, about, contact
    admin/        login + protected dashboard, products, orders
  proxy.ts        optimistic auth gate: /admin → 307 to login before rendering
public/products/  generated placeholder artwork
scripts/          artwork generator, smoke + e2e tests, session minting
```

## Testing

```bash
npm run lint                 # ESLint (Next 16 removed `next lint`)
npx tsc --noEmit             # type check
npx tsx scripts/smoke-orders.mts   # domain logic: orders, stock, validation,
                                  # phone normalisation, credentials,
                                  # session tokens, WhatsApp link
node scripts/e2e-http.mjs          # full wire test against a running
                                   # `npm start` (login action → cookie →
                                   # admin pages → placeOrder → cleanup)
npx tsx scripts/mint-session.mts   # print a valid admin session cookie for
                                   # manual curl testing
```

## Notes

- Seed artwork is generated: `node scripts/generate-placeholders.mjs`
- Stock decrements at checkout; cancelled orders don't restock automatically —
  adjust stock from the product editor if needed.
- Auth: `src/proxy.ts` redirects unauthenticated `/admin` requests with a real
  307 before rendering; `AdminGuard` re-verifies the HMAC session cookie
  behind `<Suspense>` (and every server action re-checks it again).
