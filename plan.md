# Build Plan

## Milestones

| # | Milestone | Deliverable | Status |
|---|-----------|-------------|--------|
| 1 | Confirm Supabase schema | Verified `policies`, `allowlist`, `transaction_logs` columns match assumptions in `sql/schema-reference.sql` | done (reference only, no migration) |
| 2 | Workflow A — Kill Switch API | Webhook that toggles `policies.is_frozen`, returns confirmation + timestamp + actor | done |
| 3 | Workflow C — Authorization Middleware | Deterministic policy engine: frozen check → allowlist check → daily-limit check → frozen re-check → approve/reject → log | done |
| 4 | Workflow D — Payment Executor | Stripe Test PaymentIntent creation, guarded by caller + frozen checks, logs result | done |
| 5 | Workflow B — AI Agent | Gemini 2.5 Flash extracts `{recipient, amount}` from free text, calls Workflow C, renders the decision only | done |
| 6 | Frontend dashboard | Tailwind + vanilla JS single-page dashboard: balance, limit, spent, remaining, allowlist, recent transactions, Stripe status, EMERGENCY STOP + UNFREEZE | done |
| 7 | Circuit breaker hardening | `is_frozen` re-checked at every checkpoint listed in `architecture.md`; queued/in-flight executions abort at next safe checkpoint | done |
| 8 | Documentation | `architecture.md`, `decisions.md`, `docs/api-documentation.md`, `docs/setup-guide.md`, `docs/deployment-instructions.md`, `docs/demo-script.md` | done |
| 9 | Test matrix | `docs/testing-scenarios.md` covering all required scenarios | done |

## Explicit build order rationale

Workflow C was built before Workflow B intentionally — the AI agent is a thin, replaceable client of
the middleware, so the middleware's contract (request/response JSON shape) had to be frozen first.
Workflow D was built before Workflow B for the same reason: Workflow C needs a stable executor
contract to call before the AI layer is wired up.

## Out of scope for this hackathon build

- Real bank rails / production Stripe mode (Test Mode only, by design and by requirement).
- Multi-owner / role-based admin (single owner model — "the owner" is whoever holds the dashboard's
  admin action; see `decisions.md` ADR-004 for the identification mechanism used in this build).
- Automatic daily reset of `spent_today` (documented as a cron-triggered follow-up in
  `architecture.md` §7, not required by the current table contract).
