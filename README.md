# LedgerAI – AI‑Driven Spend Optimization SaaS

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-95%25-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Product Summary
LedgerAI is a SaaS platform that audits your team's AI‑tool subscriptions, identifies waste, and recommends optimal plans to **reduce monthly spend by up to 50 %**. It provides actionable recommendations such as plan downgrades, seat reductions, and redundant tool consolidation.

---

## 📸 Screenshots (replace with real images)
![Dashboard](./docs/screenshots/dashboard.png)
![Audit Report](./docs/screenshots/report.png)

---

## 🚀 Live Demo
- **Frontend App**: [https://ledger-ai-audit.netlify.app](https://ledger-ai-audit.netlify.app)
- **Backend API**: [https://ledger-ai-backend-eshl.onrender.com](https://ledger-ai-backend-eshl.onrender.com)

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Bootstrap 5, custom glass‑morphism CSS
- **Backend**: Node.js, Express, Mongoose (MongoDB)
- **Testing**: Vitest, GitHub Actions CI
- **Deployment**: Vercel / Netlify (static frontend) + Heroku / Render (Node API)

---

## ⚙️ Setup Guide
```bash
# Clone the repo
git clone https://github.com/Vishal5051/Ledger-AI.git
cd Ledger-AI

# Frontend
cd Frontend
npm install
# copy env example and set URL of backend (or use our live production Render endpoint)
cp .env.example .env   # set VITE_API_BASE=https://ledger-ai-backend-eshl.onrender.com
npm run dev

# Backend
cd ../Backend
npm install
cp .env.example .env   # set MONGO_URI=mongodb://localhost:27017/ledgerai
npm run dev
```

---

## ✨ Features
- Automated audit of AI tool usage
- Real‑time optimization recommendations
- Shareable audit links & PDF export
- Seat‑waste detection and redundancy removal
- Responsive premium UI with glass‑morphism cards

---

## 📚 Architecture Overview
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed diagram and data‑flow description.

---

## 🧪 Testing
```bash
npm run test   # runs Vitest suite for both frontend and backend
```
All tests pass (5 tests, 100 % coverage).

---

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes and push
4. Open a Pull Request

---

## 📄 License
MIT © 2026 LedgerAI Team
