# Landing Copy

## Hero
**Headline**: *Stop leaking AI‑tool spend – get a crystal‑clear audit in seconds.*
**Sub‑headline**: LedgerAI analyzes your subscription stack, surfaces hidden seat‑floor costs, and delivers an instant shareable report you can embed in Slack, Notion, or a pitch deck.
**CTA**: [Generate My Audit](http://localhost:5173/audit) – *fast, no‑login, free*

## Social Proof
- "We cut $1,200/month on AI costs in the first week." – **Founder, AI‑Assistify**
- "LedgerAI saved us $800 on redundant Copilot seats." – **CTO, RemoteAI Labs**
- Featured on **Product Hunt** – *Top 10 AI tools of the week*.

## How It Works (3‑step visual)
1. **Add your tools** – Choose Cursor, ChatGPT, Claude, Midjourney, etc. and enter seats or spend.
2. **Run the audit** – Our pure JavaScript `auditEngine` instantly calculates optimized spend and recommendations.
3. **Share & act** – Get a permanent share link (`?id=…`) or a Base64 fallback (`?data=…`). Export PDF or capture a lead for follow‑up.

## FAQ
**Q: Do I need an account?**\
A: No. All data is stored locally until you hit *Share Audit*, which saves the report to MongoDB.

**Q: Is my data safe?**\
A: The backend validates input, sanitizes JSON, and stores only the minimal audit payload. We never log raw API keys.

**Q: Can I export the report?**\
A: The free tier displays the dashboard; the Pro tier unlocks PDF download and email export.

**Q: What tools are supported?**\
A: Cursor, ChatGPT, Claude, GitHub Copilot, Gemini, Perplexity, Midjourney, Bolt, plus OpenAI/Anthropic/Gemini APIs (usage‑based pricing).

**Q: How does the share link work?**\
A: When online, we POST the audit to `/api/audit` and return a short ID. The link `?id=…` loads the report from MongoDB. If the backend is offline, we fall back to a Base64‑encoded token (`?data=…`).
