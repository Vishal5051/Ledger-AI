const Audit = require("../models/Audit");
const { getDbStatus } = require("../config/db");

// @desc    Create and save an audit configuration
// @route   POST /api/audits
exports.createAudit = async (req, res) => {
  try {
    const isConnected = getDbStatus();
    if (!isConnected) {
      return res.status(503).json({ error: "Database offline. Unable to save audit." });
    }

    const { teamSize, globalUseCase, tools, results } = req.body;

    const newAudit = new Audit({
      teamSize: parseInt(teamSize, 10) || 5,
      globalUseCase: globalUseCase || "mixed",
      tools: Array.isArray(tools) ? tools : [],
      totalSpend: results?.totalCurrentSpend || results?.totalMonthlySpend,
      optimizedSpend: results?.totalOptimizedSpend,
      savings: results?.totalSavings || results?.totalEstimatedSavings,
      recommendations: results?.recommendations || results?.optimizations
    });

    const saved = await newAudit.save();
    res.status(200).json({ 
      success: true, 
      auditId: saved._id,
      shareableUrl: `/result?id=${saved._id}`
    });
  } catch (err) {
    console.error("Failed to save audit configuration:", err.message);
    res.status(500).json({ error: "Server error saving audit configuration." });
  }
};

// @desc    Fetch a saved audit configuration
// @route   GET /api/audits/:id
exports.getAuditById = async (req, res) => {
  try {
    const isConnected = getDbStatus();
    if (!isConnected) {
      return res.status(503).json({ error: "Database offline. Unable to retrieve shared audit." });
    }

    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ error: "Audit not found." });
    }
    res.status(200).json(audit);
  } catch (err) {
    console.error("Failed to fetch audit:", err.message);
    res.status(500).json({ error: "Server error retrieving audit configuration." });
  }
};
