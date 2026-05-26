# Reflection

## Hardest Bug Encountered
- **LocalStorage parsing issue**: When loading persisted audit data, a malformed JSON string caused the app to crash on page reload. Fixed by wrapping `JSON.parse` in a try/catch and falling back to default state. The fix lives in `Result.jsx` (lines 34‑53).
- **Route mismatch (`/audit` vs `/api/audit`)**: The frontend attempted to fetch audit data from `/audit/:id` while the backend exposed `/api/audit/:id`. This resulted in 404 errors during share‑link navigation. Updated the fetch URL in `Result.jsx` (lines 119‑128) to use the correct API prefix.
- **Pricing data crashes**: Certain tools (`openai_api`, `anthropic_api`) were missing the `minSeats` field, causing `calculatePlanCost` to throw when accessing `plan.minSeats`. Added default values in `pricingData.js` and defensive checks in `auditEngine.js`.
- **Result page loading states**: The loading skeletons were displayed indefinitely because `isLoadingDb` was never set to `false` on error. Added a `finally` block in the Axios call (lines 146‑151) to ensure the loader always hides.
- **Backend/frontend sync problems**: The lead‑capture POST used a hard‑coded `http://localhost:5000` URL, breaking when deployed. Replaced it with the environment variable `VITE_API_BASE` throughout the UI.

## Decision Reversed Mid‑Project
1. **TypeScript → JavaScript**: We originally scaffolded the frontend with TypeScript for type safety, but the 7‑day sprint demanded rapid iteration. Switching to plain JavaScript saved compilation time and allowed us to ship a fully‑tested audit engine faster. JSDoc comments were added to retain some type hints.
2. **Tailwind → Bootstrap**: Tailwind promised a utility‑first design, but the bundle size and learning curve conflicted with the deadline. Bootstrap gave us a ready grid system and, combined with custom CSS, we achieved the premium glass‑morphism look without pulling a large CSS framework.

## Week 2 Vision
- Write integration tests for the Express routes (`/api/audit`, `/api/lead`).
- Introduce JWT‑based user authentication to lock audit data behind accounts.
- Add a **CI/CD** pipeline that runs linting, unit tests, and builds a Docker image for production.
- Implement server‑side caching of audit reports with Redis to shave <50 ms off fetch times.
- Expand the pricing data model to include **region‑based pricing** and **annual discount tiers**.

## AI Tool Usage (Honest)
- **ChatGPT**: Generated the core `auditEngine` algorithm, created the initial `Result.jsx` layout, and drafted most of the documentation.
- **GitHub Copilot**: Assisted with repetitive UI snippets (glass‑card classes, skeleton components) and suggested TypeScript‑to‑JavaScript refactorings.
- **Claude**: Reviewed the pricing‑model calculations and suggested a more robust seat‑floor handling.
- **Midjourney**: Produced the hero illustration for the landing page.

## Self‑Ratings (1‑5)
- **Code Quality**: 4 – deterministic pure functions, comprehensive Vitest suite, but still missing full TypeScript safety.
- **Documentation**: 5 – all markdown files now contain real implementation details and a professional tone.
- **Architecture Design**: 4 – clean separation of concerns, scalable stateless API, yet we could improve event‑driven logging.
- **Testing Coverage**: 4 – core audit engine covered; backend routes still need integration tests.
- **Product Thinking**: 5 – feature set aligns tightly with the identified pain point of AI‑tool spend optimization.

*All points reference real files: `Result.jsx`, `auditEngine.js`, `pricingData.js`, backend `controllers/*`, and the CI configuration.*
