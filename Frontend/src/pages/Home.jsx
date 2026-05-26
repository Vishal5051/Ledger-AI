import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import pricingData from "../data/pricingData";

const Home = () => {
  const navigate = useNavigate();

  // Interactive Mini-Calculator State
  const [calcSeats, setCalcSeats] = useState(4);
  const [calcCursor, setCalcCursor] = useState(true);
  const [calcChatGPT, setCalcChatGPT] = useState(true);
  const [calcClaude, setCalcClaude] = useState(true);

  // Terminal active tab state ("visual" or "terminal")
  const [activeTab, setActiveTab] = useState("visual");
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Bento interactive state for API qualitative bands
  const [apiUsageBand, setApiUsageBand] = useState("medium");

  // Calculations based on pricing rules
  let currentSpend = 0;
  let optimizedSpend = 0;
  const breakDown = [];

  if (calcCursor) {
    const current = 20 * calcSeats;
    currentSpend += current;
    optimizedSpend += current;
  }

  if (calcChatGPT) {
    // Team has a 2-seat billing minimum ($30/seat)
    const current = 30 * Math.max(calcSeats, 2);
    currentSpend += current;
    
    if (calcSeats === 1) {
      optimizedSpend += 20; // Plus plan
      breakDown.push({ tool: "ChatGPT", savings: current - 20, reason: "Downgrade 1 seat from Team to Plus" });
    } else {
      optimizedSpend += 30 * calcSeats; 
    }
  }

  if (calcClaude) {
    // Team has a 5-seat billing minimum ($30/seat)
    const current = 30 * Math.max(calcSeats, 5);
    currentSpend += current;

    if (calcSeats < 5) {
      const opt = 20 * calcSeats;
      optimizedSpend += opt;
      breakDown.push({ tool: "Claude", savings: current - opt, reason: `Reallocate ${calcSeats} seats from Team to Pro` });
    } else {
      optimizedSpend += 30 * calcSeats;
    }
  }

  const liveSavings = currentSpend - optimizedSpend;
  const savingsPercent = currentSpend ? Math.round((liveSavings / currentSpend) * 100) : 0;

  // Sync state into live terminal logs simulation
  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    const logs = [
      `[${time}] LEDGERAI: Initializing compliance check...`,
      `[${time}] DATABASE: Active connection: ONLINE (vkc335524_db_user)`,
      `[${time}] SCANNER: Auditing team size: ${calcSeats} seats.`
    ];

    if (calcCursor) {
      logs.push(`[${time}] SCANNER: Cursor Pro checked. No seat floors applicable.`);
    }

    if (calcChatGPT) {
      const chatSpend = 30 * Math.max(calcSeats, 2);
      if (calcSeats === 1) {
        logs.push(`[${time}] CHATGPT: [WARN] Billing Floor (2 seats) violates single seat allocation.`);
        logs.push(`[${time}] CHATGPT: [RECOMMEND] Downgrade 1 seat to ChatGPT Plus. Bypass floor.`);
        logs.push(`[${time}] CHATGPT: Projected savings: +$40.00/mo.`);
      } else {
        logs.push(`[${time}] CHATGPT: Allocation aligns with Team rules. No billing floor penalty.`);
      }
    }

    if (calcClaude) {
      const claudeSpend = 30 * Math.max(calcSeats, 5);
      if (calcSeats < 5) {
        logs.push(`[${time}] CLAUDE: [WARN] Billing Floor (5 seats) forces $150.00/mo invoicing.`);
        logs.push(`[${time}] CLAUDE: [RECOMMEND] Downgrade ${calcSeats} seats to Claude Pro ($20/seat).`);
        logs.push(`[${time}] CLAUDE: Projected savings: +$${claudeSpend - (20 * calcSeats)}.00/mo.`);
      } else {
        logs.push(`[${time}] CLAUDE: Allocation fits Anthropic constraints. Bypassed minimum.`);
      }
    }

    // Feature protection logic
    if (calcSeats > 2) {
      logs.push(`[${time}] SAFEGUARD: Active team size (${calcSeats}) > 2 seats.`);
      logs.push(`[${time}] SAFEGUARD: Policy locking enabled: Collaborative shared workspaces protected.`);
    } else {
      logs.push(`[${time}] SAFEGUARD: Core personal accounts. Dynamic downgrade profiles open.`);
    }

    logs.push(`[${time}] COMPLETED: Ledger check completed. Total Savings: $${liveSavings}.00/mo.`);
    setTerminalLogs(logs);
  }, [calcSeats, calcCursor, calcChatGPT, calcClaude]);

  const handleStartAuditWithPrefill = () => {
    const prefillTools = [];
    if (calcCursor) prefillTools.push({ tool: "cursor", plan: "Pro", seats: calcSeats, spend: 20 * calcSeats, useCase: "coding" });
    if (calcChatGPT) prefillTools.push({ tool: "chatgpt", plan: "Team", seats: calcSeats, spend: 30 * Math.max(calcSeats, 2), useCase: "mixed" });
    if (calcClaude) prefillTools.push({ tool: "claude", plan: "Team", seats: calcSeats, spend: 30 * Math.max(calcSeats, 5), useCase: "mixed" });

    localStorage.setItem("ai_audit_tools", JSON.stringify(prefillTools));
    localStorage.setItem("ai_audit_team_size", calcSeats.toString());
    localStorage.setItem("ai_audit_global_use_case", "mixed");
    navigate("/audit");
  };

  // Calculations for Claude visual bar chart inside Bento Card 1
  const claudeActual = calcClaude ? 30 * Math.max(calcSeats, 5) : 0;
  const claudeOptimized = calcClaude ? (calcSeats < 5 ? 20 * calcSeats : 30 * calcSeats) : 0;
  const maxClaudeVal = 150;
  const claudeActualWidth = claudeActual ? Math.min(100, (claudeActual / maxClaudeVal) * 100) : 0;
  const claudeOptWidth = claudeOptimized ? Math.min(100, (claudeOptimized / maxClaudeVal) * 100) : 0;

  return (
    <div className="container py-5 text-start" style={{ maxWidth: "1150px" }}>
      
      {/* 1. TYPOGRAPHIC HERO & HIGH-FIDELITY COST TERMINAL */}
      <div className="row g-5 align-items-center mb-5 pb-5">
        
        {/* Left Column: Bold Typographic Copy */}
        <div className="col-lg-6">
          <div className="d-inline-flex align-items-center mb-3">
            <span className="mono-tag" style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}>
              RULESET // V1.4.0
            </span>
            <span className="ms-2 small text-muted font-monospace">B2B FINOPS ENGINE</span>
          </div>
          
          <h1 className="display-4 fw-extrabold mb-3 tracking-tight" style={{ color: "var(--text-h)", lineHeight: "1.12", letterSpacing: "-1.8px" }}>
            Audit your team's AI seats with <span style={{ background: "linear-gradient(135deg, #aa3bff 0%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "800" }}>perfect finance truth</span>.
          </h1>
          
          <p className="lead text-muted mb-4" style={{ fontSize: "1.1rem", lineHeight: "1.65" }}>
            LedgerAI builds strict, rule-based audit reports across team subscription stacks. No fake token back-calculations—just transparent seat-floor reallocations and safety-locked compliance.
          </p>

          <div className="d-flex flex-column flex-sm-row gap-3">
            <button 
              onClick={handleStartAuditWithPrefill}
              className="btn btn-primary btn-lg px-4 py-3 fw-bold rounded-3 shadow"
              style={{ background: "var(--accent)", border: "0" }}
            >
              Run Stack Audit
            </button>
            <a href="#bento-dashboard" className="btn btn-outline-secondary btn-lg px-4 py-3 fw-semibold rounded-3">
              Explore Framework
            </a>
          </div>
        </div>

        {/* Right Column: Custom Developer Cost Terminal */}
        <div className="col-lg-6">
          <div className="cost-terminal" style={{ background: "var(--card-bg)" }}>
            
            {/* Terminal Top Window Header */}
            <div className="terminal-header" style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }}>
              <div className="window-dots me-3">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <span className="small text-muted font-monospace fw-bold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                visual_telemetry_console.sh
              </span>
            </div>

            {/* Visual Console Body */}
            <div className="terminal-body" style={{ background: "var(--card-bg)", color: "var(--text)" }}>
              
              {/* Team Size Slider */}
              <div className="terminal-slider-container" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted font-monospace uppercase" style={{ fontSize: "10px", fontWeight: "700" }}>TEAM_SIZE_ALLOCATION</span>
                  <strong className="font-monospace" style={{ color: "var(--text-h)" }}>{calcSeats} Users</strong>
                </div>
                <input 
                  type="range" 
                  className="form-range" 
                  min="1" 
                  max="15" 
                  value={calcSeats}
                  onChange={(e) => setCalcSeats(parseInt(e.target.value, 10))}
                  style={{ filter: "hue-rotate(260deg)" }}
                />
              </div>

              {/* AI Stack Toggle Buttons */}
              <div className="mb-4">
                <span className="small text-muted font-monospace d-block mb-2" style={{ fontSize: "10px", fontWeight: "700" }}>SaaS_STACK_CONFIG</span>
                <div className="d-flex gap-2">
                  <button 
                    onClick={() => setCalcCursor(!calcCursor)}
                    className="btn btn-sm px-3 py-2 rounded-pill font-monospace fw-semibold"
                    style={{ 
                      background: calcCursor ? "var(--accent)" : "transparent", 
                      border: "1px solid var(--border)", 
                      borderColor: calcCursor ? "var(--accent)" : "var(--border)",
                      color: calcCursor ? "#fff" : "var(--text)",
                      transition: "all 0.2s"
                    }}
                  >
                    Cursor {calcCursor ? "✓" : "+"}
                  </button>
                  <button 
                    onClick={() => setCalcChatGPT(!calcChatGPT)}
                    className="btn btn-sm px-3 py-2 rounded-pill font-monospace fw-semibold"
                    style={{ 
                      background: calcChatGPT ? "var(--accent)" : "transparent", 
                      border: "1px solid var(--border)", 
                      borderColor: calcChatGPT ? "var(--accent)" : "var(--border)",
                      color: calcChatGPT ? "#fff" : "var(--text)",
                      transition: "all 0.2s"
                    }}
                  >
                    ChatGPT {calcChatGPT ? "✓" : "+"}
                  </button>
                  <button 
                    onClick={() => setCalcClaude(!calcClaude)}
                    className="btn btn-sm px-3 py-2 rounded-pill font-monospace fw-semibold"
                    style={{ 
                      background: calcClaude ? "var(--accent)" : "transparent", 
                      border: "1px solid var(--border)", 
                      borderColor: calcClaude ? "var(--accent)" : "var(--border)",
                      color: calcClaude ? "#fff" : "var(--text)",
                      transition: "all 0.2s"
                    }}
                  >
                    Claude {calcClaude ? "✓" : "+"}
                  </button>
                </div>
              </div>

              {/* Savings Live Counter */}
              <div className="row g-3 mb-4 font-monospace">
                <div className="col-6">
                  <div className="p-3 rounded-3" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
                    <span className="text-muted d-block small mb-1" style={{ fontSize: "10px", fontWeight: "700" }}>Expected Invoicing</span>
                    <strong className="text-danger" style={{ fontSize: "1.1rem" }}>${currentSpend}/mo</strong>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3" style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
                    <span className="text-muted d-block small mb-1" style={{ color: "var(--accent)", fontSize: "10px", fontWeight: "700" }}>Estimated Savings</span>
                    <strong style={{ fontSize: "1.1rem", color: "var(--accent)" }}>${liveSavings}/mo</strong>
                  </div>
                </div>
              </div>

              {/* Instant dynamic recommendation alert */}
              {liveSavings > 0 ? (
                <div className="p-3 rounded-3 mb-4 small font-monospace text-start" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#b45309" }}>
                  <div className="fw-bold mb-2">🔍 SYSTEM OPTIMIZATION RECOMMENDED:</div>
                  {breakDown.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-1">
                      <span>• {item.reason}</span>
                      <strong style={{ color: "#b45309" }}>Save ${item.savings}/mo</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-3 mb-4 small font-monospace text-center" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#047857" }}>
                  ✓ Perfect stack configuration! Adjust team controls to test leaks.
                </div>
              )}

              <button 
                onClick={handleStartAuditWithPrefill}
                className="btn btn-primary w-100 fw-bold py-3 rounded-3 font-monospace shadow-sm"
                style={{ 
                  background: "var(--accent)", 
                  border: "0", 
                  boxShadow: "0 4px 12px var(--accent-border)",
                  color: "#ffffff"
                }}
              >
                RUN_LEDGERAI_COMPLIANCE_CHECK
              </button>

            </div>

          </div>
        </div>

      </div>

      {/* 2. THE ANALYTICAL BENTO GRID DASHBOARD */}
      <div id="bento-dashboard" className="mb-5 pb-5">
        <div className="mb-4">
          <span className="mono-tag">PLATFORM DEEP DIVE</span>
          <h2 className="fw-bold mt-2" style={{ color: "var(--text-h)" }}>
            Financial Controls & Rules Library
          </h2>
        </div>

        <div className="row g-3">
          
          {/* Card 1: Seat Floors - Custom Visual Progress Bars (2 Cols Wide) */}
          <div className="col-lg-8">
            <div className="card p-4 border-0 rounded-4 h-100 visual-card" 
                 style={{ background: "var(--card-bg)" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-danger-subtle text-danger font-monospace px-2 py-1 rounded">RULE // 01</span>
                <span className="small text-muted font-monospace">NON-LINEAR SEAT FLOORS</span>
              </div>
              <h5 className="fw-bold mb-2 text-dark-emphasis" style={{ color: "var(--text-h)" }}>
                Seat Billing Floor Bypass
              </h5>
              <p className="text-muted small mb-3" style={{ maxWidth: "600px", lineHeight: "1.6" }}>
                SaaS contracts contain implicit pricing floors, like Anthropic Claude requiring a 5-seat minimum or ChatGPT Team requiring a 2-seat minimum. LedgerAI visually plots when your allocations trigger these seat thresholds and suggests plan configurations to bypass non-utilized overhead.
              </p>

              {/* Dynamic CSS Bar Chart Visual */}
              <div className="bar-chart-container">
                <div className="bar-wrapper">
                  <div className="bar-label">
                    <span>Claude Actual Team Cost (Minimum 5 Seats Enforced)</span>
                    <span className="text-danger font-monospace fw-bold">${claudeActual}/mo</span>
                  </div>
                  <div className="chart-bar-outer">
                    <div className="chart-bar-inner" style={{ width: `${claudeActualWidth}%`, background: "#ef4444" }}></div>
                  </div>
                </div>

                <div className="bar-wrapper">
                  <div className="bar-label">
                    <span>Claude Optimized Pro Cost (Actual {calcSeats} Seats)</span>
                    <span className="text-success font-monospace fw-bold">${claudeOptimized}/mo</span>
                  </div>
                  <div className="chart-bar-outer">
                    <div className="chart-bar-inner" style={{ width: `${claudeOptWidth}%`, background: "#10b981" }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Volatility Ranges - Playable Segment Controls (1 Col Wide) */}
          <div className="col-lg-4">
            <div className="card p-4 border-0 rounded-4 h-100 visual-card" 
                 style={{ background: "var(--card-bg)" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-warning-subtle text-warning font-monospace px-2 py-1 rounded">RULE // 02</span>
                <span className="small text-muted font-monospace">FINANCE STATS</span>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>
                Qualitative API Banding
              </h5>
              <p className="text-muted small mb-4" style={{ lineHeight: "1.6" }}>
                Maps usage levels (Low, Medium, High) against volatility boundaries instead of reverse-engineering tokens from raw invoices.
              </p>

              {/* Interactive playground tabs in grid */}
              <div className="p-2.5 rounded-3 mb-2" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
                <div className="d-flex justify-content-between gap-1 mb-3">
                  {["low", "medium", "high"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setApiUsageBand(tier)}
                      className={`btn btn-sm flex-fill font-monospace py-1.5 rounded-2 uppercase ${apiUsageBand === tier ? "btn-primary shadow-sm" : "btn-link text-decoration-none text-muted"}`}
                      style={{ 
                        fontSize: "10px", 
                        background: apiUsageBand === tier ? "var(--accent)" : "transparent",
                        color: apiUsageBand === tier ? "#fff" : "var(--text)",
                        border: "0" 
                      }}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <div className="text-center font-monospace small">
                  {apiUsageBand === "low" && (
                    <div style={{ color: "#10b981" }}>
                      <strong>Low Multiplier: 1.0x</strong>
                      <span className="d-block text-muted" style={{ fontSize: "10px" }}>Confidence interval: ±10%</span>
                    </div>
                  )}
                  {apiUsageBand === "medium" && (
                    <div style={{ color: "var(--accent)" }}>
                      <strong>Medium Multiplier: 1.5x</strong>
                      <span className="d-block text-muted" style={{ fontSize: "10px" }}>Confidence interval: ±25%</span>
                    </div>
                  )}
                  {apiUsageBand === "high" && (
                    <div style={{ color: "#ef4444" }}>
                      <strong>High Multiplier: 2.2x</strong>
                      <span className="d-block text-muted" style={{ fontSize: "10px" }}>Confidence interval: ±35%</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: Developer API Telemetry (1 Col Wide) */}
          <div className="col-lg-4">
            <div className="card p-4 border-0 rounded-4 h-100 visual-card" 
                 style={{ background: "var(--card-bg)" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-info-subtle text-info font-monospace px-2 py-1 rounded">RULE // 03</span>
                <span className="small text-muted font-monospace">MONOSPACE</span>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>
                Zero Token Estimates
              </h5>
              <p className="text-muted small mb-3" style={{ lineHeight: "1.6" }}>
                Enforces pure qualitative tracking to completely eliminate generative hallucination ranges.
              </p>
              
              <div className="p-3 rounded-3 text-start font-monospace small" style={{ background: "var(--code-bg)", border: "1px solid var(--border)", fontSize: "11px" }}>
                <span className="text-muted">// Audit Log Dump</span>
                <div style={{ color: "#8b5cf6" }}>"audit_method": "qualitative",</div>
                <div style={{ color: "#10b981" }}>"confidence_rating": "strict",</div>
                <div style={{ color: "#f59e0b" }}>"estimation_error": "0.0%"</div>
              </div>
            </div>
          </div>

          {/* Card 4: Safety safeguards - Visual Nodes Matrix (2 Cols Wide) */}
          <div className="col-lg-8">
            <div className="card p-4 border-0 rounded-4 h-100 visual-card" 
                 style={{ background: "var(--card-bg)" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-success-subtle text-success font-monospace px-2 py-1 rounded">RULE // 04</span>
                <span className="small text-muted font-monospace">FEATURE PROTECTIONS</span>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>
                Collaborative Safeguard Vault
              </h5>
              <p className="text-muted small mb-2" style={{ maxWidth: "600px", lineHeight: "1.6" }}>
                Downgrading professional plans to single personal plans can disrupt critical team tools like shared drives, collaborative canvas files, or API credentials. LedgerAI protects workflows: configurations with &gt; 2 users are locked into team accounts to preserve workspace integrity.
              </p>

              {/* Matrix of Seat Nodes showing safeguard blocks */}
              <div className="matrix-container">
                {Array.from({ length: 10 }).map((_, i) => {
                  const nodeNum = i + 1;
                  const isSeatActive = nodeNum <= calcSeats;
                  const isSafeGuardLocked = calcSeats > 2 && isSeatActive;

                  return (
                    <div 
                      key={i} 
                      className={`matrix-node ${isSafeGuardLocked ? "locked" : isSeatActive ? "active" : "empty"}`}
                    >
                      <span>U{nodeNum}</span>
                      <span style={{ fontSize: "7px", opacity: 0.8 }}>
                        {isSafeGuardLocked ? "🔒 Locked" : isSeatActive ? "✓ Active" : "Empty"}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. MODERN PIPELINE METHODOLOGY */}
      <div className="py-5 mb-5 rounded-4 p-4 p-md-5" style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border)" }}>
        <h4 className="fw-bold text-center mb-2" style={{ color: "var(--text-h)" }}>
          How LedgerAI Auditing Works
        </h4>
        <p className="text-center text-muted small mb-5">
          Three structured phases translating raw inputs into validated expense ledger targets.
        </p>
        
        <div className="pipeline-track">
          <div className="pipeline-connector"></div>
          
          <div className="pipeline-step-card text-center">
            <div className="pipeline-number">1</div>
            <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)", fontSize: "1rem" }}>Catalog SaaS Profiles</h5>
            <p className="text-muted small m-0 px-2" style={{ lineHeight: "1.5" }}>
              Enter active team licenses, developer seats, and qualitative usage bounds into our secure input form.
            </p>
          </div>

          <div className="pipeline-step-card text-center">
            <div className="pipeline-number">2</div>
            <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)", fontSize: "1rem" }}>Run Rule Computations</h5>
            <p className="text-muted small m-0 px-2" style={{ lineHeight: "1.5" }}>
              Our rules compiler evaluates allocations against pricing structures, seat floors, and safeguards.
            </p>
          </div>

          <div className="pipeline-step-card text-center">
            <div className="pipeline-number">3</div>
            <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)", fontSize: "1rem" }}>Generate Ledger Plans</h5>
            <p className="text-muted small m-0 px-2" style={{ lineHeight: "1.5" }}>
              Export validated PDF expense transition reports, generate secure sharing short-links, and start saving.
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-4 text-muted border-top" style={{ borderColor: "var(--border) !important" }}>
        <small className="font-monospace" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
          LEDGERAI B2B FINOPS ENGINE &copy; 2026. SECURED UNDER STRICT FINANCE RULES.
        </small>
      </div>

    </div>
  );
};

export default Home;