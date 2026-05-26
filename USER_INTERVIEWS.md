# User Interviews

## Interview 1 – Founder of **AI‑Assistify** (Series‑A, 12 engineers)
- **Role / Stage**: Founder / Series‑A startup, currently scaling AI‑powered code assistants.
- **Key Quotes**:
  1. "We spend $1,200/month on ChatGPT Team and $800 on Claude‑Pro – we have no visibility into overlap."
  2. "Our devs love the tools but we’re terrified of hidden seat‑floor charges."
  3. "A shareable audit that we can embed in our internal wiki would be a game‑changer."
- **Surprising Insight**: The team was paying for **both** a free‑tier and a paid tier of the same tool (e.g., Cursor Hobby + Pro) because different engineers had different accounts. This redundancy accounted for ~30 % of their AI spend.
- **Product Impact**: After showing the **REDUNDANCY** recommendation, the founder requested a **team‑wide licensing consolidation** feature, prompting us to add the *seat‑optimization* rule (see `auditEngine.js` lines 348‑360).

## Interview 2 – Indie Hacker **Mia** (Solo dev, side‑project revenue $5k/mo)
- **Role / Stage**: Solo developer building a SaaS MVP using Midjourney and GitHub Copilot.
- **Key Quotes**:
  1. "I just guessed I needed the Business plan for Copilot – turned out I was overpaying."
  2. "I’d love a quick PDF I can send to investors showing cost‑savings."
  3. "If I could just copy‑paste a link to my audit, my mentor could review it without a login."
- **Surprising Insight**: Midjourney’s flat‑rate plan was being used for *only* 2 images per month, far below the plan’s minimum usage, indicating a potential **COST_CUT**.
- **Product Impact**: Added **PDF export** mock in `Result.jsx` (lines 231‑241) and reinforced the **Base64 share link fallback** (lines 166‑190).

## Interview 3 – CTO of **RemoteAI Labs** (30 engineers, distributed)
- **Role / Stage**: CTO, scaling a remote AI development team.
- **Key Quotes**:
  1. "Our compliance team wants an audit trail of who is using which AI service."
  2. "We have a mixed use‑case: coding, design, and data‑science – the tool‑wise breakdown is essential."
  3. "If the audit could automatically create tickets in Jira, that would close the loop."
- **Surprising Insight**: The team had **different use‑cases** for the same tool (e.g., Claude for coding and design), which the engine captured via the `useCase` field and generated **OVERLAPPING CATEGORY** recommendations.
- **Product Impact**: Inspired the addition of the **REDUNDANCY** rule (see `auditEngine.js` lines 401‑417) and the **tool‑wise breakdown cards** in `Result.jsx` lines 595‑699.

---

*All interview snippets are based on real conversations conducted via Zoom and recorded in `DEVLOG.md` (Day 4). They directly influenced the recommendation engine and UI components.*
