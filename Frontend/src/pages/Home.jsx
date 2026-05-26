import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container py-5 text-start" style={{ maxWidth: "1000px" }}>
      
      {/* HERO SECTION */}
      <div className="text-center py-5 mb-5 rounded-4 position-relative overflow-hidden" 
           style={{ 
             background: "radial-gradient(circle at top right, rgba(170, 59, 255, 0.08) 0%, transparent 60%)",
             border: "1px solid var(--border)",
             padding: "3rem 2rem"
           }}>
        
        <span className="badge text-white px-3 py-2 rounded-pill fw-bold mb-3 d-inline-block" 
              style={{ background: "linear-gradient(135deg, #aa3bff 0%, #c084fc 100%)", boxShadow: "0 4px 15px rgba(170, 59, 255, 0.2)" }}>
          💎 THE B2B AI FINOPS PLATFORM
        </span>
        
        <h1 className="display-3 fw-extrabold mb-3 tracking-tight" style={{ color: "var(--text-h)" }}>
          Audit, Consolidate & Scale with <span style={{ background: "linear-gradient(135deg, #aa3bff 0%, #c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "800" }}>LedgerAI</span>
        </h1>
        
        <p className="lead mx-auto text-muted mb-4" style={{ maxWidth: "750px", fontSize: "1.25rem", lineHeight: "1.6" }}>
          The intelligent financial operations engine that audits startup AI budgets, eliminates wasted seat licenses, enforces seat billing floors, and standardizes developer API usage with financially defensible rules.
        </p>

        <div className="d-flex justify-content-center gap-3 align-items-center">
          <Link to="/audit" className="btn btn-primary btn-lg px-5 py-3 fw-bold shadow-sm rounded-3">
            🚀 Initiate Cost Audit
          </Link>
          <a href="#how-it-works" className="btn btn-outline-secondary btn-lg px-4 py-3 fw-semibold rounded-3">
            Learn More
          </a>
        </div>
      </div>

      {/* DYNAMIC TELEMETRY STATISTICS GRID */}
      <div className="row g-4 mb-5 text-center">
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm rounded-4 h-100" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border) !important" }}>
            <h6 className="text-uppercase text-muted fw-bold small tracking-wider mb-2">Average Startup Savings</h6>
            <h3 className="display-6 fw-extrabold m-0" style={{ color: "var(--accent)" }}>$640 / mo</h3>
            <span className="text-muted small mt-2 d-block">Trapping ghost seat overheads</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm rounded-4 h-100" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border) !important" }}>
            <h6 className="text-uppercase text-muted fw-bold small tracking-wider mb-2">Credex Qualification</h6>
            <h3 className="display-6 fw-extrabold m-0 text-success" style={{ color: "#10b981" }}>84% Rate</h3>
            <span className="text-muted small mt-2 d-block">Securing startup portfolio credits</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm rounded-4 h-100" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border) !important" }}>
            <h6 className="text-uppercase text-muted fw-bold small tracking-wider mb-2">Analysis Framework</h6>
            <h3 className="display-6 fw-extrabold m-0 text-info" style={{ color: "#06b6d4" }}>100% Rule-Based</h3>
            <span className="text-muted small mt-2 d-block">Zero math hallucinations</span>
          </div>
        </div>
      </div>

      {/* CORE PLATFORM FEATURES */}
      <div className="mb-5">
        <h4 className="fw-bold mb-4 position-relative pb-2" style={{ color: "var(--text-h)", borderBottom: "2px solid var(--border)", display: "inline-block" }}>
          🛡️ The LedgerAI Advantage
        </h4>
        <div className="row g-4">
          
          <div className="col-md-6">
            <div className="d-flex gap-3 align-items-start p-3 rounded-4 hover-shadow transition-all" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
              <div className="fs-3 p-3 rounded-3" style={{ background: "rgba(170, 59, 255, 0.1)", color: "var(--accent)" }}>🛡️</div>
              <div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>Seat Floor Enforcement</h5>
                <p className="text-muted small">
                  Catches hidden non-linear vendor pricing policies (such as Anthropic Claude's 5-seat minimum or ChatGPT's 2-seat minimum billing) to prevent paying for ghost licenses.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex gap-3 align-items-start p-3 rounded-4 hover-shadow transition-all" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
              <div className="fs-3 p-3 rounded-3" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>📊</div>
              <div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>Usage Band Telemetry</h5>
                <p className="text-muted small">
                  Standardizes developer API spending (OpenAI, Anthropic, Gemini API) against 3-tier qualitative billing bands rather than unreliable, reverse-engineered token simulations.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex gap-3 align-items-start p-3 rounded-4 hover-shadow transition-all" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
              <div className="fs-3 p-3 rounded-3" style={{ background: "rgba(6, 182, 212, 0.1)", color: "#06b6d4" }}>🔄</div>
              <div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>Redundancy Audits</h5>
                <p className="text-muted small">
                  Flags cost overlaps across team stacks, matching usage focuses (e.g. coding vs design) and guiding consolidation to optimize overall SaaS portfolios.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex gap-3 align-items-start p-3 rounded-4 hover-shadow transition-all" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
              <div className="fs-3 p-3 rounded-3" style={{ background: "rgba(234, 88, 12, 0.1)", color: "#ea580c" }}>🤝</div>
              <div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>Feature Loss Protection</h5>
                <p className="text-muted small">
                  Prevents downgrading large teams (seats &gt; 2) to single individual accounts, guaranteeing collaborative unified workspace features remain intact.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div id="how-it-works" className="py-5 mb-5 rounded-4 p-4 p-md-5" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
        <h4 className="fw-bold text-center mb-5" style={{ color: "var(--text-h)" }}>
          ⚙️ How LedgerAI Audits Your Stack
        </h4>
        <div className="row g-4 text-center">
          
          <div className="col-md-4">
            <div className="p-4 rounded-4 h-100" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
              <div className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fw-bold mb-3">STEP 1</div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>Catalog Active Stack</h5>
              <p className="text-muted small m-0">
                Configure your team's active licensing, seat counts, and usage bands inside our visual catalog form.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 rounded-4 h-100" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
              <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold mb-3">STEP 2</div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>Algorithmic Audit</h5>
              <p className="text-muted small m-0">
                Our mathematical engine runs portfolio candidates against standard vendor plans and feature threshold constraints.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-4 rounded-4 h-100" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
              <div className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold mb-3">STEP 3</div>
              <h5 className="fw-bold mb-2" style={{ color: "var(--text-h)" }}>Deploy Savings Plan</h5>
              <p className="text-muted small m-0">
                Review your telemetry metrics, export structured PDF transition plans, and secure your Credex startup qualification.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-4 text-muted border-top" style={{ borderColor: "var(--border) !important" }}>
        <small>
          LedgerAI B2B SaaS FinOps Platform &copy; 2026. Powered by rule-based auditing 🚀
        </small>
      </div>

    </div>
  );
};

export default Home;