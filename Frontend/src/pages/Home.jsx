import React from "react";
import { Link } from "react-router-dom";
const Home = () => {
    return (
        <div className="container py-5">

            {/* HERO SECTION */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold">
                    AI Spend Audit 💰
                </h1>

                <p className="lead mt-3">
                    Discover how much your team is overspending on AI tools — and how to fix it instantly.
                </p>

                <Link to="/audit" className="btn btn-primary btn-lg mt-3">
                    Start Free Audit
                </Link>
            </div>

            {/* HOW IT WORKS */}
            <div className="row text-center mt-5">

                <div className="col-md-4">
                    <h4>1. Add Tools</h4>
                    <p>Enter Cursor, ChatGPT, Claude and other tools you use.</p>
                </div>

                <div className="col-md-4">
                    <h4>2. Analyze Spend</h4>
                    <p>We calculate where you're overpaying or underusing plans.</p>
                </div>

                <div className="col-md-4">
                    <h4>3. Save Money</h4>
                    <p>Get instant recommendations and estimated savings.</p>
                </div>

            </div>

            {/* FOOTER */}
            <div className="text-center mt-5 text-muted">
                <small>Built for startups using AI tools daily 🚀</small>
            </div>

        </div>
    );
};

export default Home;