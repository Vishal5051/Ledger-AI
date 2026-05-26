import React from "react";
import { Link, useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const location = useLocation();

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* STICKY GLASSMORPHIC NAVBAR */}
      <nav 
        className="navbar navbar-expand navbar-light px-4 py-3 sticky-top"
        style={{ 
          background: "rgba(255, 255, 255, 0.85)", 
          backdropFilter: "blur(14px)", 
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          zIndex: 1030
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center" style={{ maxWidth: "1200px", padding: 0 }}>
          <Link className="navbar-brand fw-extrabold d-flex align-items-center gap-2 m-0 fs-5" to="/" style={{ color: "var(--text-h)", letterSpacing: "-0.5px" }}>
            <span className="brand-logo-text">LedgerAI</span>
            <span className="fs-6">💰</span>
          </Link>

          <div className="d-flex gap-4">
            <Link 
              className="nav-link text-decoration-none transition-all fs-6" 
              to="/" 
              style={{ 
                color: isLinkActive("/") ? "var(--text-h)" : "var(--text)", 
                fontWeight: isLinkActive("/") ? "700" : "500",
                borderBottom: isLinkActive("/") ? "2px solid var(--accent)" : "2px solid transparent",
                paddingBottom: "4px"
              }}
            >
              Home
            </Link>

            <Link 
              className="nav-link text-decoration-none transition-all fs-6" 
              to="/audit" 
              style={{ 
                color: isLinkActive("/audit") ? "var(--text-h)" : "var(--text)", 
                fontWeight: isLinkActive("/audit") ? "700" : "500",
                borderBottom: isLinkActive("/audit") ? "2px solid var(--accent)" : "2px solid transparent",
                paddingBottom: "4px"
              }}
            >
              Audit
            </Link>

            <Link 
              className="nav-link text-decoration-none transition-all fs-6" 
              to="/result" 
              style={{ 
                color: isLinkActive("/result") ? "var(--text-h)" : "var(--text)", 
                fontWeight: isLinkActive("/result") ? "700" : "500",
                borderBottom: isLinkActive("/result") ? "2px solid var(--accent)" : "2px solid transparent",
                paddingBottom: "4px"
              }}
            >
              Results
            </Link>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="flex-grow-1" style={{ width: "100%", background: "var(--bg)", transition: "background 0.3s" }}>
        {children}
      </div>

    </div>
  );
};

export default MainLayout;