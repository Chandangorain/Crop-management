import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { 
    Sprout, 
    Lock, 
    Mail, 
    Phone, 
    MapPin, 
    User, 
    Building2, 
    FileText, 
    Tractor, 
    ClipboardCheck, 
    ArrowRight, 
    Loader2, 
    Check, 
    Info 
} from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        role: "farmer",
        licenseNo: "",
        millName: "",
        millLocation: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData((prev) => ({ ...prev, role }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await registerUser(formData);
            const { user: registeredUser, token } = response.data;
            login(registeredUser, token);
            toast.success(`Account created successfully! Welcome ${registeredUser.name}`);
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.error || "Registration failed. Please check your details.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/40 via-teal-50/20 to-transparent pointer-events-none -z-10" />

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl agri-gradient shadow-lg shadow-emerald-600/25 mb-3 group hover:scale-105 transition-transform">
                    <Sprout className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Join Agro<span className="text-emerald-600">Connect</span>
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Connect directly to the farm-to-mill marketplace
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
                    {/* Role Selection Tabs */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Select Your Role
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Farmer Option */}
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("farmer")}
                                className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    formData.role === "farmer"
                                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20"
                                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                    formData.role === "farmer" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                    <Tractor className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Farmer</span>
                                <span className="text-[11px] text-slate-500 mt-0.5">Sell harvested crops directly</span>
                                <span className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                    Instant Verification
                                </span>
                            </button>

                            {/* Mill Owner Option */}
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("mill_owner")}
                                className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    formData.role === "mill_owner"
                                        ? "border-amber-600 bg-amber-50/70 text-amber-950 shadow-xs ring-2 ring-amber-500/20"
                                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                    formData.role === "mill_owner" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Mill Owner</span>
                                <span className="text-[11px] text-slate-500 mt-0.5">Post bulk crop requirements</span>
                                <span className="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                                    Admin Verification
                                </span>
                            </button>

                            {/* Inspector Option */}
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("inspector")}
                                className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    formData.role === "inspector"
                                        ? "border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs ring-2 ring-blue-500/20"
                                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                    formData.role === "inspector" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                    <ClipboardCheck className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Field Inspector</span>
                                <span className="text-[11px] text-slate-500 mt-0.5">Quality audit & OTP check</span>
                                <span className="mt-2 text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                                    Admin Verification
                                </span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Ramesh Patel"
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ramesh@agro.com"
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. 9876543210"
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Minimum 6 characters"
                                        required
                                        minLength={6}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Complete Address / Region
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Village/City, District, State"
                                    required
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Mill Owner Specific Fields */}
                        {formData.role === "mill_owner" && (
                            <div className="pt-4 border-t border-amber-200/60 bg-amber-50/40 p-4 rounded-xl space-y-3">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                    <Building2 className="w-4 h-4 text-amber-700" />
                                    <span>Mill Commercial Details</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            License Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="licenseNo"
                                            value={formData.licenseNo}
                                            onChange={handleChange}
                                            placeholder="LIC-12345"
                                            required={formData.role === "mill_owner"}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Mill Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="millName"
                                            value={formData.millName}
                                            onChange={handleChange}
                                            placeholder="Shree Agro Mills"
                                            required={formData.role === "mill_owner"}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Mill Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="millLocation"
                                            value={formData.millLocation}
                                            onChange={handleChange}
                                            placeholder="MIDC Agro Sector"
                                            required={formData.role === "mill_owner"}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notice for Mill Owner and Inspector */}
                        {formData.role !== "farmer" && (
                            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-800">
                                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <span>
                                    Accounts registered as <strong>{formData.role === "mill_owner" ? "Mill Owner" : "Field Inspector"}</strong> require verification by the system administrator before creating requirements or conducting inspections.
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Registering Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
