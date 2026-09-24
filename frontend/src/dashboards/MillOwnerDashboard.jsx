import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
    createMillRequirement,
    getMyRequirements,
    getAllCrops,
    updateRequirementStatus,
    getMillOwnerInspections
} from "../services/api";
import {
    Building2,
    Wheat,
    PlusCircle,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    IndianRupee,
    Layers,
    UserCheck,
    RefreshCw,
    Search,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import toast from "react-hot-toast";

export default function MillOwnerDashboard() {
    const { user, isVerified } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("requirements");

    // Requirements & Crops State
    const [requirements, setRequirements] = useState([]);
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [newRequirement, setNewRequirement] = useState({
        cropId: "",
        quality: 8,
        requiredTotalQuantity: "",
        expectedRate: ""
    });
    const [submitting, setSubmitting] = useState(false);

    // Inspections State
    const [inspections, setInspections] = useState([]);
    const [loadingInspections, setLoadingInspections] = useState(false);

    // Filter
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        loadCrops();
        loadRequirements();
        loadInspections();
    }, []);

    const loadCrops = async () => {
        try {
            const res = await getAllCrops();
            setCrops(res.data);
            if (res.data.length > 0 && !newRequirement.cropId) {
                setNewRequirement((prev) => ({ ...prev, cropId: res.data[0]._id }));
            }
        } catch (err) {
            console.error("Failed to load crops:", err);
        }
    };

    const loadRequirements = async () => {
        setLoading(true);
        try {
            const res = await getMyRequirements();
            setRequirements(res.data);
        } catch (err) {
            toast.error("Failed to load your requirements");
        } finally {
            setLoading(false);
        }
    };

    const loadInspections = async () => {
        setLoadingInspections(true);
        try {
            const res = await getMillOwnerInspections();
            setInspections(res.data);
        } catch (err) {
            console.error("Failed to load inspections:", err);
        } finally {
            setLoadingInspections(false);
        }
    };

    const handleCreateRequirement = async (e) => {
        e.preventDefault();
        if (!isVerified) {
            toast.error("Your account is pending verification. You cannot post requirements yet.");
            return;
        }

        setSubmitting(true);
        try {
            await createMillRequirement(newRequirement);
            toast.success("Crop requirement published to marketplace!");
            setNewRequirement({
                cropId: crops[0]?._id || "",
                quality: 8,
                requiredTotalQuantity: "",
                expectedRate: ""
            });
            setActiveTab("requirements");
            loadRequirements();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to create requirement");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (requirement) => {
        const nextStatus = requirement.status === "active" ? "closed" : "active";
        try {
            await updateRequirementStatus(requirement._id, nextStatus);
            toast.success(`Requirement marked as ${nextStatus.toUpperCase()}`);
            loadRequirements();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update requirement status");
        }
    };

    // Derived Statistics
    const activeReqs = requirements.filter((r) => r.status === "active");
    const closedReqs = requirements.filter((r) => r.status === "closed");
    const totalProcuredAmount = inspections
        .filter((i) => i.transactionStatus === "accept")
        .reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalVerifiedQuantity = inspections
        .filter((i) => i.transactionStatus === "accept")
        .reduce((sum, i) => sum + (i.quantityReal || 0), 0);

    const filteredRequirements = requirements.filter((r) => {
        if (statusFilter === "all") return true;
        return r.status === statusFilter;
    });

    const selectedCropObj = crops.find((c) => c._id === newRequirement.cropId);
    const estimatedTotalBudget =
        (parseFloat(newRequirement.requiredTotalQuantity) || 0) * (parseFloat(newRequirement.expectedRate) || 0);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                                    Mill Procurement Portal
                                </span>
                                {user?.millName && (
                                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                        {user.millName} • Lic: {user.licenseNo}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                                Mill Owner Procurement Dashboard
                            </h1>
                            <p className="text-xs text-slate-500">
                                Post crop bulk requirements, track incoming farmer offers, and audit on-site inspection settlements.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                loadRequirements();
                                loadInspections();
                                toast.success("Refreshed procurement data");
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                            <span>Refresh Data</span>
                        </button>
                    </div>

                    {/* Pending Verification Banner */}
                    {!isVerified && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-900">
                                    Account Pending Administrator Verification
                                </h4>
                                <p className="text-xs text-amber-800 mt-0.5">
                                    Your commercial mill license ({user?.licenseNo || "pending"}) is being verified by an administrator. Once approved, you will be able to post active crop requirements to the farmer network.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto gap-2 mt-6 border-b border-slate-100 pb-0.5 no-scrollbar">
                        <button
                            onClick={() => setActiveTab("requirements")}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === "requirements"
                                    ? "border-amber-600 text-amber-800 bg-amber-50/60"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            <span>My Crop Requirements ({requirements.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("create")}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === "create"
                                    ? "border-amber-600 text-amber-800 bg-amber-50/60"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Post New Requirement</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("inspections")}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === "inspections"
                                    ? "border-amber-600 text-amber-800 bg-amber-50/60"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Inspection & Settlement Results ({inspections.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Demands</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{activeReqs.length} Active</h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{closedReqs.length} closed/fulfilled</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Procured</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                {totalVerifiedQuantity.toLocaleString("en-IN")} Units
                            </h3>
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Delivered to mill</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Payouts</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                ₹{totalProcuredAmount.toLocaleString("en-IN")}
                            </h3>
                            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Verified farmer deals</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspections Completed</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                {inspections.filter((i) => i.isTransactionCompleted).length}
                            </h3>
                            <p className="text-[11px] text-purple-600 font-medium mt-0.5">Field certified</p>
                        </div>
                    </div>
                </div>

                {/* 1. MY REQUIREMENTS TAB */}
                {activeTab === "requirements" && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Crop Procurement Demands</h3>
                                <p className="text-xs text-slate-500">
                                    Manage your posted requirements, monitor incoming offers, or close fulfilled demands.
                                </p>
                            </div>

                            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold self-start">
                                {["all", "active", "closed"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setStatusFilter(f)}
                                        className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                                            statusFilter === f ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        {f} Demands
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredRequirements.length > 0 ? (
                                filteredRequirements.map((req) => (
                                    <div
                                        key={req._id}
                                        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                                                        <Wheat className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-base text-slate-900">{req.cropId?.name}</h4>
                                                        <p className="text-[11px] text-slate-400">
                                                            Season: {req.cropId?.season} • Type: {req.cropId?.type}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                    req.status === "active"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl mt-4 text-xs">
                                                <div>
                                                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Remaining Needed</span>
                                                    <p className="font-extrabold text-slate-900 text-sm">{req.requiredTotalQuantity} Units</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Target Price</span>
                                                    <p className="font-extrabold text-emerald-700 text-sm">₹{req.expectedRate} / Unit</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Min Quality</span>
                                                    <p className="font-semibold text-slate-800">{req.quality} / 10 Standard</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Offers</span>
                                                    <p className="font-semibold text-blue-700">{req.totalOffers || 0} Offers ({req.acceptedOffers || 0} settled)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400">
                                                Posted: {new Date(req.createdAt).toLocaleDateString()}
                                            </span>

                                            <button
                                                onClick={() => handleToggleStatus(req)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                                                    req.status === "active"
                                                        ? "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
                                                        : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                                }`}
                                            >
                                                {req.status === "active" ? "Close Requirement" : "Reopen Requirement"}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                                    <Wheat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="font-bold text-slate-700">No crop requirements found.</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Post a new requirement to start procuring crops directly from local farmers.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab("create")}
                                        className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                                    >
                                        Create Requirement Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. POST NEW REQUIREMENT TAB */}
                {activeTab === "create" && (
                    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Publish Crop Procurement Demand</h3>
                                <p className="text-xs text-slate-500">
                                    Broadcast your commodity requirements to verified farmers across the region.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateRequirement} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                    Select Crop Commodity *
                                </label>
                                <select
                                    value={newRequirement.cropId}
                                    onChange={(e) => setNewRequirement({ ...newRequirement, cropId: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-medium"
                                >
                                    {crops.map((crop) => (
                                        <option key={crop._id} value={crop._id}>
                                            {crop.name} ({crop.season} - {crop.type})
                                        </option>
                                    ))}
                                </select>
                                {selectedCropObj && (
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Type: {selectedCropObj.type} • Season: {selectedCropObj.season}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                        Total Quantity Required (Units/Quintals) *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="any"
                                        placeholder="e.g. 500"
                                        value={newRequirement.requiredTotalQuantity}
                                        onChange={(e) =>
                                            setNewRequirement({ ...newRequirement, requiredTotalQuantity: e.target.value })
                                        }
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                        Target Purchase Rate (₹ / Unit) *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="any"
                                        placeholder="e.g. 2800"
                                        value={newRequirement.expectedRate}
                                        onChange={(e) =>
                                            setNewRequirement({ ...newRequirement, expectedRate: e.target.value })
                                        }
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">
                                        Quality Benchmark Standard (1 - 10): {newRequirement.quality} / 10
                                    </label>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={newRequirement.quality}
                                    onChange={(e) => setNewRequirement({ ...newRequirement, quality: Number(e.target.value) })}
                                    className="w-full accent-amber-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>1: Fair / Commercial</span>
                                    <span>5: Standard Grade</span>
                                    <span>10: Premium Export Grade</span>
                                </div>
                            </div>

                            {/* Estimated Calculation Card */}
                            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                                        Estimated Procurement Value
                                    </span>
                                    <p className="text-xs text-amber-800">
                                        {newRequirement.requiredTotalQuantity || 0} Units × ₹{newRequirement.expectedRate || 0}
                                    </p>
                                </div>
                                <span className="text-xl font-extrabold text-amber-950 font-heading">
                                    ₹{estimatedTotalBudget.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !isVerified}
                                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] shadow-md shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? "Publishing Demand..." : "Publish Requirement to Farmer Network"}
                            </button>
                        </form>
                    </div>
                )}

                {/* 3. INSPECTION & SETTLEMENT RESULTS TAB */}
                {activeTab === "inspections" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Inspection Reports & Deliveries</h3>
                                <p className="text-xs text-slate-500">
                                    Official quality and quantity certifications submitted by field inspectors for your requirements.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {inspections.length} Delivery Reports
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="py-3.5 px-5">Crop Commodity</th>
                                        <th className="py-3.5 px-5">Farmer (Seller)</th>
                                        <th className="py-3.5 px-5">Assigned Inspector</th>
                                        <th className="py-3.5 px-5">Certified Quantity</th>
                                        <th className="py-3.5 px-5">Negotiated Rate</th>
                                        <th className="py-3.5 px-5">Total Settlement</th>
                                        <th className="py-3.5 px-5">Verification Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {inspections.length > 0 ? (
                                        inspections.map((insp) => (
                                            <tr key={insp._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">
                                                        {insp.offerId?.requirementId?.cropId?.name || "Crop"}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Grade standard: {insp.offerId?.requirementId?.quality}/10
                                                    </p>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">{insp.offerId?.farmerId?.name || "Farmer"}</p>
                                                    <p className="text-[11px] text-slate-500">{insp.offerId?.farmerId?.phone || ""}</p>
                                                    <p className="text-[10px] text-slate-400">{insp.offerId?.farmerId?.address || ""}</p>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">{insp.inspectorId?.name || "Inspector"}</p>
                                                    <p className="text-[11px] text-slate-500">{insp.inspectorId?.phone || ""}</p>
                                                </td>
                                                <td className="py-4 px-5 font-bold text-slate-900">
                                                    {insp.isTransactionCompleted ? `${insp.quantityReal} Units` : "Pending on-site check"}
                                                </td>
                                                <td className="py-4 px-5 font-bold text-slate-900">
                                                    {insp.isTransactionCompleted ? `₹${insp.finalRate} / Unit` : "In negotiation"}
                                                </td>
                                                <td className="py-4 px-5 font-extrabold text-emerald-700">
                                                    {insp.isTransactionCompleted ? `₹${(insp.amount || 0).toLocaleString("en-IN")}` : "---"}
                                                </td>
                                                <td className="py-4 px-5">
                                                    {insp.transactionStatus === "accept" ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            Accepted & Completed
                                                        </span>
                                                    ) : insp.transactionStatus === "reject" ? (
                                                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-red-200">
                                                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                                                            Rejected (Quality/Spec mismatch)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-amber-200">
                                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                            Awaiting Field Inspection
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-slate-400">
                                                No inspection results recorded for your mill yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
