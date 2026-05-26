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

  // Calculate audit report early to avoid "use before define" or TDZ issues
  const report = auditData ? calculateAudit({
    tools: auditData.tools,
    teamSize: auditData.teamSize,
    globalUseCase: auditData.globalUseCase
  }) : null;

  // Lead capture form state
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PDF report download mock state
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Consultation booking mock state
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationName, setConsultationName] = useState("");
  const [consultationEmail, setConsultationEmail] = useState("");
  const [consultationDate, setConsultationDate] = useState("");
  const [consultationTime, setConsultationTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

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
          // Keep loader active briefly to simulate secure corporate handshake
          setTimeout(() => {
            setIsLoadingDb(false);
          }, 800);
        });
      return;
    }

    const current = getInitialAuditData();
    setAuditData(current.data);
    setIsSharedView(current.isShared);
  }, [searchParams]);

  // Handler: Generate and copy shareable URL (Database-backed or fallback to Base64)
  const handleCopyShareLink = async () => {
    if (!auditData) return;
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
    if (!leadEmail || !leadName || !report || !auditData) return;

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

  // Handler: Mock PDF Blueprint Download
  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      setPdfDownloaded(true);
      // Trigger browser print or download report mockup notice
      setTimeout(() => setPdfDownloaded(false), 3000);
      alert("Success! Your executive LedgerAI stack optimization plan has been compiled and is ready for download.");
    }, 2000);
  };

  // Handler: Mock Consultation Booking
  const handleScheduleConsultation = (e) => {
    e.preventDefault();
    if (!consultationName || !consultationEmail || !consultationDate || !consultationTime) return;

    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      setIsScheduled(true);
      setTimeout(() => {
        setIsConsultationModalOpen(false);
        setIsScheduled(false);
        setConsultationName("");
        setConsultationEmail("");
        setConsultationDate("");
        setConsultationTime("");
      }, 3500);
    }, 1500);
  };

  // Premium loading state: Render professional skeleton frames
  if (isLoadingDb) {
    return (
      <div className="container py-5 text-start" style={{ maxWidth: "1150px" }}>
        {/* Header Skeleton */}
        <div className="mb-5">
          <div className="skeleton-shimmer mb-3" style={{ width: "180px", height: "24px" }}></div>
          <div className="skeleton-shimmer mb-2" style={{ width: "350px", height: "42px" }}></div>
          <div className="skeleton-shimmer" style={{ width: "420px", height: "18px" }}></div>
        </div>

        {/* 4-Card Summary Grid Skeleton */}
        <div className="row g-4 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <div className="col-md-3" key={i}>
              <div className="card p-4 border-0 glass-card text-start h-100" style={{ minHeight: "160px" }}>
                <div className="skeleton-shimmer mb-3" style={{ width: "65%", height: "14px" }}></div>
                <div className="skeleton-shimmer mb-3" style={{ width: "85%", height: "36px" }}></div>
                <div className="skeleton-shimmer" style={{ width: "50%", height: "12px" }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Grid Skeleton */}
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="skeleton-shimmer mb-4" style={{ width: "240px", height: "28px" }}></div>
            {[1, 2].map((i) => (
              <div className="card p-4 border-0 glass-card mb-4" key={i} style={{ minHeight: "180px" }}>
                <div className="skeleton-shimmer mb-3" style={{ width: "35%", height: "16px" }}></div>
                <div className="skeleton-shimmer mb-3" style={{ width: "95%", height: "22px" }}></div>
                <div className="skeleton-shimmer" style={{ width: "80%", height: "14px" }}></div>
              </div>
            ))}
          </div>
          <div className="col-lg-5">
            <div className="skeleton-shimmer mb-4" style={{ width: "150px", height: "28px" }}></div>
            <div className="card p-4 border-0 glass-card" style={{ minHeight: "300px" }}>
              <div className="skeleton-shimmer mb-4" style={{ width: "70%", height: "22px" }}></div>
              <div className="skeleton-shimmer mb-3" style={{ width: "100%", height: "40px" }}></div>
              <div className="skeleton-shimmer mb-3" style={{ width: "100%", height: "40px" }}></div>
              <div className="skeleton-shimmer" style={{ width: "100%", height: "46px" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Premium empty state: Render a sleek fallback callout card redirecting to /audit
  if (!auditData || !auditData.tools || auditData.tools.length === 0 || !report) {
    return (
      <div className="container py-5 text-center d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <div className="card p-5 border-0 glass-card shadow-lg" style={{ maxWidth: "550px" }}>
          <div className="fs-1 mb-4" style={{ color: "var(--accent)" }}>🛡️</div>
          <h3 className="fw-extrabold mb-3" style={{ color: "var(--text-h)", fontSize: "24px" }}>No Audit Ledger Configured</h3>
          <p className="text-muted mb-4" style={{ fontSize: "14px", lineHeight: "1.6" }}>
            We couldn't detect any active AI tools or license configurations in your current session. Let's create your first secure cost ledger to begin optimizing your SaaS stack.
          </p>
          <button
            onClick={() => navigate("/audit")}
            className="btn btn-lg w-100 gradient-cta py-3"
            style={{ fontSize: "15px", letterSpacing: "0.5px" }}
          >
            🚀 Initialize New FinOps Audit
          </button>
        </div>
      </div>
    );
  }

  // Extract structured SaaS keys returned by auditEngine.js
  const {
    totalCurrentSpend,
    totalOptimizedSpend,
    totalSavings,
    savingsPercentage,
    recommendations,
    isCredexQualified,
    confidence,
    overallRecommendation,
    tools
  } = report;

  // Scenario boundaries for metrics variance displays
  let variance = confidence === "high" ? 0.05 : confidence === "medium" ? 0.10 : 0.25;
  const currentMin = totalCurrentSpend * (1 - variance);
  const currentMax = totalCurrentSpend * (1 + variance);
  const savingsMin = totalSavings * (1 - variance);
  const savingsMax = totalSavings * (1 + variance);
  const optimizedMin = Math.max(0, currentMin - savingsMax);
  const optimizedMax = Math.max(0, currentMax - savingsMin);

  return (
    <div className="container py-5 text-start" style={{ maxWidth: "1150px" }}>
      
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-5 gap-4">
        <div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="mono-tag" style={{ border: "1px solid var(--accent-border)", color: "var(--accent)", background: "var(--accent-bg)" }}>
              {isSharedView ? "🔗 Shared Workspace Report" : "📊 Real-Time Analytics"}
            </span>
            {isCredexQualified && (
              <span className="mono-tag" 
                    style={{ 
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(52, 211, 153, 0.07) 100%)", 
                      border: "1px solid rgba(16, 185, 129, 0.3)", 
                      color: "#10b981",
                      boxShadow: "0 0 12px rgba(16, 185, 129, 0.1)" 
                    }}>
                🚀 Credex FinOps Qualified (Savings &gt; $500/mo)
              </span>
            )}
            <span className="mono-tag">
              Confidence Score: {confidence.toUpperCase()}
            </span>
          </div>
          <h1 className="fw-extrabold m-0 text-start" style={{ fontSize: "36px", letterSpacing: "-1px", lineHeight: "1.15" }}>
            LedgerAI Spend Audit
          </h1>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: "15px" }}>
            Corporate optimization vectors compiled for <strong className="text-dark-emphasis">{auditData.teamSize} active seats</strong> under a <strong className="text-dark-emphasis">"{auditData.globalUseCase}"</strong> workspace focus.
          </p>
        </div>
        <div className="d-flex gap-3 align-self-md-center w-100 w-md-auto">
          {!isSharedView && (
            <button
              onClick={() => navigate("/audit")}
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 fw-semibold px-4 py-2.5 w-50 w-md-auto glass-card"
              style={{
                fontSize: "14px",
                color: "var(--text-h)"
              }}
            >
              ✏️ Adjust Stack
            </button>
          )}
          <button
            onClick={handleCopyShareLink}
            className={`btn d-flex align-items-center justify-content-center gap-2 fw-bold px-4 py-2.5 w-100 ${shareCopied ? "btn-success" : "gradient-cta"}`}
            style={{
              fontSize: "14px",
              background: shareCopied ? "#10b981 !important" : undefined,
              borderColor: shareCopied ? "#10b981 !important" : undefined,
              boxShadow: shareCopied ? "0 4px 14px 0 rgba(16, 185, 129, 0.25)" : undefined,
              width: isSharedView ? "100%" : "50%"
            }}
          >
            {shareCopied ? "✓ Link Copied" : "🔗 Share Audit"}
          </button>
        </div>
      </div>

      {/* OVERALL RECOMMENDATION BANNER */}
      <div 
        className="card border-0 p-4 mb-5 rounded-4 text-white"
        style={{
          background: savingsPercentage > 25 
            ? "linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #31106a 100%)"
            : "linear-gradient(135deg, #09090b 0%, #0f172a 60%, #1e293b 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08) !important",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
          pointerEvents: "none"
        }} />

        <div className="row align-items-center position-relative z-1">
          <div className="col-md-9 mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="mono-tag" style={{ border: "1px solid rgba(255, 255, 255, 0.15)", color: "rgba(255, 255, 255, 0.8)", background: "rgba(255, 255, 255, 0.05)", fontSize: "10px" }}>
                AUDITOR RECOMMENDATION
              </span>
            </div>
            <p className="lead fw-semibold m-0 text-white-50" style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#cbd5e1" }}>
              "{overallRecommendation}"
            </p>
          </div>
          {savingsPercentage > 0 && (
            <div className="col-md-3 text-md-end border-start-md border-white-10 ps-md-4">
              <span className="display-4 fw-extrabold text-white" style={{ letterSpacing: "-1.5px" }}>{Math.round(savingsPercentage)}%</span>
              <div className="small fw-bold text-white-50" style={{ fontSize: "11px", letterSpacing: "1px" }}>WASTED BUDGET</div>
            </div>
          )}
        </div>
      </div>

      {/* METRIC CORE CARDS (4-Card Summary Grid) */}
      <div className="row g-4 mb-5">
        
        {/* Metric 1: Total Current Spend */}
        <div className="col-6 col-lg-3">
          <div className="card p-4 border-0 glass-card text-start h-100">
            <h6 className="fw-bold text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Total Current Spend</h6>
            <h2 className="display-6 fw-extrabold m-0" style={{ color: "#ef4444", letterSpacing: "-1.2px", fontSize: "26px" }}>
              ${totalCurrentSpend.toLocaleString()}<span style={{ fontSize: "14px", fontWeight: "600", color: "#f87171" }}>/mo</span>
            </h2>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border) !important" }}>
              <span className="text-muted font-monospace" style={{ fontSize: "11px" }}>
                Est: ${Math.round(currentMin)} - ${Math.round(currentMax)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Optimized Spend */}
        <div className="col-6 col-lg-3">
          <div className="card p-4 border-0 glass-card text-start h-100">
            <h6 className="fw-bold text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Optimized Spend</h6>
            <h2 className="display-6 fw-extrabold m-0" style={{ color: "#10b981", letterSpacing: "-1.2px", fontSize: "26px" }}>
              ${totalOptimizedSpend.toLocaleString()}<span style={{ fontSize: "14px", fontWeight: "600", color: "#34d399" }}>/mo</span>
            </h2>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border) !important" }}>
              <span className="text-muted font-monospace" style={{ fontSize: "11px" }}>
                Est: ${Math.round(optimizedMin)} - ${Math.round(optimizedMax)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Savings */}
        <div className="col-6 col-lg-3">
          <div className="card p-4 border-0 glass-card text-start h-100" 
               style={{ 
                 background: "var(--accent-bg) !important", 
                 border: "1px solid var(--accent-border) !important"
               }}>
            <h6 className="fw-bold text-uppercase mb-2" style={{ color: "var(--accent)", fontSize: "11px", letterSpacing: "0.5px" }}>Total Savings</h6>
            <h2 className="display-6 fw-extrabold m-0" style={{ color: "var(--accent)", letterSpacing: "-1.2px", fontSize: "26px" }}>
              ${totalSavings.toLocaleString()}<span style={{ fontSize: "14px", fontWeight: "600", color: "#818cf8" }}>/mo</span>
            </h2>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--accent-border) !important" }}>
              <span className="font-monospace fw-semibold" style={{ color: "var(--accent)", fontSize: "11px" }}>
                Annually: ${(totalSavings * 12).toLocaleString()}/yr
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Savings % */}
        <div className="col-6 col-lg-3">
          <div className="card p-4 border-0 glass-card text-start h-100">
            <h6 className="fw-bold text-muted text-uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Savings Efficiency</h6>
            <h2 className="display-6 fw-extrabold m-0" style={{ color: "#d97706", letterSpacing: "-1.2px", fontSize: "26px" }}>
              {Math.round(savingsPercentage)}%
            </h2>
            <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border) !important" }}>
              <span className="text-muted font-monospace" style={{ fontSize: "11px" }}>
                {savingsPercentage > 0 ? "Potential budget recovered" : "No leakages detected"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SAVINGS PROGRESS BAR GRAPHICS */}
      <div className="card p-4 border-0 glass-card mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold m-0" style={{ color: "var(--text-h)", fontSize: "16px" }}>
            Allocation Optimization Breakdown
          </h5>
          <span className="mono-tag" style={{ border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
            Efficiency Index
          </span>
        </div>
        <div className="progress rounded-pill mb-3" style={{ height: "16px", background: "var(--code-bg)" }}>
          {savingsPercentage > 0 ? (
            <>
              <div 
                className="progress-bar d-flex align-items-center justify-content-center fw-bold text-white" 
                role="progressbar" 
                style={{ 
                  width: `${100 - savingsPercentage}%`, 
                  background: "linear-gradient(90deg, var(--accent) 0%, #6366f1 100%)",
                  borderRadius: "50px 0 0 50px"
                }}
                aria-valuenow={100 - savingsPercentage} 
                aria-valuemin="0" 
                aria-valuemax="100"
              />
              <div 
                className="progress-bar d-flex align-items-center justify-content-center fw-bold text-white" 
                role="progressbar" 
                style={{ 
                  width: `${savingsPercentage}%`, 
                  background: "#ef4444",
                  borderRadius: "0 50px 50px 0"
                }}
                aria-valuenow={savingsPercentage} 
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
              Optimized Stack ({Math.round(100 - savingsPercentage)}%)
            </span>
            {savingsPercentage > 0 && (
              <span className="d-flex align-items-center gap-1.5">
                <span className="d-inline-block rounded-circle" style={{ width: "8px", height: "8px", background: "#ef4444" }} />
                Cost Leakages ({Math.round(savingsPercentage)}%)
              </span>
            )}
          </div>
          <p className="text-muted small m-0">
            * Computed against rules configured within <code className="p-1 px-2">pricingData.js</code>.
          </p>
        </div>
      </div>

      {/* TOOL-WISE BREAKDOWN (Cards Grid Layout) */}
      <h5 className="fw-bold mb-4" style={{ color: "var(--text-h)", fontSize: "18px" }}>
        🛠️ Audited Tool Breakdown ({tools.length} active integrations)
      </h5>
      <div className="row g-4 mb-5">
        {tools.map((item, idx) => {
          const prettyName = pricingData[item.tool]?.name || item.tool || "AI Tool";
          const isOptimal = item.status !== "optimized";
          
          return (
            <div className="col-12 col-md-6 col-lg-4" key={idx}>
              <div className="card p-4 border-0 glass-card h-100 text-start d-flex flex-column justify-content-between">
                <div>
                  {/* Tool Header */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3 fw-bold text-white shadow-sm"
                      style={{
                        width: "48px",
                        height: "48px",
                        fontSize: "18px",
                        background: isOptimal 
                          ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                          : "linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)",
                      }}
                    >
                      {prettyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="fw-extrabold m-0" style={{ color: "var(--text-h)", fontSize: "16px" }}>{prettyName}</h5>
                      <div className="d-flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="mono-tag" style={{ fontSize: "8px", padding: "1px 5px" }}>{item.useCase}</span>
                        <span className="mono-tag" style={{ fontSize: "8px", padding: "1px 5px", background: "var(--card-bg)" }}>{item.plan}</span>
                      </div>
                    </div>
                  </div>

                  {/* Spend Details Box */}
                  <div className="p-3 rounded-3 mb-3" style={{ background: "var(--code-bg)", border: "1px solid var(--border)" }}>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: "13px" }}>
                      <span className="text-muted">Current Spend:</span>
                      <span className="fw-semibold text-danger">${item.spend.toLocaleString()}/mo</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: "13px" }}>
                      <span className="text-muted">Optimized Spend:</span>
                      <span className="fw-semibold text-success">${(item.spend - item.potentialSavings).toLocaleString()}/mo</span>
                    </div>
                    {item.potentialSavings > 0 && (
                      <div className="d-flex justify-content-between pt-2 border-top" style={{ fontSize: "13px", borderColor: "var(--border) !important" }}>
                        <span className="fw-bold text-muted">Monthly Savings:</span>
                        <span className="fw-extrabold text-success">+${item.potentialSavings.toLocaleString()}/mo</span>
                      </div>
                    )}
                  </div>

                  {/* Bar Comparison Progress Chart */}
                  {item.potentialSavings > 0 && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: "11px" }}>
                        <span>Stack Efficiency:</span>
                        <span>{Math.round(((item.spend - item.potentialSavings) / item.spend) * 100)}%</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: "6px", background: "var(--border)" }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ 
                            width: `${Math.round(((item.spend - item.potentialSavings) / item.spend) * 100)}%`, 
                            background: "var(--accent)", 
                            borderRadius: "50px" 
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Footing */}
                <div className="pt-3 border-top mt-auto" style={{ borderColor: "var(--border) !important" }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="small text-muted" style={{ fontSize: "11px" }}>STATUS</span>
                    <span className="badge px-2.5 py-1 rounded-pill fw-bold" 
                          style={{ 
                            background: isOptimal ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                            color: isOptimal ? "#10b981" : "#ef4444",
                            border: isOptimal ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                            fontSize: "10px"
                          }}>
                      {isOptimal ? "Optimal Stack" : "Optimization Available"}
                    </span>
                  </div>
                  {!isOptimal && (
                    <p className="text-muted mt-2 small text-start" style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                      💡 Recommended: Switch to <strong>{item.bestPlan} Plan</strong> for seat size {item.seats}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row g-4">
        
        {/* RECOMMENDATION BLOCK (LEFT COLUMN) */}
        <div className="col-lg-7">
          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "var(--text-h)", fontSize: "18px" }}>
            ⚡ Actionable Optimizations ({recommendations.length})
          </h4>

          {recommendations.length === 0 ? (
            <div className="card p-5 text-center border-0 glass-card">
              <div className="fs-1 mb-2">🎉</div>
              <h5 className="fw-bold" style={{ color: "var(--text-h)" }}>Your Stack is Fully Optimized</h5>
              <p className="text-muted m-0 small">
                Excellent! All your tools are on matching cost plans according to your seats allocation.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {recommendations.map((opt, index) => {
                const displayToolName = pricingData[opt.tool]?.name || opt.tool || "AI Tool";
                
                // Classify dynamic badge colors and tags
                const badgeClass = 
                  opt.type === "REDUNDANCY" ? "badge-redundancy" :
                  opt.type === "DOWNGRADE" ? "badge-downgrade" :
                  opt.type === "SEAT_OPTIMIZATION" ? "badge-seat" : "badge-cost";

                const displayBadgeText = 
                  opt.type === "SEAT_OPTIMIZATION" ? "SEAT OPTIMIZATION" : 
                  opt.type === "COST_CUT" ? "COST CUT" : opt.type;

                return (
                  <div 
                    key={index}
                    className="card p-4 border-0 glass-card shadow-sm text-start"
                    style={{
                      borderLeft: `4px solid ${
                        opt.type === "REDUNDANCY" ? "#4f46e5" : 
                        opt.type === "DOWNGRADE" ? "#d97706" : 
                        opt.type === "SEAT_OPTIMIZATION" ? "#0284c7" : "#e11d48"
                      } !important`
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                      <div>
                        <span className={`badge px-2.5 py-1 rounded-1 me-2 ${badgeClass}`}>
                          {displayBadgeText}
                        </span>
                        <span className="mono-tag" style={{ fontSize: "10px" }}>
                          {displayToolName}
                        </span>
                      </div>
                      <div className="fw-extrabold fs-5" style={{ color: "var(--accent)" }}>
                        -${opt.monthlySavings.toFixed(2)}/mo
                      </div>
                    </div>
                    
                    <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)", fontSize: "16px" }}>
                      {opt.title}
                    </h5>
                    
                    <p className="text-muted small mb-4" style={{ lineHeight: "1.6" }}>
                      {opt.description}
                    </p>

                    <div className="p-3 rounded border d-flex justify-content-between align-items-center flex-wrap gap-3" 
                         style={{ background: "var(--code-bg)", borderColor: "var(--border) !important" }}>
                      <div>
                        <span className="text-muted small d-block" style={{ fontSize: "11px" }}>RECOMMENDED ACTION</span>
                        <strong className="text-dark-emphasis small">
                          {opt.type === "REDUNDANCY" ? "Consolidate tool licensing" : "Downgrade Pricing Tier"}
                        </strong>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill fw-bold text-white" style={{ background: "var(--accent)" }}>
                        Save ${(opt.monthlySavings * 12).toFixed(2)}/yr
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LEAD CAPTURE & ACTIONS PANEL (RIGHT COLUMN) */}
        <div className="col-lg-5">
          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: "var(--text-h)", fontSize: "18px" }}>
            📬 Export & FinOps Actions
          </h4>

          {/* Lead Capture Gated Card */}
          <div 
            className="card p-4 border-0 text-start mb-4 glass-card"
            style={{ 
              background: "linear-gradient(180deg, var(--card-bg) 0%, var(--code-bg) 100%) !important",
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
                  className="btn gradient-cta w-100 py-2.5"
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

          {/* Quick Shareable Copy Info Panel */}
          <div className="card p-4 border-0 rounded-4 text-start glass-card mb-4">
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
            
            {/* Download Report Trigger Block (UI only) */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="btn btn-outline-secondary w-100 mt-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: "13px", borderColor: "var(--border)" }}
            >
              {isDownloadingPdf ? (
                <>
                  <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>
                  Compiling PDF Report...
                </>
              ) : pdfDownloaded ? (
                "✓ PDF Blueprint Downloaded"
              ) : (
                "📥 Download PDF Blueprint (UI-Only)"
              )}
            </button>
          </div>

          {/* Book Consultation Growth CTA Panel */}
          <div className="card p-4 border-0 rounded-4 text-start glass-card"
               style={{
                 background: "linear-gradient(135deg, rgba(79, 70, 229, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)",
                 border: "1px solid rgba(79, 70, 229, 0.25) !important"
               }}>
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-2" style={{ color: "var(--accent)", fontSize: "15px" }}>
              📅 Free FinOps Stack Review
            </h5>
            <p className="text-muted small mb-4" style={{ fontSize: "12.5px", lineHeight: "1.5" }}>
              Book a 15-minute consultation with a LedgerAI cloud accounting expert to build a personalized consolidation blueprint, audit custom enterprise contracts, and unlock up to 45% additional savings.
            </p>
            <button
              onClick={() => setIsConsultationModalOpen(true)}
              className="btn gradient-cta w-100 py-2.5"
              style={{ fontSize: "13px" }}
            >
              📅 Schedule Consultation Call
            </button>
          </div>

        </div>

      </div>

      {/* Premium Interactive Modal: Book consultation Call */}
      {isConsultationModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
            <div className="modal-content border-0 glass-card p-2" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0 pb-0 justify-content-between align-items-center">
                <h5 className="modal-title fw-extrabold" style={{ color: "var(--text-h)", fontSize: "18px" }}>
                  Schedule 15-Min Stack Review
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setIsConsultationModalOpen(false)}
                  aria-label="Close"
                  style={{ fontSize: "12px" }}
                ></button>
              </div>
              <div className="modal-body py-4">
                {isScheduled ? (
                  <div className="text-center py-4">
                    <div className="fs-1 mb-3">🎉</div>
                    <h5 className="fw-bold text-success">Consultation Confirmed!</h5>
                    <p className="text-muted small m-0 px-2" style={{ lineHeight: "1.5" }}>
                      Excellent! Your stack review is scheduled with a Senior FinOps Accountant. A secure calendar invite and video invitation link have been sent to <strong>{consultationEmail}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleScheduleConsultation}>
                    <p className="text-muted small mb-4 text-start" style={{ lineHeight: "1.5" }}>
                      Select your preferred calendar slots. Our expert will walk through your stack, negotiate enterprise discounts, and finalize your licensing architecture.
                    </p>
                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold text-muted" style={{ fontSize: "11px" }}>Your Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        placeholder="e.g. Vishal Kumar"
                        style={{ fontSize: "13px", borderRadius: "8px" }}
                        value={consultationName}
                        onChange={(e) => setConsultationName(e.target.value)}
                      />
                    </div>
                    <div className="mb-3 text-start">
                      <label className="form-label small fw-semibold text-muted" style={{ fontSize: "11px" }}>Work Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        required
                        placeholder="e.g. vishal@company.com"
                        style={{ fontSize: "13px", borderRadius: "8px" }}
                        value={consultationEmail}
                        onChange={(e) => setConsultationEmail(e.target.value)}
                      />
                    </div>
                    <div className="row g-3 mb-4 text-start">
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted" style={{ fontSize: "11px" }}>Select Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          required
                          style={{ fontSize: "13px", borderRadius: "8px" }}
                          value={consultationDate}
                          onChange={(e) => setConsultationDate(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted" style={{ fontSize: "11px" }}>Preferred Time</label>
                        <input 
                          type="time" 
                          className="form-control" 
                          required
                          style={{ fontSize: "13px", borderRadius: "8px" }}
                          value={consultationTime}
                          onChange={(e) => setConsultationTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isScheduling} 
                      className="btn gradient-cta w-100 py-2.5 fw-bold"
                      style={{ fontSize: "13px" }}
                    >
                      {isScheduling ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Securing Calendar Slot...
                        </>
                      ) : (
                        "Confirm Consultation Booking"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Result;