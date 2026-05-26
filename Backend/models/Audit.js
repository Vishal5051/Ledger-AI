const mongoose = require("mongoose");

const AuditSchema = new mongoose.Schema({
  tools: [
    {
      tool: String,
      plan: String,
      seats: Number,
      spend: Number,
      useCase: String
    }
  ],
  teamSize: { type: Number, default: 5 },
  totalSpend: { type: Number },
  optimizedSpend: { type: Number },
  savings: { type: Number },
  recommendations: { type: Array },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  globalUseCase: { type: String, default: "mixed" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Audit", AuditSchema);
