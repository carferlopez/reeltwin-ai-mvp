-- ─────────────────────────────────────────────
-- subscriptions
-- One row per active Stripe subscription.
-- Populated by the stripe/webhook handler.
-- ─────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  stripe_subscription_id text unique,
  customer_email        text not null,
  tier                  text not null check (tier in ('free', 'pro', 'studio')),
  status                text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  quota_total           int  not null,
  current_period_start  timestamptz not null,
  current_period_end    timestamptz not null,
  created_at            timestamptz not null default now()
);

create index if not exists subscriptions_email_status_idx
  on public.subscriptions (customer_email, status);

-- ─────────────────────────────────────────────
-- generations
-- One row per generation attempt (reserved on
-- quota check, updated to completed/failed).
-- ─────────────────────────────────────────────
create table if not exists public.generations (
  id               uuid primary key default gen_random_uuid(),
  subscription_id  uuid not null references public.subscriptions (id),
  period_start     timestamptz not null,
  status           text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  source_url       text,
  style_key        text,
  output_urls      jsonb,
  model_used       text,
  cost_usd         numeric(10, 4),
  duration_ms      int,
  error_message    text,
  created_at       timestamptz not null default now()
);

create index if not exists generations_subscription_period_idx
  on public.generations (subscription_id, period_start);

-- ─────────────────────────────────────────────
-- RLS — all reads/writes via service role only
-- ─────────────────────────────────────────────
alter table public.subscriptions enable row level security;
alter table public.generations   enable row level security;

-- No public policies: server-side service_role_key bypasses RLS automatically.
