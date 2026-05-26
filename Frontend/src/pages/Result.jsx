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
            Connecting to secure servers to retrieve your shared LedgerAI cost audit report...
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
            We couldn't find any active LedgerAI cost audit configurations in your session or URL. Add your tools to start.
          </p>
          <button
            onClick={() => navigate("/audit")}
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
          >
            🚀 Create LedgerAI Audit
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
    <div className="container py-5 text-start" style={{ maxWidth: "1150px" }}>
      
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-5 gap-4">
        <div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="mono-tag" style={{ border: "1px solid var(--accent-border)", color: "var(--accent)", background: "var(--accent-bg)" }}>
              {isSharedView ? "🔗 Shared Workspace Report" : "📊 Real-Time Telemetry"}
            </span>
            {report.isCredexQualified && (
              <span className="mono-tag" 
                    style={{ 
                      background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%)", 
                      border: "1px solid rgba(168, 85, 247, 0.4)", 
                      color: "#c084fc",
                      boxShadow: "0 0 12px rgba(168, 85, 247, 0.15)" 
                    }}>
                🚀 Credex Startup Approved (Savings {" > "} $500/mo)
              </span>
            )}
            <span className="mono-tag">
              Confidence: {report.confidence || "high"}
            </span>
          </div>
          <h1 className="fw-extrabold m-0 text-start" style={{ fontSize: "36px", letterSpacing: "-1px", lineHeight: "1.15" }}>
            LedgerAI Stack Audit
          </h1>
          <p className="text-muted mt-2" style={{ fontSize: "15px" }}>
            Analyzing cloud stack optimization parameters for a workspace of <strong className="text-dark-emphasis">{auditData.teamSize} active seats</strong>.
          </p>
        </div>
        <div className="d-flex gap-3 align-self-md-center">
          {!isSharedView && (
            <button
              onClick={() => navigate("/audit")}
              className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold px-4 py-2"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-h)",
                background: "var(--card-bg)",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-h)";
              }}
            >
              ✏️ Adjust Stack
            </button>
          )}
          <button
            onClick={handleCopyShareLink}
            className={`btn ${shareCopied ? "btn-success" : "btn-primary"} d-flex align-items-center gap-2 fw-bold px-4 py-2`}
            style={{
              background: shareCopied ? "#10b981" : "var(--accent)",
              borderColor: shareCopied ? "#10b981" : "var(--accent)",
              boxShadow: shareCopied ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "0 4px 12px rgba(79, 70, 229, 0.25)",
              transition: "all 0.2s"
            }}
          >
            {shareCopied ? "✓ Link Copied" : "🔗 Share Audit"}
          </button>
        </div>
      </div>

      {/* OVERALL RECOMMENDATION BANNER */}
      <div 
        className="card border-0 p-4 mb-5 rounded-4 shadow-lg text-white"
        style={{
          background: savingsPct > 30 
            ? "linear-gradient(135deg, #1e1b4b 0%, #31106a 50%, #4c1d95 100%)"
            : "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08) !important",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
          pointerEvents: "none"
        }} />

        <div className="row align-items-center position-relative z-1">
          <div className="col-md-9 mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="mono-tag" style={{ border: "1px solid rgba(255, 255, 255, 0.2)", color: "rgba(255, 255, 255, 0.9)", background: "rgba(255, 255, 255, 0.07)", fontSize: "10px" }}>
                AUDITOR VERDICT
              </span>
            </div>
            <p className="lead fw-medium m-0 text-white-50" style={{ fontSize: "1.15rem", lineHeight: "1.6", color: "#cbd5e1" }}>
              "{report.overallRecommendation}"
            </p>
          </div>
          {savingsPct > 0 && (
            <div className="col-md-3 text-md-end border-start-md border-white-10">
              <span className="display-4 fw-extrabold text-white" style={{ letterSpacing: "-1.5px" }}>{savingsPct}%</span>
              <div className="small fw-semibold text-white-50" style={{ fontSize: "11px", letterSpacing: "1px" }}>WASTED BUDGET</div>
            </div>
          )}
        </div>
      </div>

      {/* METRIC CORE CARDS */}
      <div className="row g-4 mb-5">
        
        {/* Metric 1: Current Spend */}
        <div className="col-md-4">
          <div className="card p-4 border-0 rounded-4 text-start h-100 visual-card">
            <h6 className="fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "1px" }}>Current Expected Spend</h6>
            <h2 className="display-6 fw-bold m-0" style={{ color: "#ef4444", letterSpacing: "-1px" }}>
              ${totalMonthlySpend.toLocaleString()}/mo
            </h2>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border) !important" }}>
              <span className="text-muted font-monospace" style={{ fontSize: "12px" }}>
                Scenario: ${spendRange.min.toLocaleString()} - ${spendRange.max.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Optimized Spend */}
        <div className="col-md-4">
          <div className="card p-4 border-0 rounded-4 text-start h-100 visual-card">
            <h6 className="fw-semibold text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "1px" }}>Optimized Monthly Spend</h6>
            <h2 className="display-6 fw-bold m-0" style={{ color: "#10b981", letterSpacing: "-1px" }}>
              ${optimizedSpend.toLocaleString()}/mo
            </h2>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border) !important" }}>
              <span className="text-muted font-monospace" style={{ fontSize: "12px" }}>
                Scenario: ${optimizedMin.toLocaleString()} - ${optimizedMax.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Net Monthly Savings */}
        <div className="col-md-4">
          <div className="card p-4 border-0 rounded-4 text-start h-100 visual-card" 
               style={{ 
                 background: "var(--accent-bg)", 
                 border: "1px solid var(--accent-border)",
                 boxShadow: "0 10px 30px rgba(99, 102, 241, 0.05)"
               }}>
            <h6 className="fw-bold text-uppercase mb-2" style={{ color: "var(--accent)", fontSize: "11px", letterSpacing: "1px" }}>Net Monthly Savings</h6>
            <h2 className="display-5 fw-extrabold m-0" style={{ color: "var(--accent)", letterSpacing: "-1.5px" }}>
              ${totalEstimatedSavings.toLocaleString()}/mo
            </h2>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--accent-border) !important" }}>
              <span className="font-monospace fw-semibold" style={{ color: "var(--accent)", fontSize: "12px" }}>
                Projected: ${savingsRange.min.toLocaleString()} - ${savingsRange.max.toLocaleString()}/mo
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SAVINGS PROGRESS BAR GRAPHICS */}
      <div className="card p-4 border-0 rounded-4 mb-5 visual-card">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold m-0" style={{ color: "var(--text-h)", fontSize: "16px" }}>
            Allocation Optimization Breakdown
          </h5>
          <span className="mono-tag" style={{ border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
            Efficiency Index
          </span>
        </div>
        <div className="progress rounded-pill mb-3" style={{ height: "16px", background: "var(--code-bg)" }}>
          {savingsPct > 0 ? (
            <>
              <div 
                className="progress-bar d-flex align-items-center justify-content-center fw-bold text-white" 
                role="progressbar" 
                style={{ 
                  width: `${100 - savingsPct}%`, 
                  background: "linear-gradient(90deg, var(--accent) 0%, #6366f1 100%)",
                  borderRadius: "50px 0 0 50px"
                }}
                aria-valuenow={100 - savingsPct} 
                aria-valuemin="0" 
                aria-valuemax="100"
              />
              <div 
                className="progress-bar d-flex align-items-center justify-content-center fw-bold text-white" 
                role="progressbar" 
                style={{ 
                  width: `${savingsPct}%`, 
                  background: "#ef4444",
                  borderRadius: "0 50px 50px 0"
                }}
                aria-valuenow={savingsPct} 
                aria-valuemin="0" 
                aria-valuemax="100"
              />
            </>
          ) : (
            <div 
              className="progress-bar w-100 d-flex align-items-center justify-content-center fw-bold text-white" 
              role="progressbar" 
              style={{ background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)", borderRadius: "50px" }}
              aria-valuenow="100" 
              aria-valuemin="0" 
              aria-valuemax="100"
            />
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
          <div className="d-flex gap-3 text-muted" style={{ fontSize: "13px" }}>
            <span className="d-flex align-items-center gap-1.5">
              <span className="d-inline-block rounded-circle" style={{ width: "8px", height: "8px", background: "var(--accent)" }} />
              Optimized Stack ({100 - savingsPct}%)
            </span>
            {savingsPct > 0 && (
              <span className="d-flex align-items-center gap-1.5">
                <span className="d-inline-block rounded-circle" style={{ width: "8px", height: "8px", background: "#ef4444" }} />
                Cost Leakages ({savingsPct}%)
              </span>
            )}
          </div>
          <p className="text-muted small m-0">
            * Computed against rules configured within <code className="p-1 px-2">pricingData.js</code>.
          </p>
        </div>
      </div>

      {/* PORTFOLIO BREAKDOWN */}
      <div className="card p-4 border-0 rounded-4 mb-5 visual-card">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="fw-bold m-0" style={{ color: "var(--text-h)", fontSize: "16px" }}>
            Audited AI Stack Portfolio
          </h5>
          <span className="mono-tag">
            {report.tools.length} active integrations
          </span>
        </div>
        <div className="table-responsive">
          <table className="table align-middle m-0" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ color: "var(--text-h)", borderColor: "var(--border)" }}>
                <th className="py-3 ps-0" style={{ fontWeight: "600", fontSize: "13px" }}>Tool</th>
                <th className="py-3" style={{ fontWeight: "600", fontSize: "13px" }}>Focus</th>
                <th className="py-3" style={{ fontWeight: "600", fontSize: "13px" }}>Seats</th>
                <th className="py-3" style={{ fontWeight: "600", fontSize: "13px" }}>Current Plan</th>
                <th className="py-3" style={{ fontWeight: "600", fontSize: "13px" }}>Expected Cost</th>
                <th className="py-3" style={{ fontWeight: "600", fontSize: "13px" }}>Auditor Recommendation</th>
                <th className="py-3 text-end pe-0" style={{ fontWeight: "600", fontSize: "13px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.tools.map((item, idx) => {
                const prettyName = pricingData[item.tool]?.name || item.tool;
                const isOptimized = item.status === "optimized";
                return (
                  <tr key={idx} style={{ borderColor: "var(--border)" }}>
                    <td className="fw-bold py-3 ps-0" style={{ color: "var(--text-h)", fontSize: "14px" }}>
                      {prettyName}
                    </td>
                    <td className="py-3">
                      <span className="badge text-capitalize px-2.5 py-1" style={{ background: "var(--code-bg)", color: "var(--text-h)", border: "1px solid var(--border)", fontSize: "11px" }}>
                        {item.useCase}
                      </span>
                    </td>
                    <td className="py-3" style={{ fontSize: "14px" }}>{item.seats}</td>
                    <td className="py-3" style={{ fontSize: "14px" }}>{item.plan}</td>
                    <td className="fw-semibold py-3" style={{ color: "var(--text-h)", fontSize: "14px" }}>
                      ${item.spend.toLocaleString()}/mo
                    </td>
                    <td className="py-3" style={{ fontSize: "13px" }}>
                      {isOptimized ? (
                        <span className="fw-semibold" style={{ color: "#ef4444" }}>
                          🔄 Consolidation to {item.bestPlan} (Save ${item.potentialSavings}/mo)
                        </span>
                      ) : (
                        <span className="text-success fw-semibold">
                          ✓ Keep Current Plan
                        </span>
                      )}
                    </td>
                    <td className="text-end py-3 pe-0">
                      <span className="badge px-3 py-1.5 rounded-pill fw-bold" 
                            style={{ 
                              background: isOptimized ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
                              color: isOptimized ? "#ef4444" : "#10b981",
                              border: isOptimized ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(16, 185, 129, 0.2)",
                              fontSize: "11px"
                            }}>
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
          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "var(--text-h)", fontSize: "18px" }}>
            🛠️ Actionable Optimizations ({report.optimizations.length})
          </h4>

          {report.optimizations.length === 0 ? (
            <div className="card p-5 text-center rounded-4 border-0 visual-card">
              <div className="fs-1 mb-2">🎉</div>
              <h5 className="fw-bold" style={{ color: "var(--text-h)" }}>Your Stack is Fully Optimized</h5>
              <p className="text-muted m-0 small">
                Excellent! All your tools are on matching cost plans according to your seats allocation.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {report.optimizations.map((opt, index) => {
                const displayToolName = pricingData[opt.tool]?.name || opt.tool;
                
                return (
                  <div 
                    key={index}
                    className="card p-4 border-0 shadow-sm rounded-4 visual-card"
                    style={{
                      borderLeft: "4px solid var(--accent) !important"
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                      <div>
                        <span className="mono-tag me-2">
                          {displayToolName}
                        </span>
                        <span className="mono-tag" style={{ color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
                          REDUNDANCY DOWNGRADE
                        </span>
                      </div>
                      <div className="fw-extrabold fs-5" style={{ color: "var(--accent)" }}>
                        -${opt.savings}/mo
                      </div>
                    </div>
                    
                    <h5 className="fw-bold mb-2 text-start" style={{ color: "var(--text-h)", fontSize: "16px" }}>
                      Optimize plan for {displayToolName}
                    </h5>
                    
                    <p className="text-muted small mb-4 text-start" style={{ lineHeight: "1.6" }}>
                      {opt.reasoning}
                    </p>

                    <div className="p-3 rounded border d-flex justify-content-between align-items-center flex-wrap gap-3" 
                         style={{ background: "var(--code-bg)", borderColor: "var(--border) !important" }}>
                      <div className="text-start">
                        <span className="text-muted small d-block" style={{ fontSize: "11px" }}>RECOMMENDED ACTION</span>
                        <strong className="text-dark-emphasis small">Switch to {opt.recommendedPlan} Tier</strong>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold text-white" style={{ background: "var(--accent)" }}>
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
          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "var(--text-h)", fontSize: "18px" }}>
            📬 Export & Actions
          </h4>

          {/* Gated Lead Card */}
          <div 
            className="card p-4 border-0 rounded-4 text-start mb-4 visual-card"
            style={{ 
              background: "linear-gradient(180deg, var(--card-bg) 0%, var(--code-bg) 100%)",
              border: "1px solid var(--accent-border) !important"
            }}
          >
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-3" style={{ color: "var(--accent)", fontSize: "16px" }}>
              🚀 Lock In Your Savings Plan
            </h5>
            
            {isSubmitted ? (
              <div className="py-4 text-center">
                <div className="display-4 mb-3">✉️</div>
                <h5 className="fw-bold text-success">Report Dispatched</h5>
                <p className="text-muted small mb-4">
                  We've successfully emailed the full detailed spend report and optimization guide to <strong>{leadEmail}</strong>.
                </p>
                {emailPreviewUrl && (
                  <div className="mt-3 mb-2">
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill fw-bold d-inline-block mb-3" style={{ fontSize: "11px" }}>
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
                  className="btn btn-outline-secondary btn-sm mt-3 fw-semibold"
                  style={{ fontSize: "12px" }}
                >
                  Edit Email Address
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                <p className="text-muted small mb-4" style={{ lineHeight: "1.6" }}>
                  Get a complete professional PDF audit containing detailed transition blueprints, customized checklists, and licensing consolidation matrices.
                </p>

                <div className="mb-3">
                  <label htmlFor="leadName" className="form-label small fw-semibold text-muted" style={{ fontSize: "11px" }}>Full Name</label>
                  <input
                    type="text"
                    id="leadName"
                    className="form-control py-2"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}
                    required
                    placeholder="e.g. Vishal Kumar"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="leadEmail" className="form-label small fw-semibold text-muted" style={{ fontSize: "11px" }}>Work Email Address</label>
                  <input
                    type="email"
                    id="leadEmail"
                    className="form-control py-2"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}
                    required
                    placeholder="e.g. vishal@company.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-100 fw-bold py-2.5 shadow-sm"
                  style={{
                    background: "var(--accent)",
                    borderColor: "var(--accent)",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
                  }}
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
          <div className="card p-4 border-0 rounded-4 text-start visual-card">
            <h6 className="fw-semibold text-muted mb-2" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>Workspace Shared Link</h6>
            <p className="text-muted small mb-3" style={{ lineHeight: "1.5" }}>
              Give this secure encoded link to other administrators or financial leads to view this exact configured dashboard.
            </p>
            <div className="input-group">
              <input
                type="text"
                className="form-control text-truncate text-muted small bg-light border-0 py-2.5"
                style={{ fontSize: "12px", borderRadius: "8px 0 0 8px", background: "var(--code-bg) !important", border: "1px solid var(--border) !important" }}
                readOnly
                value={shareLinkUrl}
              />
              <button 
                className="btn btn-outline-secondary px-3"
                style={{ borderColor: "var(--border)", borderLeft: "none", borderRadius: "0 8px 8px 0", fontSize: "12px", fontWeight: "600" }}
                type="button"
                onClick={handleCopyShareLink}
              >
                {shareCopied ? "Copied" : "📋 Copy"}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Result;