import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
    Sprout, 
    LogOut, 
    User as UserIcon, 
    ShieldCheck, 
    AlertCircle, 
    Menu, 
    X,
    Building2,
    Tractor,
    ClipboardCheck,
    Crown
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
    const { user, logout, isVerified } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Successfully logged out. See you soon!");
        navigate("/login");
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case "admin":
                return {
                    label: "Administrator",
                    color: "bg-purple-100 text-purple-700 border-purple-200",
                    icon: Crown
                };
            case "mill_owner":
                return {
                    label: "Mill Owner",
                    color: "bg-amber-100 text-amber-800 border-amber-200",
                    icon: Building2
                };
            case "inspector":
                return {
                    label: "Field Inspector",
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                    icon: ClipboardCheck
                };
            case "farmer":
            default:
                return {
                    label: "Farmer / Producer",
                    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    icon: Tractor
                };
        }
    };

    const roleInfo = user ? getRoleBadge(user.role) : null;
    const RoleIcon = roleInfo?.icon;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 rounded-xl agri-gradient flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                <Sprout className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 font-heading">
                                    Agro<span className="text-emerald-600">Connect</span>
                                </span>
                                <span className="hidden sm:block text-[10px] uppercase tracking-wider text-emerald-700 font-semibold -mt-1">
                                    Farm-to-Mill Network
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Right Side */}
                    {user ? (
                        <div className="hidden md:flex items-center gap-4">
                            {/* Role Badge */}
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo?.color}`}>
                                {RoleIcon && <RoleIcon className="w-3.5 h-3.5" />}
                                <span>{roleInfo?.label}</span>
                            </div>

                            {/* Verification Status Badge */}
                            {user.role !== "admin" && (
                                <div className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    isVerified 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                    {isVerified ? (
                                        <>
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Verified</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Pending Verification</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* User Profile Mini Card */}
                            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[130px]">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Logout Action */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm shadow-emerald-600/30 transition-colors"
                            >
                                Create Account
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleInfo?.color}`}>
                                            {roleInfo?.label}
                                        </span>
                                        {isVerified ? (
                                            <span className="text-[10px] text-emerald-700 font-medium">✓ Verified</span>
                                        ) : (
                                            <span className="text-[10px] text-amber-700 font-medium">⏳ Unverified</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full text-center py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg"
                            >
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
