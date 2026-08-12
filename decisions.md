# Architecture Decision Records

## ADR-001: The AI never receives credentials of any kind
**Decision:** Workflow B (AI Agent) holds a Gemini API key and nothing else. No Supabase key, no
Stripe key, no service role.
**Rationale:** The entire threat model is "assume the AI is compromised, hallucinating, or
prompt-injected." The only way to make that unconditionally safe is to make it structurally
impossible for the AI to reach a payment rail or a database, regardless of what text it produces.
**Consequence:** Workflow B can only ever "ask" via an `Execute Workflow` call to Workflow C. Even a
perfectly prompt-injected AI has no tool that can move money.

## ADR-002: Middleware re-derives every fact from Postgres; it never trusts caller-supplied state
**Decision:** Workflow C ignores any `is_frozen`, `daily_limit`, or `spent_today` values that might
arrive in its input payload. It reads `policies` and `allowlist` fresh from Supabase on every
invocation.
**Rationale:** If the middleware trusted values passed in from Workflow B, a prompt-injected AI
could simply claim `"is_frozen": false` in its own output and the check would be meaningless.
**Consequence:** Every authorization decision costs one extra Postgres read, which is an acceptable
trade for correctness.

## ADR-003: Circuit breaker, not a boolean gate
**Decision:** `is_frozen` is checked at multiple points inside a single request's lifecycle, not
once at the top of Workflow C.
**Checkpoints (see `architecture.md` §5 for the full table):**
1. Workflow B, before calling the LLM at all (fail fast, no wasted LLM call).
2. Workflow C, before the allowlist/limit checks.
3. Workflow C, immediately before calling Workflow D (race-condition guard — the owner may have hit
   the kill switch in the seconds between step 2 and now).
4. Workflow D, immediately before calling Stripe (last possible checkpoint before an irreversible
   external side effect).
5. Any retry node in Workflows C or D, before the retry fires.
**Rationale:** A single top-of-workflow check cannot stop a payment that is already mid-flight when
the owner presses Emergency Stop. Re-checking at each irreversible boundary is what makes this a
circuit breaker instead of a flag.

## ADR-004: "Who pressed the kill switch" is captured as a required field, not inferred
**Decision:** The dashboard's Emergency Stop and Unfreeze actions require an `actor` field (free
text — name or admin identifier) submitted with the webhook call. Workflow A writes this into the
audit trail alongside the timestamp.
**Rationale:** n8n Cloud does not have a built-in concept of "the currently logged-in dashboard
user" without adding a full auth system, which is out of scope for a hackathon build. Requiring the
actor to self-identify at the moment of action is the simplest mechanism that still produces an
auditable record, and is called out explicitly in `docs/setup-guide.md` as a place to swap in real
authentication (Supabase Auth, SSO, etc.) for production use.
**Consequence:** The dashboard prompts for a name before allowing Emergency Stop / Unfreeze to fire.

## ADR-005: Audit trail lives in `transaction_logs`, using synthetic recipient/amount sentinel values
**Decision:** Rather than requiring a new table for kill-switch events (the existing-tables
constraint from the prompt forbids new tables), Workflow A logs freeze/unfreeze events into
`transaction_logs` with `recipient = 'SYSTEM'`, `amount = 0`, and `status` of `FROZEN` or
`UNFROZEN`, with the actor and reason captured in the `reason` column.
**Rationale:** This keeps every security-relevant event in one auditable, timestamped table without
touching the schema, honoring the "use these existing tables without recreating them" requirement.
**Consequence:** The dashboard's "recent transactions" feed filters `recipient != 'SYSTEM'` for the
transaction list, and a separate "system events" feed shows only the `SYSTEM` rows.

## ADR-006: Stripe Test Mode PaymentIntents, not Charges
**Decision:** Workflow D uses the PaymentIntents API (`/v1/payment_intents`) with
`confirm=true` and a test payment method, rather than the legacy Charges API.
**Rationale:** PaymentIntents is Stripe's current recommended integration path and produces a
realistic `status` field (`succeeded`, `requires_payment_method`, etc.) that maps naturally onto the
dashboard's "Stripe payment status" requirement.

## ADR-007: Daily limit reset is a documented follow-up, not built
**Decision:** No workflow resets `spent_today` to 0. A commented-out Schedule Trigger node is
included in `workflow-c-authorization-middleware.json` (disabled) as a starting point.
**Rationale:** The provided table contract only mentions `spent_today`, not a reset timestamp or
reset log; adding automatic behavior around a column whose reset semantics weren't specified risked
guessing at an unstated requirement. This is flagged explicitly rather than silently assumed.
