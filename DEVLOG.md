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

**Hours worked:** 12 hours

**What I did today:**
- **Refactored & Modularized Backend to MVC Architecture**: Split the monolithic Express backend boilerplate into a clean, scalable Model-View-Controller pattern, introducing modular `config/db.js`, controllers (`auditController.js`, `leadController.js`), Mongoose models (`Audit.js`, `Lead.js`), and dedicated routing files.
- **Upgraded Results Page to Premium B2B Dashboard**: Revamped `Result.jsx` with a high-end dark glassmorphism SaaS interface featuring custom Credex Qualification meters, dynamic cost-saving visual charts, confidence score ratings, and responsive layout grids.
- **Implemented Rule-Based Cost Optimization Engine**: Coded rigorous non-linear pricing logic in `auditEngine.js` to parse actual SaaS rules (e.g., Claude Team 5-seat minimums, ChatGPT Team 2-seat minimums, developer usage tokens-to-cost modeling) to calculate real potential savings and prevent redundant multi-tool licenses.
- **Integrated Automated Email Reports & Lead Capture**: Connected Resend SMTP and Nodemailer to automatically dispatch generated audit results directly to lead emails, complete with clean HTML summary reports.
- **Configured Database-Backed Sharing Loop**: Built a robust URL link sharing system using database-backed unique IDs stored in MongoDB, with an instant fallback to Base64-encoded state tokens for serverless query parsing.
- **Set Up Automated Testing Setup (Vitest)**: Implemented standard testing configuration with Vitest, writing 5 automated test cases in `auditEngine.test.js` validating the accuracy of the mathematical engine (total spend, optimized spend, redundancy checks, savings percent, empty inputs).
- **Completed Production-Grade Documentation**: Published professional markdown files across the repository (`README.md`, `ARCHITECTURE.md` with Mermaid workflows, `TESTS.md`, `ECONOMICS.md`, `GTM.md`, `REFLECTION.md`, `USER_INTERVIEWS.md`, and `LANDING_COPY.md`) referencing real code metrics, database schemas, and startup unit economics.

**What I learned:**
- Separating rule-based pricing logic from React's state management makes the core algorithms highly testable and robust under Vitest.
- Visual polish using glassmorphism and clear KPI widgets dramatically improves user trust and perceived audit authenticity in SaaS applications.
- Decoupling database queries from local state via Base64 URL fallback is a highly reliable fail-safe for client-side state reconstruction.

**Next steps:**
- Complete specialized metrics tracking instrumentation (`METRICS.md`) and refine target AI prompts (`PROMPTS.md`).
- Validate final production build processes, environmental variable integrations, and ensure all console logs/unused parameters are purged.

**Blockers / open items:** None – full feature implementation and test coverage complete.

## Day 5 — 2026-05-27

**Hours worked:** 2 hours

**What I did today:**
- **Created SaaS Metrics Strategy (`METRICS.md`)**: Drafted the comprehensive metrics architecture document outlining our North Star metric (Completed Audits), concrete B2B SaaS input indicators (Audit Initiations, Share Loop Copying, Lead Conversions), Segment/Plausible instrumentation schemas, and strategic pivot thresholds.
- **Engineered AI Prompts Strategy (`PROMPTS.md`)**: Documented LedgerAI's exact LLM prompt pipelines for Audit Summaries, Cost Optimizations, and Founder briefings, including strict cost matrix constraint mapping, context injection protocols, and a detailed engineering review of initial prompting failures (hallucinated prices, prose return overrides, duplicate suggestions).
- **Overhauled SpendForm UI/UX & Mobile Responsiveness**:
  - Re-designed the primary forms using premium `.glass-card` elements for visual alignment with the premium results dashboard.
  - Resolved plan dropdown confusion by displaying dynamic descriptions based on pricing models (e.g. `$X/mo flat` for flat-rate platforms like Midjourney, `usage-based` for API tiers, and `$X/seat/mo` for per-seat licensing).
  - Added monospaced responsive labels (`d-md-none` helper classes) visible only on mobile screens, providing essential accessibility cues that were previously hidden on smaller screens.
  - Engineered active warnings below the seats input to alert users in real time if their counts violate vendor limits (e.g. Cursor Hobby maximum seat threshold of 1 or Claude Team minimum seat floor of 5).
  - Implemented the `.gradient-cta` components for visual weight and polished focus outlines on interactive dropdown selectors.
  - **Fixed Missing Caret Dropdown Arrows**: Refactored `<select>` inline styles from shorthand `background` overrides to `backgroundColor` rules, restoring the default Bootstrap chevron/caret dropdown indicator background-images.
  - **Eliminated Ugly Browser Spinner Controls**: Hidden default browser increment/decrement arrows on `<input type="number">` using custom CSS, removing the misaligned browser-native arrows that clashing with our dark/glassmorphism styling.
  - **Engineered Hover & Focus Glowing Transitions**: Designed glowing transitions inside `App.css` so that on hover/focus, input and select fields smoothly highlight with a subtle Royal Indigo shadow and border accent.
  - **Restored Number Input Colors**: Refactored inputs style from shorthand `background` to `backgroundColor` to ensure numbers and placeholder texts remain highly visible and high-contrast on all devices.
- **Polished Repository & Synchronized Remotes**: Finalized all documentation syncs and pushed clean commits to main.

**What I learned:**
- Grounding AI prompt templates in a deterministic pricing lookup matrix is crucial for keeping LLM financial projections accurate.
- Well-instrumented pivot metrics ensure developer hours are prioritized toward features driving genuine user interaction.
- Adding responsive mobile-only labels is a standard pattern that bridges the gap between clean desktop grids and accessible mobile layouts.
- Relying on CSS shorthand `background` style resets overrides specific styling rules like `background-image` (which holds Bootstrap's select arrow data URI), whereas `backgroundColor` leaves it perfectly intact.
- Removing browser spinners on number inputs via CSS resets dramatically refines B2B SaaS input fields, replacing jarring native elements with responsive and clean text-like formatting.

**Next steps:**
- Validate final production build processes, environmental variable integrations, and ensure all console logs/unused parameters are purged.

**Blockers / open items:** None.