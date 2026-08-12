# Deployment Instructions

This project has three independently deployable pieces: n8n workflows (already hosted on n8n
Cloud once imported), Supabase (already hosted — nothing to deploy, it's your existing project),
and the static frontend dashboard.

## Frontend dashboard

The dashboard is a single static HTML file with no build step, so any static host works.

### Option A — Netlify (drag and drop)
1. Go to https://app.netlify.com/drop
2. Drag the `frontend/` folder onto the page.
3. Netlify gives you a live URL immediately.

### Option B — GitHub Pages
1. Push this repository to GitHub.
2. In the repo settings → Pages, set the source to the `frontend/` folder on your main branch.
3. GitHub publishes it at `https://<you>.github.io/<repo>/`.

### Option C — Vercel
1. `npx vercel` from inside `frontend/` (no framework needed — choose "Other" when prompted).
2. Vercel serves `index.html` as-is.

### Before deploying (any option)
Make sure `CONFIG` in `frontend/index.html` points at your **activated** n8n Cloud webhook URLs, not
the `REPLACE_ME_...` placeholders — see `docs/setup-guide.md` step 7.

## n8n workflows

Already "deployed" the moment they're imported and activated in n8n Cloud — there is no separate
build/deploy step. If you outgrow n8n Cloud's free tier limits during heavy demo/testing, the same
four JSON files import cleanly into a self-hosted n8n instance (Docker: `docker run -it --rm
--name n8n -p 5678:5678 n8nio/n8n`), with the same credential and ID-wiring steps from
`docs/setup-guide.md`.

## Supabase

No deployment needed — this project intentionally reuses your existing Supabase project and tables
(`policies`, `allowlist`, `transaction_logs`) without creating new ones, per the original
requirement. Only ensure Row Level Security policies (if enabled) allow the `service_role` key full
access — the service role key bypasses RLS by default in Supabase, so this is usually a non-issue,
but worth confirming if you've customized project-level settings.

## Environment variables recap

Nothing in this project needs a `.env` file at runtime in the traditional sense — n8n stores
credentials in its own encrypted credential store (see `docs/setup-guide.md` step 2), and the
frontend's "secrets" are limited to the Supabase **anon** key, which is safe to expose client-side
by design. `.env.example` exists so a reviewer can see the full list of values involved across the
system at a glance, and as a template if you choose to swap the frontend's hardcoded `CONFIG` block
for a real env-based build step later.
