# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run purge:training-videos  # Cron script — purges expired training videos from Supabase Storage
```

No test suite exists. Manual QA via the sandbox mode (see below).

## Architecture Overview

**ReelTwin.ai** is a transactional MVP that sells AI-generated "digital twin" video clips without requiring user accounts. The full purchase-to-delivery flow is:

1. User pays via Stripe Payment Link → Stripe redirects to `/intake?session_id={CHECKOUT_SESSION_ID}`
2. `/intake` page validates the payment, then collects a base video + script via `ReelForm`
3. The video is uploaded to Supabase Storage via a server-side proxy (bypasses browser CORS)
4. `process-instant` API orchestrates Gemini Omni (or a simulation fallback) and stores the result in `completed-reels` bucket
5. The buyer receives a transactional notification email with a direct secure download link (expires in 30 days) via Resend


### Key API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/stripe/webhook` | POST | Receives Stripe `checkout.session.completed`, writes to `orders` table |
| `/api/process-reel` | GET | Validates `order_reference` (payment status + duplicate check), optionally issues signed upload URL |
| `/api/process-reel` | POST | Saves intake metadata, updates `orders.status` to `data_received` |
| `/api/process-reel` | PUT | Proxy upload endpoint — receives raw video bytes and writes to Supabase Storage (or local disk in mock mode) |
| `/api/process-instant` | POST | Runs Cinematic Franchise logic, calls Gemini Omni (or simulation), uploads result to `completed-reels`, returns `finalVideoUrl` |
| `/api/create-test-order` | GET | Dev helper — creates/resets a paid test order with ID `test-order-instant-magic` and redirects to `/intake` |

### Mock / Sandbox Mode

`lib/mockDb.ts` provides `isMockMode()` which returns `true` when `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are absent or contain placeholder values. Every API route checks this flag and falls back to a file-based JSON database at `scratch/mock_db.json`.

In mock mode:
- Video uploads are saved to `public/mock-storage/raw-videos/{sessionId}/video.mp4`
- "Completed" reels are copied from `public/mock-samples/{style}.mp4` to `public/mock-storage/completed-reels/{sessionId}/completed.mp4`
- To start a full test flow without Stripe, visit `http://localhost:3000/api/create-test-order`

### Cinematic Franchise

`config/styles.ts` defines the two available styles (`nordic-noir`, `indie-sundance`). Each style has a fixed name/description and an array of `dynamicBackgrounds` — one is picked randomly at render time. The final Gemini prompt is assembled in `process-instant/route.ts` from `styleConfig.name` + the random background + the user's script.

### Simulation vs Production in `process-instant`

The route has two render paths controlled by `IS_SIMULATION`:
- **Simulation** (`NEXT_PUBLIC_VIDEO_SIMULATION=true` or no `GEMINI_API_KEY`): reads a local stock video from `public/mock-samples/` and uploads it as the "result"
- **Production** (`REPLICATE_API_TOKEN` present): calls Replicate (Luma Dream Machine) with the assembled prompt

### Database Schema (Supabase)

Two tables, both with RLS enabled and **no public access policies** — all reads/writes use `SUPABASE_SERVICE_ROLE_KEY` server-side only.

- `orders` — one row per Stripe checkout session. Key columns: `stripe_session_id` (unique), `payment_status`, `status` (`paid` → `data_received` → `completed`)
- `intakes` — one row per submitted form. References `order_reference` (= Stripe session ID). Has `purge_after` (7-day TTL) for the `purge:training-videos` cron.

Three Storage buckets: `raw-videos` (private), `training-videos` (private), `completed-reels` (public).

Run `supabase/schema.sql` in the Supabase SQL editor to initialize all tables, buckets, and indexes.

### Design Tokens (Tailwind)

Custom colors defined in `tailwind.config.ts`:

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#08090b` | Page background (darkest) |
| `steel` | `#12161a` | Card/form backgrounds |
| `zinc` | `#20262c` | Borders, dividers |
| `signal` | `#d7ff54` | Primary CTA, accent |
| `mint` | `#53d7c2` | Secondary accent (mock/sandbox UI) |
| `danger` | `#ff6666` | Error states |

Custom font families: `font-sans`, `font-display` (serif, used for hero headlines), `font-mono`.

### Rate Limiting

`middleware.ts` applies an in-memory sliding-window rate limiter: 80 requests/minute per IP, applied to `/`, `/intake/*`, and `/api/*`. This resets on each server restart — it is not distributed.

## Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_STRIPE_MONOLOGO_LINK=   # Stripe Payment Link for "monologo" pack
NEXT_PUBLIC_STRIPE_SHOWCASE_LINK=   # Stripe Payment Link for "showcase" pack

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=          # Server-only; never expose to client

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional — presence/values determine render mode:
GEMINI_API_KEY=                     # If absent → simulation mode
REPLICATE_API_TOKEN=                # If present → production Luma Dream Machine render
NEXT_PUBLIC_VIDEO_SIMULATION=true   # Force simulation even when GEMINI_API_KEY is set

# Resend Email Configuration
RESEND_API_KEY=                     # Resend API Key for transactional email delivery
EMAIL_FROM=                         # Default: entregas@carlosmakes.com

```
