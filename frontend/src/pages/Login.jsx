import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { 
    Sprout, 
    Lock, 
    Mail, 
    ArrowRight, 
    ShieldCheck, 
    CheckCircle2, 
    Sparkles, 
    Tractor, 
    Building2, 
    ClipboardCheck, 
    Crown,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user } = useContext(AuthContext);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    // Check if redirected due to expired session
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("sessionExpired") === "true") {
            toast.error("Your session has expired. Please log in again.");
        }
    }, [location]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginUser(credentials);
            const { user: loggedInUser, token } = response.data;
            login(loggedInUser, token);
            toast.success(`Welcome back, ${loggedInUser.name}!`);
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.error || "Login failed. Please check your credentials.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Quick-fill credentials for easy testing
    const fillDemoCredentials = (role) => {
        if (role === "admin") {
            setCredentials({ email: "admin@t.com", password: "admin@123" });
            toast("Admin test credentials loaded", { icon: "👑" });
        } else if (role === "farmer") {
            setCredentials({ email: "farmer@demo.com", password: "password123" });
            toast("Farmer demo credentials loaded", { icon: "🌾" });
        } else if (role === "mill") {
            setCredentials({ email: "mill@demo.com", password: "password123" });
            toast("Mill Owner demo credentials loaded", { icon: "🏭" });
        } else if (role === "inspector") {
            setCredentials({ email: "inspector@demo.com", password: "password123" });
            toast("Inspector demo credentials loaded", { icon: "🔍" });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/40 via-teal-50/20 to-transparent pointer-events-none -z-10" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl agri-gradient shadow-lg shadow-emerald-600/25 mb-4 group hover:scale-105 transition-transform">
                    <Sprout className="w-9 h-9 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Agro<span className="text-emerald-600">Connect</span>
                </h1>
                <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
                    Direct Farm-to-Mill Marketplace with Cryptographic OTP Verification
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
                    <div className="mb-6 pb-4 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
                        <p className="text-xs text-slate-500 mt-1">Access your agricultural portal & transactions</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Credentials Helper */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quick Demo Fill</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials("admin")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-700 font-medium transition-colors text-left"
                            >
                                <Crown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span className="truncate">Admin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials("farmer")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 font-medium transition-colors text-left"
                            >
                                <Tractor className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">Farmer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials("mill")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-800 font-medium transition-colors text-left"
                            >
                                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">Mill Owner</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials("inspector")}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 font-medium transition-colors text-left"
                            >
                                <ClipboardCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">Inspector</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        Don't have an account yet?{" "}
                        <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                            Register now
                        </Link>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 flex items-center justify-center gap-6 text-slate-400 text-xs">
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Admin Verified
                    </span>
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Cryptographic OTP
                    </span>
                </div>
            </div>
        </div>
    );
}
