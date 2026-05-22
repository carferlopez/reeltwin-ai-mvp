# ReelTwin.ai MVP

MVP transaccional para vender clips cinematograficos de gemelo digital sin cuentas previas.

## Flujo

1. Landing directa con demo visual y dos packs.
2. Pago por Stripe Payment Links.
3. Stripe redirige a `/intake?session_id={CHECKOUT_SESSION_ID}`.
4. El usuario sube video base y guion.
5. Produccion manual asistida por IA y entrega por email en menos de 24h.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura las variables de Stripe y Supabase en `.env.local`.

## Supabase

Ejecuta `supabase/schema.sql` en el SQL editor del proyecto. Las tablas `orders`
e `intakes` tienen RLS activado y politicas cerradas para acceso publico. La app
usa `SUPABASE_SERVICE_ROLE_KEY` solo en rutas server-side.

## Stripe

Los Payment Links deben incluir metadata `package_id` con `monologo` o
`showcase`. El webhook debe apuntar a:

```text
https://tu-dominio.com/api/stripe/webhook
```

El endpoint valida `STRIPE_WEBHOOK_SECRET` antes de escribir pedidos.

## Purga de videos

Programa un cron diario en Vercel para:

```bash
npm run purge:training-videos
```

El script borra videos de entrenamiento con `purge_after <= now()`.
