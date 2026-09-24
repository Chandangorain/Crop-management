import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
    getAdminAnalytics,
    getAllUsers,
    verifyUser,
    getAllCrops,
    createCrop,
    updateCrop,
    deleteCrop,
    getAllPendingOffers,
    getAllInspections,
    assignInspection
} from "../services/api";
import {
    Users,
    Wheat,
    FileCheck2,
    ShieldAlert,
    TrendingUp,
    Search,
    Plus,
    Edit3,
    Trash2,
    UserCheck,
    UserX,
    ClipboardCheck,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    IndianRupee,
    Layers,
    AlertCircle,
    Building2,
    Tractor
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";
import toast from "react-hot-toast";

const STATUS_COLORS = {
    pending: "#f59e0b",
    assignedToInspector: "#3b82f6",
    accept: "#10b981",
    reject: "#ef4444"
};

export default function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("overview");

    // Analytics State
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Users State
    const [users, setUsers] = useState([]);
    const [userFilter, setUserFilter] = useState("all");
    const [userSearch, setUserSearch] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Crops State
    const [crops, setCrops] = useState([]);
    const [loadingCrops, setLoadingCrops] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);
    const [cropForm, setCropForm] = useState({ name: "", season: "Kharif", type: "Grain" });

    // Pending Offers & Assignment State
    const [pendingOffers, setPendingOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [selectedInspectorId, setSelectedInspectorId] = useState("");
    const [submittingAssign, setSubmittingAssign] = useState(false);

    // Inspections State
    const [inspections, setInspections] = useState([]);
    const [loadingInspections, setLoadingInspections] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchAnalytics();
        fetchUsers();
        fetchCrops();
        fetchPendingOffers();
        fetchInspections();
    }, []);

    const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
            const res = await getAdminAnalytics();
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load analytics");
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load users");
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchCrops = async () => {
        setLoadingCrops(true);
        try {
            const res = await getAllCrops();
            setCrops(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load crops");
        } finally {
            setLoadingCrops(false);
        }
    };

    const fetchPendingOffers = async () => {
        setLoadingOffers(true);
        try {
            const res = await getAllPendingOffers();
            setPendingOffers(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load pending offers");
        } finally {
            setLoadingOffers(false);
        }
    };

    const fetchInspections = async () => {
        setLoadingInspections(true);
        try {
            const res = await getAllInspections();
            setInspections(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load inspections");
        } finally {
            setLoadingInspections(false);
        }
    };

    // User Verification Toggle
    const handleToggleVerification = async (targetUser) => {
        const nextStatus = !targetUser.isVerified;
        try {
            await verifyUser(targetUser._id, nextStatus);
            toast.success(`User ${targetUser.name} ${nextStatus ? "verified" : "unverified"} successfully`);
            fetchUsers();
            fetchAnalytics();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update verification status");
        }
    };

    // Crop CRUD Handlers
    const handleOpenCropModal = (crop = null) => {
        if (crop) {
            setEditingCrop(crop);
            setCropForm({ name: crop.name, season: crop.season, type: crop.type });
        } else {
            setEditingCrop(null);
            setCropForm({ name: "", season: "Kharif", type: "Grain" });
        }
        setCropModalOpen(true);
    };

    const handleSaveCrop = async (e) => {
        e.preventDefault();
        try {
            if (editingCrop) {
                await updateCrop(editingCrop._id, cropForm);
                toast.success("Crop updated successfully");
            } else {
                await createCrop(cropForm);
                toast.success("New crop registered successfully");
            }
            setCropModalOpen(false);
            fetchCrops();
            fetchAnalytics();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save crop");
        }
    };

    const handleDeleteCrop = async (cropId, cropName) => {
        if (!window.confirm(`Are you sure you want to remove ${cropName} from the crop catalog?`)) {
            return;
        }
        try {
            await deleteCrop(cropId);
            toast.success(`${cropName} removed from catalog`);
            fetchCrops();
            fetchAnalytics();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete crop");
        }
    };

    // Inspector Assignment Handlers
    const handleOpenAssignModal = (offer) => {
        setSelectedOffer(offer);
        setSelectedInspectorId("");
        setAssignModalOpen(true);
    };

    const handleAssignInspector = async () => {
        if (!selectedInspectorId) {
            toast.error("Please select a verified inspector");
            return;
        }
        setSubmittingAssign(true);
        try {
            await assignInspection({
                offerId: selectedOffer._id,
                inspectorId: selectedInspectorId
            });
            toast.success("Inspector assigned successfully!");
            setAssignModalOpen(false);
            fetchPendingOffers();
            fetchInspections();
            fetchAnalytics();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to assign inspector");
        } finally {
            setSubmittingAssign(false);
        }
    };

    // Filtered Users List
    const verifiedInspectors = users.filter((u) => u.role === "inspector" && u.isVerified);

    const filteredUsers = users.filter((u) => {
        const matchesRole =
            userFilter === "all"
                ? true
                : userFilter === "pending"
                ? !u.isVerified && (u.role === "mill_owner" || u.role === "inspector")
                : u.role === userFilter;
        const matchesSearch =
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.phone.toLowerCase().includes(userSearch.toLowerCase());
        return matchesRole && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Dashboard Header Bar */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                                    Administration Portal
                                </span>
                                <span className="text-xs text-slate-400">System Control</span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                                Command & Analytics Center
                            </h1>
                            <p className="text-xs text-slate-500">
                                Monitor platform activity, verify commercial participants, assign inspectors, and manage crop commodities.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                fetchAnalytics();
                                fetchUsers();
                                fetchCrops();
                                fetchPendingOffers();
                                fetchInspections();
                                toast.success("Refreshed all platform data");
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                            <span>Refresh Data</span>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto gap-2 mt-6 border-b border-slate-100 pb-0.5 no-scrollbar">
                        {[
                            { id: "overview", label: "Executive Analytics", icon: TrendingUp },
                            {
                                id: "users",
                                label: `User Verification (${analytics?.users?.pendingVerification || 0} Pending)`,
                                icon: Users,
                                alert: (analytics?.users?.pendingVerification || 0) > 0
                            },
                            { id: "crops", label: `Crop Catalog (${crops.length})`, icon: Wheat },
                            {
                                id: "offers",
                                label: `Pending Offers (${pendingOffers.length})`,
                                icon: FileCheck2,
                                alert: pendingOffers.length > 0
                            },
                            { id: "inspections", label: `Inspections Monitor (${inspections.length})`, icon: ClipboardCheck }
                        ].map((t) => {
                            const TabIcon = t.icon;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                        activeTab === t.id
                                            ? "border-emerald-600 text-emerald-800 bg-emerald-50/60"
                                            : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                >
                                    <TabIcon className="w-4 h-4" />
                                    <span>{t.label}</span>
                                    {t.alert && (
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                {/* 1. EXECUTIVE ANALYTICS TAB */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <IndianRupee className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Settled Trade Volume
                                    </p>
                                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                        ₹{(analytics?.financials?.totalAmountINR || 0).toLocaleString("en-IN")}
                                    </h3>
                                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                                        {analytics?.financials?.completedTransactions || 0} completed inspections
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Verified Crop Volume
                                    </p>
                                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                        {(analytics?.financials?.totalVolumeKg || 0).toLocaleString("en-IN")} Quintals/Kg
                                    </h3>
                                    <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                                        Physical delivery verified
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Pending Verifications
                                    </p>
                                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                        {analytics?.users?.pendingVerification || 0} Accounts
                                    </h3>
                                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                                        Mills & Inspectors waiting
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Total Platform Users
                                    </p>
                                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                        {analytics?.users?.total || 0} Registered
                                    </h3>
                                    <p className="text-[11px] text-purple-600 font-medium mt-0.5">
                                        {analytics?.users?.farmers || 0} Farmers, {analytics?.users?.millOwners || 0} Mills
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Charts using Recharts */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Requirement Volume by Crop BarChart */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-base text-slate-900">
                                            Crop Demand Distribution (Total Quantities)
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Aggregated procurement demand posted by mill owners
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                        Active Marketplace
                                    </span>
                                </div>

                                <div className="h-72 w-full">
                                    {analytics?.chartData?.cropRequirements && analytics.chartData.cropRequirements.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={analytics.chartData.cropRequirements}
                                                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                            >
                                                <XAxis
                                                    dataKey="cropName"
                                                    tick={{ fontSize: 11, fill: "#64748b" }}
                                                    interval={0}
                                                    angle={-15}
                                                    textAnchor="end"
                                                />
                                                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#ffffff",
                                                        borderColor: "#e2e8f0",
                                                        borderRadius: "12px",
                                                        fontSize: "12px"
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="totalQuantity"
                                                    name="Required Total Quantity"
                                                    fill="#10b981"
                                                    radius={[6, 6, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                                            <Wheat className="w-8 h-8 mb-2 opacity-50" />
                                            <span>No crop requirements posted yet</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sell Offers Status Breakdown Donut Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">
                                        Sell Offer Status Breakdown
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Lifecycle stages of submitted farmer offers
                                    </p>
                                </div>

                                <div className="h-56 w-full mt-4 flex items-center justify-center">
                                    {analytics?.chartData?.statusBreakdown && (analytics?.sellOffers?.total || 0) > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.chartData.statusBreakdown}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={75}
                                                    paddingAngle={3}
                                                >
                                                    {analytics.chartData.statusBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center text-xs text-slate-400">
                                            <FileCheck2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <span>No offers created yet</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-100 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        <span className="text-slate-600">Pending ({analytics?.sellOffers?.pending || 0})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                        <span className="text-slate-600">Assigned ({analytics?.sellOffers?.assigned || 0})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-slate-600">Accepted ({analytics?.sellOffers?.accepted || 0})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                        <span className="text-slate-600">Rejected ({analytics?.sellOffers?.rejected || 0})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. USER VERIFICATION & MANAGEMENT TAB */}
                {activeTab === "users" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        {/* Header & Controls */}
                        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">User Identity & Verification</h3>
                                <p className="text-xs text-slate-500">
                                    Verify Commercial Mill Owners & Field Inspectors before they can transact on the network.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-60"
                                    />
                                </div>

                                {/* Filter Pills */}
                                <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                                    {["all", "pending", "mill_owner", "inspector", "farmer"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setUserFilter(f)}
                                            className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                                                userFilter === f
                                                    ? "bg-white text-slate-900 shadow-xs"
                                                    : "text-slate-600 hover:text-slate-900"
                                            }`}
                                        >
                                            {f === "mill_owner" ? "Mill Owners" : f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="py-3.5 px-5">Participant</th>
                                        <th className="py-3.5 px-5">Role</th>
                                        <th className="py-3.5 px-5">Contact Details</th>
                                        <th className="py-3.5 px-5">Commercial / Mill Info</th>
                                        <th className="py-3.5 px-5">Verification</th>
                                        <th className="py-3.5 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((u) => (
                                            <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{u.name}</p>
                                                            <p className="text-[11px] text-slate-400">{u.address}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold capitalize text-[11px] ${
                                                        u.role === "admin"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : u.role === "mill_owner"
                                                            ? "bg-amber-100 text-amber-800"
                                                            : u.role === "inspector"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-emerald-100 text-emerald-800"
                                                    }`}>
                                                        {u.role.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <p className="text-slate-800 font-medium">{u.email}</p>
                                                    <p className="text-slate-400 text-[11px]">{u.phone}</p>
                                                </td>
                                                <td className="py-4 px-5">
                                                    {u.role === "mill_owner" ? (
                                                        <div className="text-[11px]">
                                                            <p className="font-semibold text-slate-800">{u.millName || "N/A"}</p>
                                                            <p className="text-slate-500">Lic: {u.licenseNo || "N/A"}</p>
                                                            <p className="text-slate-400">{u.millLocation || ""}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px]">N/A</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5">
                                                    {u.isVerified ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-emerald-200">
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-amber-200">
                                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                            Pending Approval
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 text-right">
                                                    {u.role !== "admin" && (
                                                        <button
                                                            onClick={() => handleToggleVerification(u)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                                                u.isVerified
                                                                    ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200"
                                                                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                                                            }`}
                                                        >
                                                            {u.isVerified ? (
                                                                <>
                                                                    <UserX className="w-3.5 h-3.5" />
                                                                    <span>Revoke</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                    <span>Approve & Verify</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No users matching the selected filter criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. CROP COMMODITY CATALOG (CRUD) TAB */}
                {activeTab === "crops" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Official Crop Commodity Catalog</h3>
                                <p className="text-xs text-slate-500">
                                    Standard commodities available for mill owner procurement requirements and farmer offers.
                                </p>
                            </div>
                            <button
                                onClick={() => handleOpenCropModal()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Register New Crop</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {crops.map((crop) => (
                                <div
                                    key={crop._id}
                                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                                <Wheat className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleOpenCropModal(crop)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                                    title="Edit crop details"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCrop(crop._id, crop.name)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                    title="Delete crop"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <h4 className="text-base font-bold text-slate-900 mt-3">{crop.name}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                                Season: {crop.season}
                                            </span>
                                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                                                Type: {crop.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                                        <span>Catalog ID: {crop._id.substring(0, 8)}...</span>
                                        <span>Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. PENDING OFFERS & INSPECTOR ASSIGNMENT TAB */}
                {activeTab === "offers" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Pending Sell Offers Dispatch</h3>
                                <p className="text-xs text-slate-500">
                                    Offers submitted by farmers awaiting field inspector dispatch for on-site physical verification.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                {pendingOffers.length} Deals Waiting Dispatch
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="py-3.5 px-5">Farmer (Seller)</th>
                                        <th className="py-3.5 px-5">Target Requirement & Mill</th>
                                        <th className="py-3.5 px-5">Offered Quantity</th>
                                        <th className="py-3.5 px-5">Expected Rate</th>
                                        <th className="py-3.5 px-5">Status</th>
                                        <th className="py-3.5 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {pendingOffers.length > 0 ? (
                                        pendingOffers.map((offer) => (
                                            <tr key={offer._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                            <Tractor className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{offer.farmerId?.name || "Farmer"}</p>
                                                            <p className="text-[11px] text-slate-500">{offer.farmerId?.phone || "No phone"}</p>
                                                            <p className="text-[10px] text-slate-400">{offer.farmerId?.address || ""}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">
                                                        {offer.requirementId?.cropId?.name || "Crop"}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {offer.requirementId?.millOwnerId?.millName || "Mill"} ({offer.requirementId?.millOwnerId?.millLocation || "Location"})
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        Quality Grade: {offer.requirementId?.quality || "Standard"}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-5 font-bold text-slate-900">
                                                    {offer.approxQuantitySell} Quintals/Kg
                                                </td>
                                                <td className="py-4 px-5 font-bold text-emerald-700">
                                                    ₹{offer.requirementId?.expectedRate} / Unit
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-amber-200">
                                                        <Clock className="w-3 h-3 text-amber-600" />
                                                        Pending Assignment
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        onClick={() => handleOpenAssignModal(offer)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
                                                    >
                                                        <ClipboardCheck className="w-3.5 h-3.5" />
                                                        <span>Assign Inspector</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400">
                                                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                                                <p className="font-semibold text-slate-600">All caught up!</p>
                                                <p className="text-xs">No pending sell offers waiting for inspector assignment.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 5. INSPECTIONS & TRANSACTIONS MONITOR TAB */}
                {activeTab === "inspections" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Network Inspections & Settlements</h3>
                                <p className="text-xs text-slate-500">
                                    Audited records of on-field inspections and verified OTP transactions.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {inspections.length} Total Inspections Recorded
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="py-3.5 px-5">Assigned Inspector</th>
                                        <th className="py-3.5 px-5">Crop & Participants</th>
                                        <th className="py-3.5 px-5">Verified Quantity</th>
                                        <th className="py-3.5 px-5">Final Negotiated Rate</th>
                                        <th className="py-3.5 px-5">Settlement Amount</th>
                                        <th className="py-3.5 px-5">Outcome</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {inspections.length > 0 ? (
                                        inspections.map((insp) => (
                                            <tr key={insp._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">{insp.inspectorId?.name || "Inspector"}</p>
                                                    <p className="text-[11px] text-slate-500">{insp.inspectorId?.phone || ""}</p>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">
                                                        {insp.offerId?.requirementId?.cropId?.name || "Crop"}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Farmer: {insp.offerId?.farmerId?.name || "Farmer"} → Mill: {insp.offerId?.requirementId?.millOwnerId?.millName || "Mill"}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-5 font-bold text-slate-900">
                                                    {insp.isTransactionCompleted ? `${insp.quantityReal} Units` : "Pending on-field check"}
                                                </td>
                                                <td className="py-4 px-5 font-bold text-slate-900">
                                                    {insp.isTransactionCompleted ? `₹${insp.finalRate}` : "Negotiating"}
                                                </td>
                                                <td className="py-4 px-5 font-extrabold text-emerald-700">
                                                    {insp.isTransactionCompleted ? `₹${(insp.amount || 0).toLocaleString("en-IN")}` : "---"}
                                                </td>
                                                <td className="py-4 px-5">
                                                    {insp.transactionStatus === "accept" ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-emerald-200">
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                            Accepted & Settled
                                                        </span>
                                                    ) : insp.transactionStatus === "reject" ? (
                                                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-red-200">
                                                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                                                            Rejected
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-blue-200">
                                                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                                                            In Progress
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No inspection records yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* CROP CREATE / EDIT MODAL */}
            {cropModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {editingCrop ? "Update Crop Definition" : "Register New Crop Commodity"}
                        </h3>
                        <p className="text-xs text-slate-500 mb-5">
                            Add standardized agricultural commodities to the national catalog.
                        </p>

                        <form onSubmit={handleSaveCrop} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                    Crop Name *
                                </label>
                                <input
                                    type="text"
                                    value={cropForm.name}
                                    onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                                    placeholder="e.g. Basmati Rice 1121, Sharbati Wheat"
                                    required
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Season *
                                    </label>
                                    <select
                                        value={cropForm.season}
                                        onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    >
                                        <option value="Kharif">Kharif (Monsoon)</option>
                                        <option value="Rabi">Rabi (Winter)</option>
                                        <option value="Zaid">Zaid (Summer)</option>
                                        <option value="Perennial">Year-round / Perennial</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                        Commodity Type *
                                    </label>
                                    <select
                                        value={cropForm.type}
                                        onChange={(e) => setCropForm({ ...cropForm, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    >
                                        <option value="Grain">Grain</option>
                                        <option value="Paddy">Paddy / Rice</option>
                                        <option value="Oilseed">Oilseed</option>
                                        <option value="Pulse">Pulse / Legume</option>
                                        <option value="Fiber">Fiber (Cotton/Jute)</option>
                                        <option value="Spices">Spices</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCropModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                                >
                                    {editingCrop ? "Update Crop" : "Save to Catalog"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ASSIGN INSPECTOR MODAL */}
            {assignModalOpen && selectedOffer && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Assign Field Inspector
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Dispatch a certified inspector for physical inspection
                                </p>
                            </div>
                        </div>

                        {/* Deal Summary Box */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-4 text-xs space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Farmer:</span>
                                <span className="font-bold text-slate-800">{selectedOffer.farmerId?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Location:</span>
                                <span className="text-slate-700">{selectedOffer.farmerId?.address}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Crop Commodity:</span>
                                <span className="font-bold text-emerald-700">
                                    {selectedOffer.requirementId?.cropId?.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Offered Quantity:</span>
                                <span className="font-bold text-slate-800">
                                    {selectedOffer.approxQuantitySell} Quintals/Kg
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Mill Procurement:</span>
                                <span className="text-slate-700">
                                    {selectedOffer.requirementId?.millOwnerId?.millName}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                    Select Certified Inspector *
                                </label>
                                <select
                                    value={selectedInspectorId}
                                    onChange={(e) => setSelectedInspectorId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                                >
                                    <option value="">-- Choose verified inspector --</option>
                                    {verifiedInspectors.map((insp) => (
                                        <option key={insp._id} value={insp._id}>
                                            {insp.name} ({insp.phone} - {insp.address})
                                        </option>
                                    ))}
                                </select>
                                {verifiedInspectors.length === 0 && (
                                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        No verified inspectors found. Please verify an inspector account in the Users tab first.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAssignModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAssignInspector}
                                    disabled={submittingAssign || !selectedInspectorId}
                                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {submittingAssign ? "Dispatching..." : "Confirm & Dispatch"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}