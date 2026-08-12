# API Documentation

Only two workflows expose public HTTP endpoints. Workflows C and D are internal
(`Execute Workflow Trigger` only) and have no webhook URL — see `architecture.md` §6.

---

## Workflow A — Kill Switch API

**Method:** `POST`
**Path:** `/webhook/kill-switch` (n8n Cloud production URL, copy into `frontend/index.html`
`CONFIG.KILL_SWITCH_WEBHOOK_URL`)

### Request body

```json
{
  "action": "freeze",
  "actor": "Priya Shah",
  "reason": "Suspicious repeated payment attempts observed"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `action` | `"freeze"` \| `"unfreeze"` | yes | Anything else returns a validation error |
| `actor` | string | yes | Required for the audit trail — see `decisions.md` ADR-004 |
| `reason` | string | no | Defaults to a generic message per action if omitted |

### Response — 200 OK

```json
{
  "status": "FROZEN",
  "is_frozen": true,
  "actor": "Priya Shah",
  "reason": "Suspicious repeated payment attempts observed",
  "timestamp": "2026-08-01T09:14:22.101Z",
  "message": "🚨 Emergency Stop Activated - All Payment Pipelines Halted"
}
```

### Response — 400 (validation failure)

```json
{ "error": "action must be \"freeze\" or \"unfreeze\"" }
```

---

## Workflow B — AI Agent

**Method:** `POST`
**Path:** `/webhook/ai-agent` (n8n Cloud production URL, copy into `frontend/index.html`
`CONFIG.AI_AGENT_WEBHOOK_URL`)

### Request body

```json
{ "prompt": "Pay Acme Corp $150" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `prompt` | string | yes | Free text. Treated as untrusted input by the system prompt — see `architecture.md` and the `Gemini 2.5 Flash: Extract Payment Fields` node's `notes` field in `workflow-b-ai-agent.json` |

### Response shapes

**Wallet frozen (checkpoint 1 — no LLM call made):**
```json
{ "decision": "REJECTED", "reason": "Wallet is frozen. The AI agent will not even attempt to interpret payment requests while the Emergency Kill Switch is active.", "prompt": "Pay Acme Corp $150" }
```

**Extraction failed:**
```json
{ "decision": "REJECTED", "reason": "Could not confidently identify a recipient and amount from the request. Please rephrase (e.g. \"Pay Acme Corp $150\")." }
```

**Rejected by middleware** (any of: frozen at checkpoint 2/3, not on allowlist, exceeds daily limit,
executor failure):
```json
{ "decision": "REJECTED", "reason": "Recipient is not on the allowlist.", "recipient": "Unknown LLC", "amount": 500 }
```

**Approved and executed:**
```json
{
  "decision": "APPROVED",
  "payment_id": "pi_3P...testid",
  "status": "succeeded",
  "timestamp": "2026-08-01T09:15:03.442Z",
  "recipient": "Acme Corp",
  "amount": 150
}
```

The `reason` values shown above are exactly what each workflow's `Format Rejection …` node produces
— see the relevant `n8n-workflows/*.json` file for the corresponding node id if you need to change
the wording.

---

## Workflow C — Authorization Middleware (internal only)

Invoked via n8n's `Execute Workflow` node from Workflow B (and only Workflow B).

**Input:** `{ recipient: string, amount: number, request_id: string }`
**Output:** same shape as Workflow B's "Rejected by middleware" / "Approved and executed" responses
above (Workflow B passes this straight through — see the `Passthrough Middleware Decision` node).

## Workflow D — Payment Executor (internal only)

Invoked via n8n's `Execute Workflow` node from Workflow C (and only Workflow C).

**Input:** `{ recipient: string, amount: number, request_id: string, policy_id: string }`
**Output:**
```json
{ "status": "EXECUTED", "payment_id": "pi_...", "stripe_status": "succeeded", "timestamp": "...", "recipient": "...", "amount": 0, "request_id": "..." }
```
or, on failure/frozen/duplicate:
```json
{ "status": "FAILED", "reason": "Blocked by Emergency Kill Switch immediately before Stripe call.", "recipient": "...", "amount": 0, "request_id": "...", "timestamp": "..." }
```
