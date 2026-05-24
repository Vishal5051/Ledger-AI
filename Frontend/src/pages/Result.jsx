import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { calculateAudit } from "../utils/auditEngine";
import pricingData from "../data/pricingData";
import axios from "axios";

const Result = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Helper to load initial state from URL or LocalStorage
  const getInitialAuditData = () => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");
    if (dataParam) {
      try {
        const decoded = decodeURIComponent(escape(atob(dataParam)));
        const parsed = JSON.parse(decoded);
        if (parsed && Array.isArray(parsed.tools)) {
          return {
            data: {
              tools: parsed.tools,
              teamSize: parseInt(parsed.teamSize, 10) || 5,
              globalUseCase: parsed.globalUseCase || "mixed"
            },
            isShared: true
          };
        }
      } catch (err) {
        console.error("Failed to parse shared audit URL token:", err);
      }
    }

    const savedTools = localStorage.getItem("ai_audit_tools");
    const savedTeamSize = localStorage.getItem("ai_audit_team_size");
    const savedGlobalUseCase = localStorage.getItem("ai_audit_global_use_case");

    if (savedTools) {
      try {
        const parsedTools = JSON.parse(savedTools);
        if (Array.isArray(parsedTools) && parsedTools.length > 0) {
          return {
            data: {
              tools: parsedTools,
              teamSize: parseInt(savedTeamSize, 10) || 5,
              globalUseCase: savedGlobalUseCase || "mixed"
            },
            isShared: false
          };
        }
      } catch (err) {
        console.error("Failed to parse local storage tools state:", err);
      }
    }

    return { data: null, isShared: false };
  };

  const initial = getInitialAuditData();

  // State to hold active audit parameters
  const [auditData, setAuditData] = useState(initial.data);
  const [isSharedView, setIsSharedView] = useState(initial.isShared);

  // Lead capture form state
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link sharing state
  const [shareCopied, setShareCopied] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [shareLinkUrl, setShareLinkUrl] = useState(() => {
    if (!initial.data) return "";
    const payload = JSON.stringify({
      tools: initial.data.tools,
      teamSize: initial.data.teamSize,
      globalUseCase: initial.data.globalUseCase
    });
    const encoded = btoa(unescape(encodeURIComponent(payload)));
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
  });

  // Sync share link URL if auditData changes
  useEffect(() => {
    if (auditData) {
      const payload = JSON.stringify({
        tools: auditData.tools,
        teamSize: auditData.teamSize,
        globalUseCase: auditData.globalUseCase
      });
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      setShareLinkUrl(`${window.location.origin}${window.location.pathname}?data=${encoded}`);
    }
  }, [auditData]);

  // Load audit data from URL query params (if shared) or LocalStorage (if standard flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");

    if (idParam) {
      setIsLoadingDb(true);
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      axios
        .get(`${apiBase}/api/audits/${idParam}`)
        .then((response) => {
          if (response.data && Array.isArray(response.data.tools)) {
            setAuditData({
              tools: response.data.tools,
              teamSize: parseInt(response.data.teamSize, 10) || 5,
              globalUseCase: response.data.globalUseCase || "mixed"
            });
            setIsSharedView(true);
          }
        })
        .catch((err) => {
          console.error("Failed to load audit config by ID:", err);
          // Catch and fallback to local storage
          const current = getInitialAuditData();
          setAuditData(current.data);
          setIsSharedView(current.isShared);
        })
        .finally(() => {
          setIsLoadingDb(false);
        });
      return;
    }

    const current = getInitialAuditData();
    setAuditData(current.data);
    setIsSharedView(current.isShared);
  }, [searchParams]);

  // If loading from database
  if (isLoadingDb) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "600px" }}>
        <div className="card p-5 shadow-lg border-0 rounded-4" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          <div className="spinner-border text-primary mb-4" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="fw-bold mb-3" style={{ color: "var(--text-h)" }}>Fetching Audit Report</h3>
          <p className="text-muted m-0">
            Connecting to secure servers to retrieve your shared AI spend audit report...
          </p>
        </div>
      </div>
    );
  }

  // If loading or no data
  if (!auditData) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "600px" }}>
        <div className="card p-5 shadow-lg border-0 rounded-4" style={{ background: "var(--bg)", border: "1px solid var(--border) !important" }}>
          <div className="fs-1 mb-3">⚠️</div>
          <h3 className="fw-bold mb-3" style={{ color: "var(--text-h)" }}>No Audit Active</h3>
          <p className="text-muted mb-4">
            We couldn't find any active spend audit configurations in your session or URL. Add your tools to start.
          </p>
          <button
            onClick={() => navigate("/audit")}
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
          >
            🚀 Create Spend Audit
          </button>
        </div>
      </div>
    );
  }

  // Calculate audit report
  const report = calculateAudit({
    tools: auditData.tools,
    teamSize: auditData.teamSize,
    globalUseCase: auditData.globalUseCase
  });

  const totalMonthlySpend = report.totalMonthlySpend;
  const totalEstimatedSavings = report.totalEstimatedSavings;
  const optimizedSpend = Math.max(0, totalMonthlySpend - totalEstimatedSavings);
  const savingsPct = totalMonthlySpend ? Math.round((totalEstimatedSavings / totalMonthlySpend) * 100) : 0;

  const confidence = report.confidence || "high";
  let variance = 0.10;
  if (confidence === "high") variance = 0.05;
  else if (confidence === "low") variance = 0.25;

  const spendRange = report.totalMonthlySpendRange || { min: totalMonthlySpend * (1 - variance), max: totalMonthlySpend * (1 + variance) };
  
  const minSavings = totalEstimatedSavings * (1 - variance);
  const maxSavings = totalEstimatedSavings * (1 + variance);
  const savingsRange = { min: minSavings, max: maxSavings };

  const optimizedMin = Math.max(0, spendRange.min - maxSavings);
  const optimizedMax = Math.max(0, spendRange.max - minSavings);

  // Handler: Generate and copy shareable URL (Database-backed or fallback to Base64)
  const handleCopyShareLink = async () => {
    const payloadObj = {
      tools: auditData.tools,
      teamSize: auditData.teamSize,
      globalUseCase: auditData.globalUseCase
    };

    try {
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      // Try to save to MongoDB backend to generate a clean short URL
      const response = await axios.post(`${apiBase}/api/audits`, payloadObj);
      if (response.data && response.data.success && response.data.id) {
        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${response.data.id}`;
        setShareLinkUrl(shareUrl);
        navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
        return;
      }
    } catch (e) {
      console.warn("Database-backed share generation failed or database offline. Falling back to local Base64 sharing.", e.message);
    }

    // Resilient Fallback: Generate Base64-encoded URL parameters (100% offline reliability)
    try {
      const payload = JSON.stringify(payloadObj);
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (e) {
      console.error("Failed to generate fallback share link", e);
    }
  };

  // Handler: Handle Lead Form Submission
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadEmail || !leadName) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:5000/api/leads", {
        name: leadName,
        email: leadEmail,
        teamSize: auditData.teamSize,
        globalUseCase: auditData.globalUseCase,
        tools: report.tools,
        totalMonthlySpend: report.totalMonthlySpend,
        totalEstimatedSavings: report.totalEstimatedSavings
      });

      if (response.data && response.data.success) {
        setIsSubmitted(true);
        if (response.data.emailPreviewUrl) {
          setEmailPreviewUrl(response.data.emailPreviewUrl);
        }
        localStorage.setItem("ai_audit_lead_submitted", "true");
      }
    } catch (err) {
      console.error("Failed to submit lead or dispatch report:", err);
      alert("Failed to submit lead and send report. Please ensure your backend server is running on Port 5000!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 text-start" style={{ maxWidth: "1100px" }}>
      
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold mb-2 d-inline-block">
            {isSharedView ? "🔗 Shared Workspace Report" : "📊 Real-Time Telemetry Report"}
          </span>
          {report.isCredexQualified && (
            <span className="badge text-white px-3 py-2 rounded-pill fw-bold mb-2 d-inline-block ms-md-2" 
                  style={{ background: "linear-gradient(135deg, #aa3bff 0%, #c084fc 100%)", boxShadow: "0 0 10px rgba(170, 59, 255, 0.3)" }}>
              🚀 Credex Qualified Startup ($500+/mo savings)
            </span>
          )}
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold mb-2 d-inline-block ms-md-2">
            🎯 Audit Confidence: <span className="text-capitalize text-primary fw-bold">{report.confidence || "high"}</span>
          </span>
          <h2 className="display-6 fw-bold m-0" style={{ color: "var(--text-h)" }}>
            AI Stack Audit Results
          </h2>
          <p className="text-muted m-0 mt-1">
            Analyzing stack optimization parameters for a team of <strong>{auditData.teamSize} seats</strong>.
          </p>
        </div>
        <div className="d-flex gap-2">
          {!isSharedView && (
            <button
              onClick={() => navigate("/audit")}
              className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold px-3"
            >
              ✏️ Adjust Stack
            </button>
          )}
          <button
            onClick={handleCopyShareLink}
            className={`btn ${shareCopied ? "btn-success" : "btn-primary"} d-flex align-items-center gap-2 fw-bold px-4`}
          >
            {shareCopied ? "✓ Link Copied!" : "🔗 Share Audit"}
          </button>
        </div>
      </div>

      {/* OVERALL RECOMMENDATION BANNER */}
      <div 
        className="card border-0 p-4 mb-4 rounded-4 shadow-sm text-white"
        style={{
          background: savingsPct > 30 
            ? "linear-gradient(135deg, #7928CA 0%, #B800B8 100%)"
            : "linear-gradient(135deg, #0061ff 0%, #60efff 100%)",
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-9 mb-3 mb-md-0">
            <h5 className="fw-bold mb-1">💡 Lead Auditor Verdict</h5>
            <p className="lead fw-semibold m-0 text-white-50" style={{ fontSize: "1.15rem" }}>
              "{report.overallRecommendation}"
            </p>
          </div>
          {savingsPct > 0 && (
            <div className="col-md-3 text-md-end">
              <span className="display-5 fw-extrabold text-white">{savingsPct}%</span>
              <div className="small fw-semibold text-white-50">WASTED BUDGET</div>
            </div>
          )}
        </div>
      </div>

      {/* METRIC CORE CARDS */}
      <div className="row g-4 mb-4">
        
        {/* Metric 1: Current Spend */}
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm rounded-4 text-start h-100" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border) !important" }}>
            <h6 className="fw-semibold text-muted text-uppercase mb-2 small tracking-wider">Current Expected Spend</h6>
            <h2 className="display-6 fw-bold m-0 text-danger" style={{ color: "#ef4444" }}>
              ${totalMonthlySpend.toLocaleString()}/mo
            </h2>
            <small className="text-muted mt-2 d-block font-monospace small">
              Scenario range: ${spendRange.min.toLocaleString()} - ${spendRange.max.toLocaleString()}
            </small>
          </div>
        </div>

        {/* Metric 2: Optimized Spend */}
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm rounded-4 text-start h-100" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border) !important" }}>
            <h6 className="fw-semibold text-muted text-uppercase mb-2 small tracking-wider">Optimized Monthly Spend</h6>
            <h2 className="display-6 fw-bold m-0 text-success" style={{ color: "#10b981" }}>
              ${optimizedSpend.toLocaleString()}/mo
            </h2>
            <small className="text-muted mt-2 d-block font-monospace small">
              Scenario range: ${optimizedMin.toLocaleString()} - ${optimizedMax.toLocaleString()}
            </small>
          </div>
        </div>

        {/* Metric 3: Net Monthly Savings */}
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-lg rounded-4 text-start h-100" 
               style={{ 
                 background: "rgba(170, 59, 255, 0.08)", 
                 border: "2px dashed var(--accent) !important",
                 boxShadow: "0 10px 30px rgba(170, 59, 255, 0.1)"
               }}>
            <h6 className="fw-bold text-uppercase mb-2 small tracking-wider" style={{ color: "var(--accent)" }}>Net Monthly Savings</h6>
            <h2 className="display-5 fw-extrabold m-0" style={{ color: "var(--accent)" }}>
              ${totalEstimatedSavings.toLocaleString()}/mo
            </h2>
            <small className="text-muted mt-2 d-block fw-semibold font-monospace small">
              Projected: ${savingsRange.min.toLocaleString()} - ${savingsRange.max.toLocaleString()}/mo
            </small>
          </div>
        </div>

      </div>

      {/* SAVINGS PROGRESS BAR GRAPHICS */}
      <div className="card p-4 shadow-sm border-0 rounded-4 mb-5" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border) !important" }}>
        <h5 className="fw-bold mb-3" style={{ color: "var(--text-h)" }}>📉 Allocation Optimization breakdown</h5>
        <div className="progress rounded-pill mb-3" style={{ height: "35px" }}>
          {savingsPct > 0 ? (
            <>
              <div 
                className="progress-bar bg-success d-flex align-items-center justify-content-center fw-bold fs-6" 
                role="progressbar" 
                style={{ width: `${100 - savingsPct}%`, background: "var(--accent) !important" }}
                aria-valuenow={100 - savingsPct} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {100 - savingsPct}% Optimized Stack
              </div>
              <div 
                className="progress-bar bg-danger d-flex align-items-center justify-content-center fw-bold fs-6" 
                role="progressbar" 
                style={{ width: `${savingsPct}%`, background: "#ef4444 !important" }}
                aria-valuenow={savingsPct} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {savingsPct}% Wasted
              </div>
            </>
          ) : (
            <div 
              className="progress-bar bg-success w-100 d-flex align-items-center justify-content-center fw-bold fs-6" 
              role="progressbar" 
              aria-valuenow="100" 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              100% Fully Optimized!
            </div>
          )}
        </div>
        <p className="text-muted small m-0">
          * Redundancy ratio is computed against standard market pricing rules configured within <code>pricingData.js</code>.
        </p>
      </div>

      {/* PORTFOLIO BREAKDOWN */}
      <div className="card p-4 shadow-sm border-0 rounded-4 mb-5" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border)" }}>
        <h5 className="fw-bold mb-3" style={{ color: "var(--text-h)" }}>📊 Audited AI Stack Portfolio</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ color: "var(--text-h)" }}>
                <th>Tool</th>
                <th>Focus</th>
                <th>Seats</th>
                <th>Current Plan</th>
                <th>Expected Cost</th>
                <th>Auditor Recommendation</th>
                <th className="text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.tools.map((item, idx) => {
                const prettyName = pricingData[item.tool]?.name || item.tool;
                const isOptimized = item.status === "optimized";
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="fw-bold" style={{ color: "var(--text-h)" }}>
                      {prettyName}
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary text-capitalize px-2 py-1">{item.useCase}</span>
                    </td>
                    <td>{item.seats}</td>
                    <td>{item.plan}</td>
                    <td className="fw-bold text-dark-emphasis">${item.spend.toLocaleString()}/mo</td>
                    <td>
                      {isOptimized ? (
                        <span className="text-warning small fw-semibold">
                          🔄 Switch to {item.bestPlan} (Save ${item.potentialSavings}/mo)
                        </span>
                      ) : (
                        <span className="text-success small fw-semibold">✓ Keep Current Plan</span>
                      )}
                    </td>
                    <td className="text-end">
                      <span className={`badge ${isOptimized ? "bg-warning-subtle text-warning border border-warning-subtle" : "bg-success-subtle text-success border border-success-subtle"} px-3 py-1.5 rounded-pill fw-bold`}>
                        {isOptimized ? "Optimizable" : "Optimal"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-4">
        
        {/* RECOMMENDATION BLOCK (LEFT COLUMN) */}
        <div className="col-lg-7">
          <h4 className="fw-bold mb-4" style={{ color: "var(--text-h)" }}>
            🛠️ Actionable Optimizations ({report.optimizations.length})
          </h4>

          {report.optimizations.length === 0 ? (
            <div className="card p-5 text-center rounded-4 border-0 shadow-sm" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border) !important" }}>
              <div className="fs-1 mb-2">🎉</div>
              <h5 className="fw-bold" style={{ color: "var(--text-h)" }}>Your Stack is Fully Optimized</h5>
              <p className="text-muted m-0">
                Excellent! All your tools are on matching cost plans according to your seats allocation.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {report.optimizations.map((opt, index) => {
                // Find pretty name for tool
                const displayToolName = pricingData[opt.tool]?.name || opt.tool;
                
                return (
                  <div 
                    key={index}
                    className="card p-4 border shadow-sm rounded-4"
                    style={{
                      background: "var(--bg)",
                      borderColor: "var(--border)",
                      borderLeft: "5px solid var(--accent) !important"
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 rounded me-2 fw-semibold">
                          {displayToolName}
                        </span>
                        <span className="badge bg-warning-subtle text-warning border px-2 py-1 rounded fw-semibold">
                          🔄 Consolidation Downgrade
                        </span>
                      </div>
                      <div className="fw-extrabold fs-5" style={{ color: "var(--accent)" }}>
                        -${opt.savings}/mo
                      </div>
                    </div>
                    
                    <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>
                      Optimize plan for {displayToolName}
                    </h5>
                    
                    <p className="text-muted small mb-3">
                      {opt.reasoning}
                    </p>

                    <div className="bg-light p-3 rounded border border-light-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small d-block">Recommended Action</span>
                        <strong className="text-dark small">Switch seats to {opt.recommendedPlan} Tier</strong>
                      </div>
                      <span className="badge bg-success px-3 py-2 rounded-pill fw-bold">
                        Save ${opt.savings * 12}/yr
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LEAD CAPTURE & persistence BOX (RIGHT COLUMN) */}
        <div className="col-lg-5">
          <h4 className="fw-bold mb-4" style={{ color: "var(--text-h)" }}>
            📬 Export & Actions
          </h4>

          {/* Gated Lead Card */}
          <div 
            className="card p-4 border-0 shadow-lg rounded-4 text-start mb-4"
            style={{ 
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--accent-border) !important",
              backgroundBlendMode: "overlay"
            }}
          >
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "var(--accent)" }}>
              🚀 Lock In Your Savings Plan
            </h5>
            
            {isSubmitted ? (
              <div className="py-4 text-center">
                <div className="display-4 mb-3">✉️</div>
                <h5 className="fw-bold text-success">Report Successfully Sent!</h5>
                <p className="text-muted small mb-3">
                  We've successfully emailed the full detailed spend report and optimization guide to <strong>{leadEmail}</strong>.
                </p>
                {emailPreviewUrl && (
                  <div className="mt-3 mb-2">
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill fw-bold d-inline-block mb-3">
                      🧪 Testing Mail Preview Available!
                    </span>
                    <a 
                      href={emailPreviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-warning w-100 fw-bold py-2 shadow-sm text-dark"
                    >
                      🔍 View Test Email Inbox ↗
                    </a>
                  </div>
                )}
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmailPreviewUrl(null);
                  }}
                  className="btn btn-outline-secondary btn-sm mt-3"
                >
                  Edit Email Address
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                <p className="text-muted small mb-4">
                  Get a complete professional PDF audit containing detailed transition blueprints, customized checklists, and licensing consolidation matrices.
                </p>

                <div className="mb-3">
                  <label htmlFor="leadName" className="form-label small fw-semibold text-muted">Full Name</label>
                  <input
                    type="text"
                    id="leadName"
                    className="form-control"
                    required
                    placeholder="e.g. Vishal Kumar"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="leadEmail" className="form-label small fw-semibold text-muted">Work Email Address</label>
                  <input
                    type="email"
                    id="leadEmail"
                    className="form-control"
                    required
                    placeholder="e.g. vishal@company.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-100 fw-bold py-3 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating PDF...
                    </>
                  ) : (
                    "✉️ Email Me Detailed Report"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Share Copy Information Panel */}
          <div className="card p-4 border-0 shadow-sm rounded-4 text-start" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border) !important" }}>
            <h6 className="fw-semibold text-muted mb-2">Workspace Shared Link</h6>
            <p className="text-muted small mb-3">
              Give this secure encoded link to other administrators or financial leads to view this exact configured dashboard.
            </p>
            <div className="input-group">
              <input
                type="text"
                className="form-control text-truncate text-muted small bg-light border-0"
                readOnly
                value={shareLinkUrl}
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={handleCopyShareLink}
              >
                {shareCopied ? "Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Result;