create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  package_id text not null,
  customer_email text not null,
  amount_total integer not null default 0,
  currency text not null default 'eur',
  payment_status text not null,
  status text not null default 'paid',
  paid_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  order_reference text,
  customer_email text not null,
  style text not null default 'nordic-noir',
  script text not null,
  training_video_bucket text not null default 'training-videos',
  training_video_path text,
  result_video_path text,
  status text not null default 'received',
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  purge_after timestamptz not null default (now() + interval '7 days')
);

alter table public.orders enable row level security;
alter table public.intakes enable row level security;

drop policy if exists "No public order access" on public.orders;
drop policy if exists "No public intake access" on public.intakes;

create policy "No public order access"
on public.orders
for all
using (false)
with check (false);

create policy "No public intake access"
on public.intakes
for all
using (false)
with check (false);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'training-videos',
  'training-videos',
  false,
  262144000,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
set public = false,
    file_size_limit = 262144000,
    allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/webm'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'raw-videos',
  'raw-videos',
  false,
  262144000,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
set public = false,
    file_size_limit = 262144000,
    allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/webm'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'completed-reels',
  'completed-reels',
  true,
  262144000,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
set public = true,
    file_size_limit = 262144000,
    allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/webm'];

create index if not exists orders_stripe_session_id_idx
on public.orders (stripe_session_id);

create index if not exists intakes_purge_after_idx
on public.intakes (purge_after)
where training_video_path is not null;
