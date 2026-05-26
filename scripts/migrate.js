#!/usr/bin/env node
/**
 * One-shot migration runner.
 * Usage:
 *   DATABASE_URL="postgresql://postgres:<password>@db.ijftcrjetqilsitmklxu.supabase.co:5432/postgres" \
 *   node scripts/migrate.js
 *
 * Get your password from:
 *   Supabase Dashboard → Settings → Database → Connection string (URI)
 */

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌  Set DATABASE_URL before running this script.');
  console.error('   Example:');
  console.error('   DATABASE_URL="postgresql://postgres:<password>@db.ijftcrjetqilsitmklxu.supabase.co:5432/postgres" node scripts/migrate.js');
  process.exit(1);
}

const SQL = `
-- subscriptions
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  stripe_subscription_id text unique,
  customer_email         text not null,
  tier                   text not null check (tier in ('free', 'pro', 'studio')),
  status                 text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  quota_total            int  not null,
  current_period_start   timestamptz not null,
  current_period_end     timestamptz not null,
  created_at             timestamptz not null default now()
);

create index if not exists subscriptions_email_status_idx
  on public.subscriptions (customer_email, status);

-- generations
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

-- RLS (service role bypasses automatically — no public policies needed)
alter table public.subscriptions enable row level security;
alter table public.generations   enable row level security;

-- Test subscription row for ferlop.carlos@gmail.com
insert into public.subscriptions
  (customer_email, tier, status, quota_total, current_period_start, current_period_end)
values
  ('ferlop.carlos@gmail.com', 'pro', 'active', 20, now(), now() + interval '30 days')
on conflict do nothing;
`;

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✓  Connected to database');
    await client.query(SQL);
    console.log('✓  Tables created: subscriptions, generations');
    console.log('✓  Test subscription inserted for ferlop.carlos@gmail.com');
    console.log('\nDone. You can now run the curl test.');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
