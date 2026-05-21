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
