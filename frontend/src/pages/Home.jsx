import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const backgroundImageUrl =
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80";

export default function Home() {
    return (
        <div
            className="home-page"
            style={{
                backgroundImage: `linear-gradient(rgba(11, 31, 18, 0.62), rgba(11, 31, 18, 0.62)), url(${backgroundImageUrl})`,
            }}
        >
            <header className="home-header">
                <div className="home-brand">
                    <span className="home-brand-mark">A</span>
                    <span>AgroConnect</span>
                </div>

                <div className="home-auth-links">
                    <Link to="/login" className="home-link home-link-secondary">
                        Login
                    </Link>
                    <Link to="/register" className="home-link home-link-primary">
                        Register
                    </Link>
                </div>
            </header>

            <main className="home-hero">
                <div className="home-copy">
                    <p className="home-kicker">Crop marketplace and inspection platform</p>
                    <h1>Connect farmers, mill owners, and inspectors in one place.</h1>
                    <p className="home-description">
                        Post crop requirements, make sell offers, manage inspections, and keep the trading workflow organized from a simple dashboard.
                    </p>

                    <div className="home-actions">
                        <Link to="/register" className="home-cta">
                            Get Started
                        </Link>
                        <Link to="/login" className="home-text-link">
                            I already have an account
                        </Link>
                    </div>
                </div>

                <div className="home-card">
                    <div className="home-card-image" />
                    <div className="home-card-body">
                        <h2>Use your own crop image</h2>
                        <p>
                            Replace the background image URL in <span>src/pages/Home.jsx</span> with any public crop photo URL.
                        </p>
                        <p className="home-tip">
                            Example: use a direct image link from Unsplash, Pexels, or your own hosted image file.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}