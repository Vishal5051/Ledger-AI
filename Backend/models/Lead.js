const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  auditId: { type: String },
  teamSize: { type: Number, default: 5 },
  globalUseCase: { type: String, default: "mixed" },
  tools: [
    {
      tool: String,
      plan: String,
      seats: Number,
      spend: Number,
      useCase: String,
      status: String,
      potentialSavings: Number,
      bestPlan: String
    }
  ],
  totalMonthlySpend: { type: Number, default: 0 },
  totalEstimatedSavings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Lead", LeadSchema);
