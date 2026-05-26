require("dotenv").config();
// LedgerAI Backend Server
const express = require("express");
const cors = require("cors");
const { connectDB, getDbStatus } = require("./config/db");

const auditRoutes = require("./routes/auditRoutes");
const leadRoutes = require("./routes/leadRoutes");

const app = express();

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