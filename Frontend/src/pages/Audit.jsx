import React from "react";
import SpendForm from "../components/SpendForm";

const Audit = () => {
  return (
    <div className="container py-5 text-center" style={{ fontFamily: "var(--sans)" }}>
      {/* Premium Header Section */}
      <div className="mb-5">
        <span 
          className="badge px-3 py-2 rounded-pill font-monospace uppercase tracking-wider mb-3 shadow-sm"
          style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)", fontSize: "11px" }}
        >
          ⚡ PLATFORM // AUDIT ENGINE
        </span>
        <h1 
          className="fw-extrabold mb-2" 
          style={{ 
            color: "var(--text-h)", 
            fontFamily: "Outfit, sans-serif",
            fontSize: "2.5rem",
            letterSpacing: "-1px"
          }}
        >
          Optimize Your Startup's AI Spend
        </h1>
        <p className="text-muted mx-auto" style={{ maxWidth: "600px", fontSize: "16px" }}>
          Audit active subscriptions, detect seat wastage, and uncover instant B2B cost-saving opportunities in under 60 seconds.
        </p>
      </div>
      
      {/* Centralized Audit Spend Form */}
      <SpendForm />
    </div>
  );
};

export default Audit;