import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    <span className="text-slate-700 font-medium text-sm">Authenticating AgroConnect session...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const roles = allowedRoles || (requiredRole ? [requiredRole] : null);

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
