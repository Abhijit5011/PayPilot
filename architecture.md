# Architecture

## 1. Components

| Component | Responsibility | Credentials it holds | Credentials it does NOT hold |
|---|---|---|---|
| Frontend dashboard (`frontend/index.html`) | Display state, collect user prompt, fire Emergency Stop/Unfreeze | Supabase **anon** key (read-only display queries only) | Service role key, Stripe key, Gemini key |
| Workflow A — Kill Switch API | Freeze/unfreeze `policies.is_frozen`; write audit event | Supabase service role | Stripe key, Gemini key |
| Workflow B — AI Agent | Parse natural-language payment request into `{recipient, amount}`; call Workflow C; render result | Gemini API key | Supabase service role, Stripe key |
| Workflow C — Authorization Middleware | The only authority that can approve a payment | Supabase service role | Stripe key (calls Workflow D instead) |
| Workflow D — Payment Executor | Create the Stripe PaymentIntent; only after C approves | Supabase service role, Stripe **test** secret key | Gemini key |

## 2. Data model (existing tables — not recreated)

```
policies
  id            uuid / int (pk)
  daily_limit   numeric      -- max total spend per day
  spent_today   numeric      -- running total of approved payments today
  is_frozen     boolean      -- the kill switch
  updated_at    timestamptz

allowlist
  id            uuid / int (pk)
  address       text         -- recipient identifier (e.g. Stripe customer id / email)
  name          text         -- display name

transaction_logs
  id            uuid / int (pk)
  recipient     text
  amount        numeric
  status        text         -- APPROVED | REJECTED | FROZEN | UNFROZEN | EXECUTED | FAILED
  reason        text         -- human-readable explanation (also stores actor for FROZEN/UNFROZEN)
  created_at    timestamptz
```

## 3. Request lifecycle — happy path

1. User types "Pay Acme Corp $150" into the dashboard chat box.
2. Dashboard POSTs `{ prompt: "Pay Acme Corp $150" }` to Workflow B's webhook.
3. Workflow B, checkpoint 1: reads `policies.is_frozen`. If `true`, returns
   `{ decision: "REJECTED", reason: "Wallet frozen" }` immediately — **no LLM call is made**.
4. Workflow B calls Gemini 2.5 Flash with a structured-extraction prompt, gets back
   `{ recipient: "Acme Corp", amount: 150 }`.
5. Workflow B calls Workflow C via `Execute Workflow` node, passing only the extracted fields (never
   passes along any frozen/limit state — see ADR-002).
6. Workflow C, checkpoint 2: reads `policies` fresh. If frozen → REJECT, log, return.
7. Workflow C checks `allowlist` for the recipient. If absent → REJECT, log, return.
8. Workflow C checks `spent_today + amount <= daily_limit`. If it would exceed → REJECT, log,
   return.
9. Workflow C, checkpoint 3 (race guard): re-reads `policies.is_frozen` immediately before calling
   the executor. If it flipped to `true` in the last few hundred milliseconds → REJECT, log, return.
10. Workflow C calls Workflow D via `Execute Workflow`.
11. Workflow D, checkpoint 4: re-reads `is_frozen` one final time, and verifies the invocation came
    from Workflow C's sub-workflow context (see §6). If frozen or the caller check fails → refuse,
    return an error object, log `FAILED`.
12. Workflow D calls Stripe `POST /v1/payment_intents` with `confirm=true`.
13. Workflow D updates `transaction_logs` with the Stripe result (`EXECUTED` / `FAILED`), returns
    `{ payment_id, status, timestamp }` to Workflow C.
14. Workflow C increments `policies.spent_today`, logs `APPROVED` with the Stripe payment id in
    `reason`, and returns the full structured decision to Workflow B.
15. Workflow B renders the decision object to the user. It does not alter it.

## 4. Request lifecycle — Emergency Stop mid-flight

1. A payment is between steps 10 and 12 above (middleware has approved, executor hasn't hit Stripe
   yet).
2. Owner clicks EMERGENCY STOP. Dashboard POSTs `{ actor, reason }` to Workflow A.
3. Workflow A sets `policies.is_frozen = true`, `updated_at = now()`, and logs a `FROZEN` row in
   `transaction_logs` with the actor and reason.
4. Workflow D reaches checkpoint 4 (§3 step 11) a moment later, re-reads `is_frozen`, finds `true`,
   and **aborts before calling Stripe**. It logs `FAILED` with reason `"Blocked by Emergency Kill
   Switch"` and returns a rejection to Workflow C, which passes it up to Workflow B.
5. No Stripe call was ever made. The transaction never becomes irreversible.
6. Any subsequent payment requests are rejected at checkpoint 1 or 2 without reaching the LLM or the
   middleware's business-logic checks at all.

## 5. Checkpoint table (circuit breaker enforcement)

| # | Location | What is checked | On frozen=true |
|---|---|---|---|
| 1 | Workflow B, entry | `policies.is_frozen` | Return REJECTED, skip LLM call entirely |
| 2 | Workflow C, entry | `policies.is_frozen` | Return REJECTED, log, skip allowlist/limit checks |
| 3 | Workflow C, pre-executor call | `policies.is_frozen` (re-read) | Return REJECTED, log, do not call Workflow D |
| 4 | Workflow D, entry (pre-Stripe) | `policies.is_frozen` (re-read) + caller identity | Return FAILED, log, do not call Stripe |
| 5 | Any retry node in C or D | `policies.is_frozen` (re-read) before firing the retry | Cancel the retry, log `FAILED` |

## 6. Preventing the AI (or anything else) from calling Workflow D directly

Workflow D's trigger node is **not** a public webhook — it is an `Execute Workflow Trigger` node,
which in n8n can only be invoked by another workflow's `Execute Workflow` node inside the same n8n
instance, never by an external HTTP call. Only Workflow C's `Execute Workflow` node is configured to
point at Workflow D. Workflow B has no such node pointed at D, and holds no Stripe credential even
if it did. This is enforced structurally by n8n's trigger model, not by an in-workflow check alone
— the in-workflow "caller check" in checkpoint 4 is defense-in-depth on top of that structural
guarantee.

## 7. Known follow-ups (documented, not built — see ADR-007)

- Scheduled daily reset of `spent_today` (disabled Schedule Trigger node stubbed in Workflow C).
- Real authentication for "who is the owner" beyond the self-reported actor field (ADR-004).
- Idempotency key on the Stripe call to make retries of Workflow D safe to repeat without double-
  charging (currently Workflow D checks `transaction_logs` for an existing `EXECUTED` row for the
  same middleware-issued request id before calling Stripe, which covers the common retry case).
