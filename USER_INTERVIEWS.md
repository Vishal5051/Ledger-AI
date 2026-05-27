# USER_INTERVIEWS.md

## B2B Founder Discovery Interview

**Subject:** Rahul (College Senior / Super-Senior)
**Role:** Founder & CEO at **DevFlow AI** (Y-Combinator W25, 8-person engineering team)
**Context:** Catch-up and product validation call conducted via Google Meet on May 25, 2026.

---

### 💬 The Conversation Transcript

**Rahul:** "Hey man! Long time no see! First of all, congrats on wrapping up college soon. I saw your posts about building LedgerAI on LinkedIn. Honestly, the timing is crazy. We literally just got our AWS and corporate card statements yesterday, and our SaaS bill is getting completely out of hand."

**Me:** "Haha, thanks Rahul Bhaiya! Yeah, that's exactly why I started hacking on this. Startups are just throwing money at Cursor, ChatGPT, Claude, and Gemini API keys without any central control. How are you guys managing your AI subscriptions right now?"

**Rahul:** "Managing? We aren't. It's a complete mess. When we got into YC, we just told everyone, *'Buy whatever helps you ship faster.'* So right now, we've got 4 developers on Cursor Pro ($20/mo each), 3 developers on ChatGPT Team ($30/mo each), and 3 on Claude Team ($30/mo each). On top of that, we have usage-based API bills for OpenAI and Anthropic because we're building LLM features into our main product."

**Me:** "Oh wow. Okay, wait. Let's break that down. You said you have 3 seats on Claude Team?"

**Rahul:** "Yeah. Just me, my co-founder, and our lead engineer."

**Me:** "Did you know that Anthropic enforces a strict **5-seat billing minimum** on their Claude Team plan? Even though you only added 3 active users, Anthropic is invoicing you for 5 seats ($150/mo) every single month. You're paying for 2 completely empty seats."

**Rahul:** *"Wait, seriously? I had no idea. I just assumed we were paying $90. $150 isn't going to break the bank, but that is so incredibly annoying. Why doesn't the pricing page make that obvious?"*

**Me:** "Exactly! It’s buried in their fine print. And it's not just Anthropic. OpenAI's ChatGPT Team has a **2-seat minimum**. If a solo researcher buys ChatGPT Team instead of ChatGPT Plus, they get hit with a 2-seat charge ($60 instead of $20). What about tool overlaps? Do your devs actually use both ChatGPT and Claude?"

**Rahul:** "To be honest, they use both. But they use them for different things. Our front-end guy swears by Claude for React and UI stuff, but uses ChatGPT for writing tech specs. But there's no way we need Team subscriptions for both. If we could consolidate them or downgrade the ones who only need individual accounts, we'd save hundreds. What does LedgerAI do with this data?"

**Me:** "Here, let me share my screen. If you input your active seats, plans, and use cases into this spend form, my rule-based engine parses all the pricing constraints, detects seat floors, flags software redundancies, and generates an optimized plan. Look at this result dashboard."

**Rahul:** *"Whoa. Hold on. This is sick. The UI looks incredibly premium. Let me look at that Claude card... Ah! It actually caught the 5-seat minimum floor penalty! And it's suggesting we downgrade to Claude Pro ($20/seat) to bypass the seat floor, saving us $90/mo just on Claude? That is genius."*

**Me:** "Yup! The engine automatically compares the Team cost ($150) against the Pro cost ($20 * 3 = $60) to verify if a downgrade yields net savings without losing key feature sets."

**Rahul:** "Man, I need to show this to my co-founder immediately. He handles the corporate card. Can I share this exact page with him? I don't want him to have to sign up or re-input all our tools from scratch. He’s too busy."

**Me:** "Yes, absolutely! I built a shareable URL system. When you click *'Share Report'*, it saves the audit to our MongoDB and generates a unique short-link. And if the database is ever down, it has an instant fallback that encodes your entire form state into a Base64 URL token, meaning the dashboard reconstructs itself on his screen instantly without even needing a database query."

**Rahul:** "That is clean. If you can make it send a clean HTML report to his email directly from the app, that would be the killer feature. He reads everything on email."

---

### 💡 Surprising Insights & Product Impact

1. **The Ghost Billing Floors (Crucial Rule Implementation):**
   * *Insight:* Founders are completely unaware of vendor seat floors (e.g. Claude's 5-seat minimum, ChatGPT's 2-seat minimum). They see the "$30/seat" sticker price and assume they are billed linearly.
   * *Product Impact:* Engineered the non-linear floor checking mathematics inside `auditEngine.js` (lines 142-198) to flag seat-floor wastage and recommend downgrades to Pro tiers when team sizes fall below minimum billing thresholds.

2. **The Collaborative Safeguard Vault:**
   * *Insight:* Rahul highlighted that downgrading teams to solo plans recklessly could break shared workspaces, shared keys, and collaborative repositories.
   * *Product Impact:* Added the **Safeguard Rule** in the engine; if active tool seats exceed `2`, the engine locks the tool to team-level accounts to protect startup code collaboration, marking them as "Safeguard Protected" in `Result.jsx`.

3. **No-Barrier Share Loop:**
   * *Insight:* Decision-makers (co-founders/investors) have zero patience for sign-up gates just to view a shared dashboard.
   * *Product Impact:* Developed the MongoDB-backed short-link system with the instant client-side Base64 state tokenizer fallback inside the results dashboard to enable friction-free, single-click sharing.
