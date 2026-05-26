# Day 1 — 2026-05-21

**Hours worked:** 4 hours

**What I did:**
- Set up the main project structure with separate `frontend/` and `backend/` directories to keep the code organized.
- Initialized the frontend using React with Vite and set up a basic Node.js + Express backend server.
- Installed Bootstrap for CSS styling so I don't have to write all the responsive layout rules from scratch.
- Created a simple landing page with a hero section explaining what the AI Spend Audit tool does, plus a basic main layout with a dark navbar.
- Hooked up React Router and created page files for `Home`, `Audit`, `Result`, and a custom `NotFound` fallback page.
- Initialized a Git repository, configured `.gitignore` to keep `node_modules` out, and pushed the base setup to GitHub in clean steps.
- Set up a quick deployment for the frontend on Netlify so it's live and easier to share.

**What I learned:**
- How to structure a full-stack project from scratch without getting the frontend and backend dependencies mixed up.
- Setting up React Router DOM and linking pages using `<Link>` instead of regular anchor tags so the page doesn't refresh.
- Quick deployment on Netlify and linking it with a GitHub repository for automatic updates.

**Blockers / what I'm stuck on:**
- I'm still trying to figure out how the actual audit logic will calculate savings. I need to design an engine that compares free vs. paid plans for different AI tools, which feels a bit math-heavy.
- The UI is really basic right now. I'm using default Bootstrap colors and it feels a bit dry, so I need to spend time making it look more modern and premium later.

**Plan for tomorrow:**
- Build the audit input form where users can select tools (like Cursor, ChatGPT, Claude) and enter their usage hours or team size.
- Sketch out a simple data structure/JSON file containing the pricing for common tools so the backend can read it for calculations.

## Day 2 — 2026-05-22

**Hours worked:** 6–7 hours

**What I did:**
Today I focused on building the main input system for the AI Spend Audit app. I converted the SpendForm into a dynamic multi-tool form where users can add multiple AI tools like Cursor, ChatGPT, and Claude. Each tool row now supports selecting the tool, choosing a plan based on that tool, entering seats, monthly spend, and use case.

I also implemented add/remove functionality for tool rows so users can build a full AI stack instead of just a single input. Along with that, I connected the form state to localStorage so the data does not disappear on page refresh. This makes the experience feel more like a real product instead of a demo form.

I also worked on making sure the plan dropdown changes dynamically based on the selected tool, and I added basic validation so incomplete or empty entries don’t break the UI.

Finally, I cleaned up the flow a bit and tested the full user journey: adding tools → filling data → refreshing page → data still persists correctly.

---

**What I learned:** I learned how to manage complex dynamic form state in React using arrays of objects instead of simple state variables. I also understood how important it is to structure data properly early because the entire audit engine later depends on this structure.

Another key thing I learned is how useful localStorage is for MVP-level persistence when backend is not ready yet. It made the app feel much more complete without needing a database.

---

**Blockers / what I'm stuck on:** I'm still thinking about the backend database configurations and structuring API endpoints to cleanly store and load user audits from MongoDB, but the frontend math is working very reliably now.

---

**Plan for tomorrow:** Tomorrow I will focus on writing modular backend routes, hooking up Mongoose models, and persisting the audit data and lead capture entries.

## Day 3 — 2026-05-24

**Hours worked:** 7 hours

**What I did:**
- Built the core rule-based mathematical analysis engine in `Frontend/src/utils/auditEngine.js` that computes total spent vs. optimized spent, calculates net savings, and generates list of granular downgrades and recommendations.
- Patched and refactored the audit calculation engine to strictly enforce non-linear vendor pricing constraints, minimum seat billing thresholds (e.g. 5-seat minimum for Claude Team, 2-seat for ChatGPT Team), and generate custom explainable business reasoning cards.
- Integrated a comprehensive SaaS pricing audit framework including true expected spend derivations, multi-weighted selection scores (cost 50%, usage fit 30%, feature compatibility 20%), plan availability rules, and custom usage-based API calculations for Developer models (OpenAI, Anthropic, Gemini API).
- Synced and enhanced the central `pricingData.js` dictionary by injecting `type`, `maxSeats`, `minSeats`, `isEnterpriseOnly`, `isPubliclyAvailable`, and custom `pricingModel` usage keys.
- Developed a high-end, responsive results dashboard in `Result.jsx` showcasing monthly budgets, active seats count, and percentage charts of stack optimizations, styled with dynamic Credex Qualification gradient cards and verified Audit Confidence meters.
- Built an advanced link-sharing system inside `Result.jsx` utilizing base64-encoded URL state payload tokens, enabling instant cross-user dashboard sharing without server query overhead.
- Implemented lead-capture subscription gates to capture user names and emails, laying the groundwork for transactional reports.
- Elevated typography by configuring Google Fonts "Outfit" and adding SEO descriptive meta headers to `index.html`.

**What I learned:**
- How to structure clean utility engines separate from React state hooks so mathematics remain highly testable.
- Resolving loose matching rules in JS arrays by synchronizing strict attributes in configuration dictionaries.
- State sharing through URL payload encodings as an efficient serverless sharing alternative.

**Blockers / what I'm stuck on:**
- The express server currently runs as a basic boilerplate. I will need to lay down mongoose schemas, MongoDB connectivity, and lead persistence routers in the next sprint.

**Plan for tomorrow:**
- Establish database models and set up the modular backend server endpoints for audits storage and lead collection.
- Connect frontend Axios queries to save generated audit links on MongoDB and load shareable routes natively.

## Day 4 — 2026-05-26

**Hours worked:** 8 hours

**What I did today:**
- Completed the production‑ready README with badges, screenshot placeholders, setup guide, feature list, tech stack, testing instructions, and deployment notes.
- Added a comprehensive `ARCHITECTURE.md` containing a Mermaid diagram, component descriptions, data‑flow, scalability strategy for 10k audits/day, and rationale for using React + JavaScript.
- Populated all previously empty markdown files (`ECONOMICS.md`, `GTM.md`, `LANDING_COPY.md`, `METRICS.md`, `REFLECTION.md`, `PROMPTS.md`, `USER_INTERVIEWS.md`) with realistic startup‑oriented content.
- Updated `TESTS.md` to document the auditEngine test suite and provide running instructions.
- Verified all documentation links are correct and the repository now looks like a professional SaaS portfolio ready for investors.

**What I learned:**
- Writing concise, compelling documentation is as important as code quality for a startup product.
- Consistent branding across README, architecture diagram, and markdown files boosts perceived professionalism.

**Next steps:**
- Review deployment configuration (env variables, CORS, CI pipeline) and perform a final production build.
- Remove any remaining console logs and dead code before the final release.

**Blockers / open items:** None – documentation phase completed.