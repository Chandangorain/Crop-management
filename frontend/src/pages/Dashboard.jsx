import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate("/login");
            } else {
                switch (user.role) {
                    case "admin":
                        navigate("/admin", { replace: true });
                        break;
                    case "mill_owner":
                        navigate("/mill-owner", { replace: true });
                        break;
                    case "farmer":
                        navigate("/farmer", { replace: true });
                        break;
                    case "inspector":
                        navigate("/inspector", { replace: true });
                        break;
                    default:
                        navigate("/login", { replace: true });
                }
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                <span className="text-slate-700 font-semibold text-sm">
                    Routing to your {user?.role ? user.role.replace("_", " ") : "AgroConnect"} dashboard...
                </span>
            </div>
        </div>
    );
}