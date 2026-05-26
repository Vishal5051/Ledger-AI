# METRICS.md

## 1. North Star Metric
**Completed Audits (shareable, persisted reports)**
- **Why it matters:** LedgerAI exists to turn a raw list of AI‑tool subscriptions into a concrete, actionable audit report. Each completed audit represents a user who has received the core value – a clear spend‑optimization roadmap and a shareable URL.
- **Business value:** A completed audit is a qualified lead; it signals intent to act, enables lead capture, and is the gateway to upselling the PDF export or Enterprise tier. It directly drives downstream revenue.
- **Why not vanity:** Page‑views or button clicks are surface‑level; they do not guarantee the user has seen the recommendations. Only a completed audit demonstrates end‑to‑end product usage.

## 2. Input Metrics
| Metric | What it measures | Why it matters | Impact on NSM |
|--------|------------------|----------------|---------------|
| **Audit Initiations** (`audit_started` event) | Number of times a user clicks *Generate Audit* on the SpendForm. | Shows interest and funnel entry volume. | Higher initiations increase potential completed audits; a drop indicates friction in the form UI. |
| **Share Link Generation** (`share_generated` event) | When the Result page successfully creates a database‑backed or Base64 share URL. | Indicates the audit passed validation and the user is willing to distribute the findings. | Successful share generation is a prerequisite for a completed audit; failures here reduce NSM conversion. |
| **Lead Capture Conversions** (`lead_submitted` event) | Submissions of name/email after viewing recommendations. | Directly ties the audit to a sales qualified lead. | Leads that convert to paid tiers boost revenue per audit; low conversion signals a trust gap in recommendations. |

## 3. Instrumentation Plan
- **Analytics Events** (tracked via a lightweight client like Segment or Plausible):
  - `audit_started` – payload: `{toolsCount, teamSize, globalUseCase}`
  - `audit_completed` – payload: `{totalCurrentSpend, totalOptimizedSpend, savingsPercentage, recommendationCount}`
  - `share_copied` – payload: `{method: "db"|"fallback"}`
  - `lead_submitted` – payload: `{emailDomain, source: "result_page"}`
  - `pdf_downloaded` – payload: `{auditId}`
  - `consultation_requested` – payload: `{date, time}`
  - `error` – payload: `{stage, message}`
- **Key User Flows**:
  1. **Form → Audit** – watch for drop‑offs after `audit_started`.
  2. **Result Page** – track loading state, share copy, PDF download, and lead capture.
  3. **Referral/Sharing** – monitor inbound traffic with `?id=` or `?data=` query params to measure viral loop.
- **Conversion Funnel**:
  `audit_started` → `audit_completed` → `share_generated` → `lead_submitted` → `paid_signup` (future).
  Funnel percentages will be visualized in a dashboard to spot bottlenecks.

## 4. Pivot Signals
- **Low Audit Completion Rate** (< 30 % of initiations finish) → indicates friction in validation, possibly the localStorage parsing bug or confusing UI.
- **High Share‑Generation Failure** (> 20 % fallback to Base64) → suggests backend reliability concerns; may need a more robust persistence layer.
- **Lead Capture Drop‑off** (< 5 % conversion) → users don’t trust the recommendations; could point to overly generic advice or perceived risk.
- **Repeated Recommendation Rejection** (if we later add a “dismiss” button and see > 40 % dismissals) → recommendations are not actionable or are perceived as inaccurate.
- **Zero Monthly Recurring Revenue after 3 months** despite steady audit volume → signals product‑market mismatch; may need to pivot to a consultancy model.

*All metrics are grounded in the actual implementation: the `Result.jsx` component emits the events listed above, the `auditEngine` supplies the spend numbers, and the `Audit` Mongoose schema stores the persisted audit data.*
