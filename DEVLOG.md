## Day 1 — 2026-05-21

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

**What I learned:**
I learned how to manage complex dynamic form state in React using arrays of objects instead of simple state variables. I also understood how important it is to structure data properly early because the entire audit engine later depends on this structure.

Another key thing I learned is how useful localStorage is for MVP-level persistence when backend is not ready yet. It made the app feel much more complete without needing a database.

---

**Blockers / what I'm stuck on:**
Right now I’m thinking about how to design the audit engine logic. I can collect all the data properly, but I still need to figure out a clean way to calculate savings, detect overuse of plans, and suggest cheaper alternatives without making the logic messy.

---

**Plan for tomorrow:**
Tomorrow I will start building the audit engine logic that calculates total spend, compares plan usage, and generates savings recommendations. I also want to start working on the results page UI so the output looks more like a real SaaS dashboard.