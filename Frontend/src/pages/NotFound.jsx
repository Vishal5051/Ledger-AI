import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container py-5 text-center d-flex align-items-center justify-content-center min-vh-100">
      <div className="row justify-content-center w-100">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 p-4 p-sm-5 bg-white">
            <div className="card-body">
              {/* Emoticon / Icon */}
              <div className="display-1 text-danger mb-4" style={{ fontSize: "5rem" }}>
                🔍🚫
              </div>
              
              {/* 404 Error code */}
              <h1 className="display-4 fw-bold text-dark mb-2">404</h1>
              
              {/* Error title */}
              <h2 className="h4 fw-semibold text-secondary mb-3">
                Page Not Found
              </h2>
              
              {/* Friendly description */}
              <p className="text-muted mb-4 px-md-3">
                It looks like the page you are trying to find doesn't exist or has been audited out of existence.
              </p>
              
              {/* Back to Home CTA */}
              <Link to="/" className="btn btn-primary btn-lg w-100 py-3 rounded-3 fw-bold shadow-sm">
                Back to Home 🏠
              </Link>
            </div>
          </div>
          
          {/* Subtle footer */}
          <div className="text-muted mt-4">
            <small>LedgerAI 💰</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
