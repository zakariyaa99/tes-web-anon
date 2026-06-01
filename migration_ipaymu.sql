-- Migration: Add iPaymu columns to orders table
-- Run this in Supabase SQL Editor before deploying iPaymu integration

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_gateway  text NOT NULL DEFAULT 'midtrans',
  ADD COLUMN IF NOT EXISTS ipaymu_trx_id    text,
  ADD COLUMN IF NOT EXISTS payment_method   text,
  ADD COLUMN IF NOT EXISTS payment_channel  text;

-- Index for fast webhook lookups by trx_id
CREATE INDEX IF NOT EXISTS orders_ipaymu_trx_id_idx
  ON public.orders (ipaymu_trx_id)
  WHERE ipaymu_trx_id IS NOT NULL;

-- Add 'paid' and 'expired' and 'failed' as valid statuses (if using enum; skip if text column)
-- If your status column is a text type, no action needed.
-- If it's an enum, run:
-- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';
-- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'expired';
-- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'failed';
