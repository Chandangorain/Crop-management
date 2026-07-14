import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const dashboardBg =
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80";

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div
            className="dashboard-container"
            style={{
                backgroundImage: `linear-gradient(rgba(11,31,18,0.75), rgba(11,31,18,0.75)), url(${dashboardBg})`,
            }}
        >
            <div className="navbar">
                <h1>🌾 KrisiConnect</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-badge">
                    {user.role.toUpperCase()}
                </div>

                <h2>Welcome back, {user.name}! 👋</h2>

                <p className="dashboard-subtitle">
                    Manage your agricultural operations, crop transactions,
                    inspections, and procurement activities from one centralized
                    platform.
                </p>

                <div className="dashboard-info-grid">
                    <div className="dashboard-info-card">
                        <h4>👤 Role</h4>
                        <p>{user.role}</p>
                    </div>

                    <div className="dashboard-info-card">
                        <h4>📧 Email</h4>
                        <p>{user.email}</p>
                    </div>

                    <div className="dashboard-info-card">
                        <h4>✅ Verification</h4>
                        <p>
                            {user.isVerified
                                ? "Verified Account"
                                : "Pending Verification"}
                        </p>
                    </div>
                </div>

                <div className="dashboard-options">
                    {user.role === "admin" && (
                        <>
                            <button onClick={() => navigate("/admin")}>
                                Open Admin Dashboard
                            </button>

                            <p
                                style={{
                                    marginTop: "12px",
                                    color: "#555",
                                    fontSize: "14px",
                                }}
                            >
                                Manage users, verify mill owners and inspectors,
                                approve accounts, and create crop categories.
                            </p>
                        </>
                    )}

                    {user.role === "mill_owner" && (
                        <>
                            {!user.isVerified && (
                                <div className="warning">
                                    ⚠️ Waiting for admin verification. You
                                    cannot create crop requirements until your
                                    account is approved.
                                </div>
                            )}

                            <button onClick={() => navigate("/mill-owner")}>
                                Open Mill Owner Dashboard
                            </button>

                            <p
                                style={{
                                    marginTop: "12px",
                                    color: "#555",
                                    fontSize: "14px",
                                }}
                            >
                                Create procurement requirements, manage crop
                                purchases, and track farmer offers.
                            </p>
                        </>
                    )}

                    {user.role === "farmer" && (
                        <>
                            <button onClick={() => navigate("/farmer")}>
                                Open Farmer Dashboard
                            </button>

                            <p
                                style={{
                                    marginTop: "12px",
                                    color: "#555",
                                    fontSize: "14px",
                                }}
                            >
                                Browse crop requirements, submit offers, and
                                monitor ongoing transactions.
                            </p>
                        </>
                    )}

                    {user.role === "inspector" && (
                        <>
                            {!user.isVerified && (
                                <div className="warning">
                                    ⚠️ Waiting for admin verification. You
                                    cannot perform inspections until your
                                    account is approved.
                                </div>
                            )}

                            <button onClick={() => navigate("/inspector")}>
                                Open Inspector Dashboard
                            </button>

                            <p
                                style={{
                                    marginTop: "12px",
                                    color: "#555",
                                    fontSize: "14px",
                                }}
                            >
                                Complete crop inspections, verify quality, and
                                help ensure transparent agricultural trading.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}