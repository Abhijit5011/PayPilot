-- ============================================================================
-- REFERENCE ONLY. Do NOT run this file.
-- The prompt for this project states these three tables already exist in
-- Supabase Postgres. This file documents the shape every workflow assumes,
-- so a judge or teammate can diff it against the real schema in seconds.
-- ============================================================================

-- policies: one row per wallet. This build assumes a single-row wallet
-- (hackathon scope); Workflow A/C/D always operate on the single existing row.
-- CREATE TABLE policies (
--   id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   daily_limit   numeric NOT NULL,
--   spent_today   numeric NOT NULL DEFAULT 0,
--   is_frozen     boolean NOT NULL DEFAULT false,
--   updated_at    timestamptz NOT NULL DEFAULT now()
-- );

-- allowlist: recipients the middleware is permitted to pay.
-- CREATE TABLE allowlist (
--   id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   address text NOT NULL,
--   name    text NOT NULL
-- );

-- transaction_logs: every approved/rejected payment AND every freeze/unfreeze
-- audit event (see decisions.md ADR-005 for why kill-switch events live here
-- instead of a new table).
-- CREATE TABLE transaction_logs (
--   id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   recipient  text NOT NULL,      -- 'SYSTEM' for kill-switch audit rows
--   amount     numeric NOT NULL,   -- 0 for kill-switch audit rows
--   status     text NOT NULL,      -- APPROVED | REJECTED | FROZEN | UNFROZEN | EXECUTED | FAILED
--   reason     text,               -- explanation, or "actor: <name> — <reason>" for SYSTEM rows
--   created_at timestamptz NOT NULL DEFAULT now()
-- );

-- Recommended indexes (safe to add if they don't already exist; not required
-- to run the demo, but keeps the "recent transactions" query fast at scale):
-- CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs (created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_allowlist_address ON allowlist (address);

-- Seed data suggestion for the demo (adjust to your existing rows):
-- INSERT INTO policies (daily_limit, spent_today, is_frozen) VALUES (1000, 0, false);
-- INSERT INTO allowlist (address, name) VALUES
--   ('acme@example.com', 'Acme Corp'),
--   ('globex@example.com', 'Globex Inc');
