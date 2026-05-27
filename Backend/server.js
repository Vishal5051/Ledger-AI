require("dotenv").config();
// LedgerAI Backend Server
const express = require("express");
const cors = require("cors");
const { connectDB, getDbStatus } = require("./config/db");

const auditRoutes = require("./routes/auditRoutes");
const leadRoutes = require("./routes/leadRoutes");

const app = express();

// Custom in-memory rate limiter to prevent API abuse & brute-force spamming
const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const rateLimitMaxRequests = 100; // max 100 requests per IP per 15-minute window
const ipRequestCounts = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + rateLimitWindowMs });
    return next();
  }
  
  const limitInfo = ipRequestCounts.get(ip);
  
  if (now > limitInfo.resetTime) {
    limitInfo.count = 1;
    limitInfo.resetTime = now + rateLimitWindowMs;
    return next();
  }
  
  limitInfo.count += 1;
  if (limitInfo.count > rateLimitMaxRequests) {
    return res.status(429).json({
      error: "Too many requests. Please try again after 15 minutes."
    });
  }
  
  next();
};

app.use(rateLimiter);
app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// Register MVC Routes
app.use("/api/audits", auditRoutes);
app.use("/api/leads", leadRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    database: getDbStatus() ? "connected" : "simulation_mode"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});