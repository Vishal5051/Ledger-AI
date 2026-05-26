import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pricingData from "../data/pricingData";

const SpendForm = () => {
  const navigate = useNavigate();
  const toolKeys = Object.keys(pricingData);

  // Load initial tools list from localStorage, default to one empty row
  const [tools, setTools] = useState(() => {
    const saved = localStorage.getItem("ai_audit_tools");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved AI audit tools:", e);
      }
    }
    return [
      {
        tool: "",
        plan: "",
        seats: 1,
        spend: "",
        useCase: "mixed"
      }
    ];
  });

  // Global inputs state
  const [teamSize, setTeamSize] = useState(() => {
    const saved = localStorage.getItem("ai_audit_team_size");
    return saved ? parseInt(saved, 10) : 5;
  });

  const [globalUseCase, setGlobalUseCase] = useState(() => {
    const saved = localStorage.getItem("ai_audit_global_use_case");
    return saved || "mixed";
  });

  // Validation / Error alerts
  const [errorMsg, setErrorMsg] = useState("");

  // Sync state to localStorage automatically on state changes
  useEffect(() => {
    localStorage.setItem("ai_audit_tools", JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem("ai_audit_team_size", teamSize.toString());
  }, [teamSize]);

  useEffect(() => {
    localStorage.setItem("ai_audit_global_use_case", globalUseCase);
  }, [globalUseCase]);

  // Handler: Add a new blank tool row
  const handleAddRow = () => {
    setTools([
      ...tools,
      {
        tool: "",
        plan: "",
        seats: 1,
        spend: "",
        useCase: "mixed"
      }
    ]);
    setErrorMsg("");
  };

  // Handler: Remove a specific tool row
  const handleRemoveRow = (indexToRemove) => {
    if (tools.length <= 1) {
      setErrorMsg("You must enter at least one AI tool to run an audit!");
      return;
    }
    const filtered = tools.filter((_, index) => index !== indexToRemove);
    setTools(filtered);
    setErrorMsg("");
  };

  // Handler: Input updates
  const handleToolChange = (index, field, value) => {
    const updated = [...tools];
    
    // Save previous value to check logic
    const prevRow = updated[index];

    // Build the updated row
    updated[index] = { ...prevRow, [field]: value };

    // Reset plan and spend if tool changes
    if (field === "tool") {
      updated[index].plan = "";
      updated[index].spend = "";
    }

    // Auto-prefill the spend with: plan price * seats
    if (field === "plan" || field === "seats" || (field === "tool" && value === "")) {
      const selectedTool = updated[index].tool;
      const selectedPlan = updated[index].plan;
      const seatCount = parseInt(updated[index].seats, 10) || 1;

      if (selectedTool && selectedPlan && pricingData[selectedTool]) {
        const matchingPlan = pricingData[selectedTool]?.plans.find(
          (p) => p.name === selectedPlan
        );
        if (matchingPlan) {
          const pricingModel = matchingPlan.pricingModel || "per-seat";
          if (pricingModel === "flat") {
            updated[index].spend = matchingPlan.price;
          } else if (pricingModel === "usage") {
            // Usage based API pricing prefill (based on estimated usecase tokens)
            let tokens = 20000000; // Medium default
            const currentUseCase = updated[index].useCase || "mixed";
            if (currentUseCase === "coding") tokens = 60000000;
            else if (currentUseCase === "research") tokens = 5000000;
            else if (currentUseCase === "writing") tokens = 25000000;
            else if (currentUseCase === "data") tokens = 40000000;
            
            updated[index].spend = parseFloat(((tokens / 1000) * matchingPlan.price).toFixed(2));
          } else {
            const billedSeats = Math.max(seatCount, matchingPlan.minSeats || 1);
            updated[index].spend = matchingPlan.price * billedSeats;
          }
        }
      }
    }

    setTools(updated);
    setErrorMsg("");
  };

  // Live total calculations
  const totalSpend = tools.reduce((sum, item) => {
    const amount = parseFloat(item.spend) || 0;
    return sum + amount;
  }, 0);

  const totalSeatsInTools = tools.reduce((sum, item) => {
    const count = parseInt(item.seats, 10) || 0;
    return sum + count;
  }, 0);

  // Form submit handler
  const handleAnalyze = (e) => {
    e.preventDefault();

    // Check for empty selections
    const hasIncompleteRows = tools.some(
      (item) => !item.tool || !item.plan || item.spend === "" || item.spend === null
    );

    if (hasIncompleteRows) {
      setErrorMsg("Please fill out the Tool Name, Plan, and Spend for all added rows.");
      return;
    }

    // Navigate to results screen (results will calculate dynamically based on localStorage tools data)
    navigate("/result");
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          <form onSubmit={handleAnalyze}>
            
            {/* GLOBAL INFORMATION CARD */}
            <div className="card border-0 p-4 mb-4 rounded-4 shadow-sm" style={{ background: "var(--card-bg)", border: "1px solid var(--border) !important" }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="mono-tag" style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}>PROFILE // 01</span>
                <h5 className="fw-bold m-0" style={{ color: "var(--text-h)" }}>Company Workspace Profile</h5>
              </div>
              
              <div className="row g-4">
                <div className="col-md-6 text-start">
                  <label htmlFor="teamSize" className="form-label fw-bold text-muted small uppercase font-monospace">
                    Total Company Size (Seats)
                  </label>
                  <input
                    type="number"
                    id="teamSize"
                    className="form-control form-control-lg border"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-h)", borderRadius: "8px" }}
                    min="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value, 10) || 1)}
                  />
                  <div className="form-text small text-muted">Used to detect over-provisioned plan seat thresholds.</div>
                </div>

                <div className="col-md-6 text-start">
                  <label htmlFor="globalUseCase" className="form-label fw-bold text-muted small uppercase font-monospace">
                    Primary Use Case Focus
                  </label>
                  <select
                    id="globalUseCase"
                    className="form-select form-select-lg border"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-h)", borderRadius: "8px" }}
                    value={globalUseCase}
                    onChange={(e) => setGlobalUseCase(e.target.value)}
                  >
                    <option value="coding">💻 Software Engineering / Coding</option>
                    <option value="writing">✍️ Content Creation / Copywriting</option>
                    <option value="data">📊 Analytics & Data Operations</option>
                    <option value="research">🔍 Knowledge Search & Research</option>
                    <option value="mixed">🔄 Mixed Operations / General Productivity</option>
                  </select>
                  <div className="form-text small text-muted">Helps identify platform feature overlaps and redundancies.</div>
                </div>
              </div>
            </div>

            {/* DYNAMIC TOOL ROWS CARD */}
            <div className="card p-4 border-0 rounded-4 shadow-sm mb-4" style={{ background: "var(--card-bg)", border: "1px solid var(--border) !important" }}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: "var(--border)" }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="mono-tag" style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}>STACK // 02</span>
                  <h5 className="fw-bold m-0" style={{ color: "var(--text-h)" }}>SaaS Stack Configuration</h5>
                </div>
                
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                  onClick={handleAddRow}
                  style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}
                >
                  <span>➕</span> Add Tool Row
                </button>
              </div>

              {errorMsg && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small font-monospace" role="alert">
                  <span>⚠️</span> <div>{errorMsg}</div>
                </div>
              )}

              {/* Monospaced Table Header on Desktops */}
              <div className="row g-2 d-none d-md-flex text-start mb-2 px-2 text-muted fw-bold font-monospace" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                <div className="col-md-3">AI TOOL</div>
                <div className="col-md-3">ACTIVE PLAN</div>
                <div className="col-md-2">SEAT ALLOC</div>
                <div className="col-md-2">MONTHLY SPEND ($)</div>
                <div className="col-md-2 text-end">USE CASE</div>
              </div>

              {/* Dynamic Rows mapping */}
              {tools.map((row, index) => (
                <div
                  key={index}
                  className="p-3 mb-3 border rounded-3 position-relative transition-all"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge px-3 py-1.5 rounded-pill font-monospace" style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)", fontSize: "11px" }}>
                      TOOL_ROW #{index + 1}
                    </span>
                    
                    {tools.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 text-decoration-none small font-monospace d-flex align-items-center gap-1"
                        onClick={() => handleRemoveRow(index)}
                        style={{ fontSize: "12px" }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>

                  <div className="row g-2 text-start align-items-center">
                    
                    {/* 1. Tool Selection */}
                    <div className="col-md-3 col-12">
                      <select
                        className="form-select border"
                        style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-h)", fontSize: "14px" }}
                        value={row.tool}
                        onChange={(e) => handleToolChange(index, "tool", e.target.value)}
                      >
                        <option value="">-- Select Tool --</option>
                        {toolKeys.map((key) => (
                          <option key={key} value={key}>
                            {pricingData[key].name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Plan Selection */}
                    <div className="col-md-3 col-12">
                      <select
                        className="form-select border"
                        style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-h)", fontSize: "14px" }}
                        value={row.plan}
                        disabled={!row.tool}
                        onChange={(e) => handleToolChange(index, "plan", e.target.value)}
                      >
                        <option value="">-- Select Plan --</option>
                        {row.tool &&
                          pricingData[row.tool]?.plans.map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.name} (${p.price}/user)
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* 3. Seats Selection */}
                    <div className="col-md-2 col-6">
                      <input
                        type="number"
                        className="form-control border"
                        style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-h)", fontSize: "14px" }}
                        min="1"
                        value={row.seats}
                        onChange={(e) =>
                          handleToolChange(
                            index,
                            "seats",
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                      />
                    </div>

                    {/* 4. Monthly Spend Input */}
                    <div className="col-md-2 col-6">
                      <div className="input-group">
                        <span className="input-group-text border text-muted font-monospace" style={{ background: "var(--code-bg)", borderColor: "var(--border)", fontSize: "13px" }}>$</span>
                        <input
                          type="number"
                          className="form-control border"
                          style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-h)", fontSize: "14px" }}
                          min="0"
                          placeholder="0.00"
                          value={row.spend}
                          onChange={(e) =>
                            handleToolChange(
                              index,
                              "spend",
                              e.target.value === "" ? "" : parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* 5. Tool Specific Use Case */}
                    <div className="col-md-2 col-12">
                      <select
                        className="form-select border"
                        style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-h)", fontSize: "14px" }}
                        value={row.useCase}
                        onChange={(e) => handleToolChange(index, "useCase", e.target.value)}
                      >
                        <option value="coding">💻 Coding</option>
                        <option value="writing">✍️ Writing</option>
                        <option value="data">📊 Data Analytics</option>
                        <option value="research">🔍 Research</option>
                        <option value="mixed">🔄 General</option>
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* LIVE TALLY / TOTALS PANEL */}
            <div className="card p-4 border-0 rounded-4 mb-4 text-start shadow-sm" style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border) !important" }}>
              <div className="row align-items-center">
                <div className="col-md-6 mb-3 mb-md-0 font-monospace">
                  <span className="small text-muted uppercase tracking-wide">LIVE_LEDGER_TALLY</span>
                  <h3 className="fw-bold m-0" style={{ color: "var(--accent)", letterSpacing: "-1px" }}>
                    ${totalSpend.toLocaleString()}/mo
                  </h3>
                  <small className="text-muted">
                    Consolidating {totalSeatsInTools} user seats across AI profiles
                  </small>
                </div>
                <div className="col-md-6 text-md-end">
                  <button type="submit" className="btn btn-primary btn-lg px-5 fw-bold rounded-3 shadow" style={{ background: "var(--accent)", border: "0" }}>
                    Run LedgerAI Audit
                  </button>
                </div>
              </div>
            </div>

          </form>
          
        </div>
      </div>
    </div>
  );
};

export default SpendForm;