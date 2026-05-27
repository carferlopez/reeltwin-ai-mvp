-- Migration to add liability_accepted_at to intakes table
ALTER TABLE public.intakes ADD COLUMN IF NOT EXISTS liability_accepted_at timestamptz not null default now();
