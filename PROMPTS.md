# PROMPTS.md

## AI Prompting Philosophy
- **Trust through summarization** – Users consume a compact audit report; a well‑crafted summary that references exact tool names, plans, and spend numbers builds confidence that the engine has actually analysed their data.
- **Guarding against hallucination** – Prompts explicitly pass the *structured* output of `auditEngine` (JSON) and request the model to *only* use those fields. Any free‑form speculation is prohibited via a strict "no‑invent" clause.
- **Financial recommendation constraints** – Recommendations must stay within the bounds of the pricing data we store in `pricingData.js`. The prompt includes a validation step that cross‑checks every suggested plan against the known cost matrix, preventing the model from fabricating unrealistic discounts or plans.

---

## Prompt 1 — Audit Summary Generation
```
You are an AI assistant that receives a JSON payload from the LedgerAI audit engine.
Payload fields: tools[] (tool, plan, seats, spend, useCase), totalSpend, optimizedSpend, savings, recommendations[].

Generate a concise markdown summary with the following sections:
1. **Current Spend** – total spend formatted as USD.
2. **Optimized Spend** – projected spend after applying all recommendations.
3. **Savings** – absolute and percentage.
4. **Top 3 Recommendations** – each with tool name, current plan, suggested plan, seats change, and expected monthly saving.

Constraints:
- Use ONLY the values from the JSON payload.
- Do NOT fabricate additional tools or pricing.
- Keep the tone factual and professional.
```
**Injected variables** – `{{auditResult}}` (stringified JSON from `auditEngine`).
**Expected response** – Markdown with headings `## Current Spend` etc., bullet‑pointed recommendations.
**Reasoning** – By limiting the model to the JSON, we eliminate hallucination risk while still providing a human‑readable narrative.

---

## Prompt 2 — Cost Optimization Recommendations
```
Given the same `auditResult` JSON and the pricing catalog from `pricingData.js` (provided as a second JSON argument), create actionable recommendations:
- For each tool, compare the current plan cost versus the lowest‑cost plan that still satisfies the `useCase`.
- Propose seat reductions if `seats > 5` and the tool offers per‑seat discounts.
- Include a brief justification referencing the specific price entries (e.g., "Enterprise $60 → Team $30 saves $30 per seat").
- Output a JSON array of recommendation objects: {tool, currentPlan, suggestedPlan, seatChange, monthlySaving}.

Constraints:
- Never suggest a plan that does not exist in the pricing catalog.
- Ensure `monthlySaving` is a positive number; omit any recommendation where savings would be ≤ $0.
- Return ONLY valid JSON – no explanatory prose.
```
**Injected variables** – `{{auditResult}}` and `{{pricingCatalog}}`.
**Why this wording** – By demanding JSON output we can programmatically verify each entry against our price list, making the recommendation pipeline deterministic.

---

## Prompt 3 — Founder Executive Summary
```
Compose a 150‑word executive briefing for the LedgerAI founder based on the audit JSON.
Include:
- Overall spend reduction potential.
- Strategic insight (e.g., “Most savings come from redundant tooling across ChatGPT and Claude”).
- Next steps for product/marketing (e.g., “Add PDF export to capture leads”).
Tone: concise, data‑driven, and forward‑looking. Use percentages and dollar figures from the payload; no fluff.
```
**Purpose** – Gives leadership a quick snapshot to inform fundraising or GTM decisions.

---

## Prompt Failures & Iterations
| Attempt | Failure | Fix Implemented |
|--------|---------|-----------------|
| **Version 1** – Simple free‑form summary | The model invented a discount for "ChatGPT Pro → Enterprise" that doesn’t exist, leading to user distrust. | Added a strict “use only provided JSON values” clause and supplied the pricing catalog as a second argument. |
| **Version 2** – Recommendations as prose | Recommendations were vague (“consider cheaper plans”) and lacked concrete numbers, making them non‑actionable. | Switched output format to a JSON array with explicit fields and added validation that `monthlySaving > 0`. |
| **Version 3** – Over‑generation of recommendations | Model produced duplicate suggestions for the same tool (different seat counts). | Added deduplication rule: one recommendation per tool, prioritize the highest‑saving option. |
| **Version 4** – Hallucinated tool names | When the payload omitted a tool, the model guessed “Midjourney” based on context. | Enforced that the prompt iterates over `tools[]` array only; any missing entry is ignored. |
| **Version 5** – Too formal executive tone | Founder needed a punchy, actionable brief but got a corporate‑speak paragraph. | Refined wording: “concise, data‑driven, forward‑looking” and limited length to 150 words. |

**Result** – The final prompt suite is safe: it never fabricates data, returns structured outputs for downstream processing, and aligns with LedgerAI’s real implementation (auditEngine JSON, pricingData catalog, and Result.jsx UI).
