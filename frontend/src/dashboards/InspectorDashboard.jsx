import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
    getMyInspections,
    completeInspection
} from "../services/api";
import {
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    IndianRupee,
    Tractor,
    Building2,
    Wheat,
    KeyRound,
    RefreshCw,
    ShieldCheck,
    Scale,
    Check,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function InspectorDashboard() {
    const { user, isVerified } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("pending");

    // Inspections State
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(false);

    // Complete Inspection Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [inspectionForm, setInspectionForm] = useState({
        transactionStatus: "accept",
        quantityReal: "",
        finalRate: "",
        otpFromFarmer: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isVerified) {
            loadInspections();
        }
    }, [isVerified]);

    const loadInspections = async () => {
        setLoading(true);
        try {
            const res = await getMyInspections();
            setInspections(res.data);
        } catch (err) {
            toast.error("Failed to load assigned inspections");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCompleteModal = (insp) => {
        setSelectedInspection(insp);
        const approxQty = insp.offerId?.approxQuantitySell || "";
        const expectedRate = insp.offerId?.requirementId?.expectedRate || "";

        setInspectionForm({
            transactionStatus: "accept",
            quantityReal: approxQty,
            finalRate: expectedRate,
            otpFromFarmer: ""
        });
        setModalOpen(true);
    };

    const handleCompleteInspection = async (e) => {
        e.preventDefault();

        if (inspectionForm.transactionStatus === "accept") {
            const qty = parseFloat(inspectionForm.quantityReal);
            const rate = parseFloat(inspectionForm.finalRate);

            if (!qty || qty <= 0) {
                toast.error("Please enter a valid actual verified quantity");
                return;
            }
            if (!rate || rate <= 0) {
                toast.error("Please enter a valid final rate");
                return;
            }
            if (!inspectionForm.otpFromFarmer || inspectionForm.otpFromFarmer.trim().length !== 6) {
                toast.error("Please enter the 6-digit Farmer OTP to authorize this transaction");
                return;
            }
        }

        setSubmitting(true);
        try {
            const payload = {
                transactionStatus: inspectionForm.transactionStatus,
                quantityReal: inspectionForm.transactionStatus === "accept" ? parseFloat(inspectionForm.quantityReal) : 0,
                finalRate: inspectionForm.transactionStatus === "accept" ? parseFloat(inspectionForm.finalRate) : 0,
                otpFromFarmer: inspectionForm.transactionStatus === "accept" ? inspectionForm.otpFromFarmer.trim() : ""
            };

            await completeInspection(selectedInspection._id, payload);
            toast.success(
                `Inspection completed successfully (${inspectionForm.transactionStatus.toUpperCase()})`
            );
            setModalOpen(false);
            loadInspections();
            setActiveTab("completed");
        } catch (err) {
            toast.error(err.response?.data?.error || "Inspection verification failed. Check OTP.");
        } finally {
            setSubmitting(false);
        }
    };

    // Filtered lists
    const pendingInspections = inspections.filter((i) => !i.isTransactionCompleted);
    const completedInspections = inspections.filter((i) => i.isTransactionCompleted);

    const calculatedTotalAmount =
        (parseFloat(inspectionForm.quantityReal) || 0) * (parseFloat(inspectionForm.finalRate) || 0);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                                    Quality Assurance & Field Audit
                                </span>
                                <span className="text-xs text-slate-400">On-Site Verification</span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                                Field Inspector Audit Center
                            </h1>
                            <p className="text-xs text-slate-500">
                                Verify harvested crop quantities, negotiate rates, validate cryptographic Farmer OTPs, and certify transactions.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                loadInspections();
                                toast.success("Inspections refreshed");
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                            <span>Refresh Tasks</span>
                        </button>
                    </div>

                    {/* Pending Verification Banner */}
                    {!isVerified && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-900">
                                    Inspector Credentials Pending Admin Approval
                                </h4>
                                <p className="text-xs text-amber-800 mt-0.5">
                                    Your field inspector account is currently undergoing verification by an administrator. Once verified, inspection tasks assigned by the system admin will appear here.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto gap-2 mt-6 border-b border-slate-100 pb-0.5 no-scrollbar">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === "pending"
                                    ? "border-blue-600 text-blue-800 bg-blue-50/60"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>Assigned Pending Tasks ({pendingInspections.length})</span>
                            {pendingInspections.length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("completed")}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === "completed"
                                    ? "border-blue-600 text-blue-800 bg-blue-50/60"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Completed & Certified History ({completedInspections.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Verification</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{pendingInspections.length} Tasks</h3>
                            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Physical check required</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certified Acceptances</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                {completedInspections.filter((i) => i.transactionStatus === "accept").length} Deals
                            </h3>
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">OTP validated</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <Scale className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Quantity Verified</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                {completedInspections
                                    .filter((i) => i.transactionStatus === "accept")
                                    .reduce((sum, i) => sum + (i.quantityReal || 0), 0)
                                    .toLocaleString("en-IN")}{" "}
                                Units
                            </h3>
                            <p className="text-[11px] text-purple-600 font-medium mt-0.5">Cumulative weighment</p>
                        </div>
                    </div>
                </div>

                {/* 1. PENDING ASSIGNED TASKS TAB */}
                {activeTab === "pending" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Assigned Inspection Tasks</h3>
                                <p className="text-xs text-slate-500">
                                    Visit the farmer's location, verify crop weight and quality, agree on final rate, and obtain the 6-digit OTP.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                {pendingInspections.length} Tasks Scheduled
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {pendingInspections.length > 0 ? (
                                pendingInspections.map((insp) => {
                                    const offer = insp.offerId;
                                    const req = offer?.requirementId;
                                    const farmer = offer?.farmerId;
                                    const mill = req?.millOwnerId;

                                    return (
                                        <div
                                            key={insp._id}
                                            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
                                        >
                                            <div>
                                                {/* Header */}
                                                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                                            <Wheat className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-base text-slate-900">{req?.cropId?.name || "Crop"}</h4>
                                                            <p className="text-[11px] text-slate-400">
                                                                Season: {req?.cropId?.season} • Type: {req?.cropId?.type}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                                        Pending Field Check
                                                    </span>
                                                </div>

                                                {/* Farmer & Mill Details */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                                                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                                                            <Tractor className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Farmer (Seller)</span>
                                                        </div>
                                                        <p className="font-semibold text-slate-900">{farmer?.name || "Farmer"}</p>
                                                        <p className="text-slate-500">{farmer?.phone || "No phone"}</p>
                                                        <p className="text-slate-400 text-[11px]">{farmer?.address || ""}</p>
                                                    </div>

                                                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                                                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                                                            <span>Target Mill</span>
                                                        </div>
                                                        <p className="font-semibold text-slate-900">{mill?.millName || "Mill"}</p>
                                                        <p className="text-slate-500">{mill?.millLocation || ""}</p>
                                                        <p className="text-slate-400 text-[11px]">Contact: {mill?.phone || "N/A"}</p>
                                                    </div>
                                                </div>

                                                {/* Deal Expectations */}
                                                <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                                                    <div>
                                                        <span className="text-slate-500 text-[10px] uppercase font-semibold">Offered Quantity</span>
                                                        <p className="font-bold text-slate-900 text-sm mt-0.5">
                                                            {offer?.approxQuantitySell} Units
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 text-[10px] uppercase font-semibold">Mill Target Rate</span>
                                                        <p className="font-bold text-emerald-700 text-sm mt-0.5">
                                                            ₹{req?.expectedRate} / Unit
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[11px] text-slate-400">
                                                    Assigned: {new Date(insp.createdAt).toLocaleDateString()}
                                                </span>

                                                <button
                                                    onClick={() => handleOpenCompleteModal(insp)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
                                                >
                                                    <ClipboardCheck className="w-4 h-4" />
                                                    <span>Complete Verification</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                                    <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="font-bold text-slate-700">No pending inspections assigned.</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        When administrators dispatch you to verify a farmer's crop, it will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. COMPLETED & CERTIFIED HISTORY TAB */}
                {activeTab === "completed" && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Completed Inspection Certifications</h3>
                                <p className="text-xs text-slate-500">
                                    Past field verifications, negotiated settlements, and OTP validations conducted by you.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {completedInspections.length} Total Completed
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="py-3.5 px-5">Commodity & Farmer</th>
                                        <th className="py-3.5 px-5">Mill Destination</th>
                                        <th className="py-3.5 px-5">Verified Quantity</th>
                                        <th className="py-3.5 px-5">Final Negotiated Rate</th>
                                        <th className="py-3.5 px-5">Total Settlement</th>
                                        <th className="py-3.5 px-5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {completedInspections.length > 0 ? (
                                        completedInspections.map((insp) => (
                                            <tr key={insp._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">
                                                        {insp.offerId?.requirementId?.cropId?.name || "Crop"}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Farmer: {insp.offerId?.farmerId?.name || "Farmer"}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <p className="font-bold text-slate-900">
                                                        {insp.offerId?.requirementId?.millOwnerId?.millName || "Mill"}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {insp.offerId?.requirementId?.millOwnerId?.millLocation || ""}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-5 font-bold text-slate-900">
                                                    {insp.quantityReal} Units
                                                </td>
                                                <td className="py-4 px-5 font-bold text-slate-900">
                                                    ₹{insp.finalRate} / Unit
                                                </td>
                                                <td className="py-4 px-5 font-extrabold text-emerald-700">
                                                    ₹{(insp.amount || 0).toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-4 px-5">
                                                    {insp.transactionStatus === "accept" ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            Accepted & Certified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-red-200">
                                                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                                                            Rejected
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-slate-400">
                                                No completed inspections yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* DEDICATED COMPLETE INSPECTION MODAL */}
            {modalOpen && selectedInspection && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                <Scale className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Certify On-Field Inspection</h3>
                                <p className="text-xs text-slate-500">
                                    Record actual weighment, final rate, and verify Farmer's OTP
                                </p>
                            </div>
                        </div>

                        {/* Inspection Context Card */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-5 text-xs space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Crop Commodity:</span>
                                <span className="font-bold text-slate-800">
                                    {selectedInspection.offerId?.requirementId?.cropId?.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Farmer (Seller):</span>
                                <span className="font-semibold text-slate-800">
                                    {selectedInspection.offerId?.farmerId?.name} ({selectedInspection.offerId?.farmerId?.phone})
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Procuring Mill:</span>
                                <span className="font-semibold text-slate-800">
                                    {selectedInspection.offerId?.requirementId?.millOwnerId?.millName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Offered Quantity Estimate:</span>
                                <span className="font-bold text-slate-800">
                                    {selectedInspection.offerId?.approxQuantitySell} Units
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleCompleteInspection} className="space-y-4">
                            {/* Transaction Status Choice */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                                    Inspection Verdict *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setInspectionForm({ ...inspectionForm, transactionStatus: "accept" })}
                                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                                            inspectionForm.transactionStatus === "accept"
                                                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Accept Transaction</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setInspectionForm({ ...inspectionForm, transactionStatus: "reject" })}
                                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                                            inspectionForm.transactionStatus === "reject"
                                                ? "border-red-600 bg-red-50 text-red-800"
                                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                                        }`}
                                    >
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span>Reject Transaction</span>
                                    </button>
                                </div>
                            </div>

                            {inspectionForm.transactionStatus === "accept" ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                                Actual Verified Quantity (Units) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0.1"
                                                step="any"
                                                placeholder="e.g. 50"
                                                value={inspectionForm.quantityReal}
                                                onChange={(e) =>
                                                    setInspectionForm({ ...inspectionForm, quantityReal: e.target.value })
                                                }
                                                required
                                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-semibold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                                Final Negotiated Rate (₹ / Unit) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0.1"
                                                step="any"
                                                placeholder="e.g. 2750"
                                                value={inspectionForm.finalRate}
                                                onChange={(e) =>
                                                    setInspectionForm({ ...inspectionForm, finalRate: e.target.value })
                                                }
                                                required
                                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    {/* Live Settlement Total */}
                                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                                        <span className="text-emerald-900 font-bold">Total Certified Settlement:</span>
                                        <span className="font-extrabold text-emerald-950 text-base">
                                            ₹{calculatedTotalAmount.toLocaleString("en-IN")}
                                        </span>
                                    </div>

                                    {/* CRITICAL FARMER OTP INPUT */}
                                    <div className="pt-2">
                                        <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <KeyRound className="w-4 h-4 text-emerald-600" />
                                                Farmer's 6-Digit OTP *
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-normal">
                                                Obtain physically from farmer
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="Enter 6-digit OTP"
                                            value={inspectionForm.otpFromFarmer}
                                            onChange={(e) =>
                                                setInspectionForm({
                                                    ...inspectionForm,
                                                    otpFromFarmer: e.target.value.replace(/\D/g, "")
                                                })
                                            }
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-emerald-300 rounded-xl text-center font-mono text-xl font-black tracking-widest text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600"
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span>
                                                The cryptographic OTP ensures the farmer has authorized this harvest delivery.
                                            </span>
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
                                    <p className="font-bold flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                        Rejecting this harvest transaction
                                    </p>
                                    <p>
                                        The sell offer will be marked as rejected due to quality standard failure or parameter mismatch. No payment will be generated.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                                        inspectionForm.transactionStatus === "accept"
                                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                                            : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                                    }`}
                                >
                                    {submitting
                                        ? "Certifying Transaction..."
                                        : inspectionForm.transactionStatus === "accept"
                                        ? "Verify OTP & Finalize Transaction"
                                        : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
