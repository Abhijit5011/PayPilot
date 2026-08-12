# Setup Guide

## Prerequisites

- An n8n Cloud account (free tier is sufficient)
- A Supabase project that already has the `policies`, `allowlist`, and `transaction_logs` tables
  (see `sql/schema-reference.sql` for the expected shape)
- A Stripe account with **Test Mode** enabled
- A Google AI Studio account for a Gemini API key (or a Groq account for the Llama 3.3 70B fallback)

## 1. Seed Supabase (if the tables are empty)

Run the seed inserts at the bottom of `sql/schema-reference.sql` (uncomment them) in the Supabase
SQL editor, adjusting values as you like. You need at least one row in `policies` and one or two
rows in `allowlist` for the demo to be interesting.

Note the `id` of your `policies` row — you'll need it in step 4.

## 2. Create credentials in n8n

In n8n Cloud, go to **Credentials → New** and create:

1. **Supabase** — using your project's `service_role` key (Settings → API in Supabase). Name it
   `Supabase Service Role` to match the credential name referenced in the workflow JSON files.
2. **Stripe** — using your **Test Mode secret key** (starts with `sk_test_`). Name it
   `Stripe Test Mode`.
3. **Google Gemini (PaLM API)** — using your Gemini API key. Name it `Gemini API`.

## 3. Import the four workflows

For each file in `n8n-workflows/`, in n8n: **Workflows → Add workflow → Import from File**.

Import order doesn't technically matter, but importing D → C → B → A mirrors the build order in
`plan.md` and makes the ID-wiring in step 4 easier to follow, since D and C's IDs need to be known
before you finish wiring C and B respectively.

## 4. Wire the internal Execute Workflow calls

After importing, each workflow gets its own n8n workflow ID (visible in the URL bar, e.g.
`.../workflow/AbCd1234EfGh`).

1. Open **Workflow D**, copy its workflow ID.
2. Open **Workflow C**, find the node **"Execute Workflow D (Payment Executor)"**, and replace
   `WORKFLOW_D_ID_PLACEHOLDER` with the real ID.
3. Open **Workflow C**, copy its workflow ID.
4. Open **Workflow B**, find the node **"Execute Workflow C (Authorization Middleware)"**, and
   replace `WORKFLOW_C_ID_PLACEHOLDER` with the real ID.

## 5. Point the Supabase nodes at your policy row

Every node whose name starts with "Read Policy" or "Re-read Policy" or "Update policies.is_frozen"
or "Increment spent_today" needs its **filter** set to the specific `policies.id` you noted in step
1 (this hackathon build assumes a single-row wallet — see `architecture.md` §2). Open each node and
set the `id` filter condition.

## 6. Assign credentials to each node

For every Supabase node, select the `Supabase Service Role` credential. For the Stripe node in
Workflow D, select `Stripe Test Mode`. For the Gemini node in Workflow B, select `Gemini API`.

## 7. Activate the workflows

Toggle **Active** on all four workflows. Workflows C and D will show no webhook URL (expected —
they're internal-only, see `architecture.md` §6). Workflows A and B will show a **Production URL**
— copy each into `frontend/index.html`'s `CONFIG` block:

```js
const CONFIG = {
  KILL_SWITCH_WEBHOOK_URL: "<Workflow A production URL>",
  AI_AGENT_WEBHOOK_URL: "<Workflow B production URL>",
  SUPABASE_URL: "<your Supabase project URL>",
  SUPABASE_ANON_KEY: "<your Supabase anon key>"
};
```

## 8. Open the dashboard

Open `frontend/index.html` directly in a browser, or serve it as a static file (e.g. `python3 -m
http.server` from the `frontend/` folder, or drag it into any static host). No build step is
required — it's plain HTML/CSS/JS with Tailwind loaded from a CDN.

## 9. Run the test matrix

Work through `docs/testing-scenarios.md` to confirm every checkpoint behaves as designed before
your demo.
