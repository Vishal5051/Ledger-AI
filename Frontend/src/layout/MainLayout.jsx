import React from "react";
import { Link } from "react-router-dom";

const MainLayout = ({ children }) => {
    return (
        <div>

            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark px-4"
                style={{ background: "#0f172a" }}>
                <Link className="navbar-brand fw-bold" to="/">
                    AI Spend Audit 💰
                </Link>

                <div className="ms-auto d-flex gap-3">
                    <Link className="nav-link text-white fw-semibold" to="/">
                        Home
                    </Link>

                    <Link className="nav-link text-white" to="/audit">
                        Audit
                    </Link>

                    <Link className="nav-link text-white" to="/result">
                        Results
                    </Link>
                </div>
            </nav>

            {/* PAGE CONTENT */}
            <div>{children}</div>

        </div>
    );
};

export default MainLayout;