import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
    getAllActiveRequirements,
    createSellOffer,
    getMyOffers
} from "../services/api";
import {
    Tractor,
    Wheat,
    Building2,
    KeyRound,
    CheckCircle2,
    Clock,
    AlertCircle,
    IndianRupee,
    Layers,
    Search,
    RefreshCw,
    ShieldCheck,
    Copy,
    Check,
    Send,
    Eye,
    EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

export default function FarmerDashboard() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("marketplace");

    // Marketplace Requirements State
    const [requirements, setRequirements] = useState([]);
    const [loadingReqs, setLoadingReqs] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cropFilter, setCropFilter] = useState("all");

    // Offers & OTP Vault State
    const [offers, setOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [revealedOtps, setRevealedOtps] = useState({});

    // Make Deal Modal State
    const [dealModalOpen, setDealModalOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [quantityToSell, setQuantityToSell] = useState("");
    const [submittingOffer, setSubmittingOffer] = useState(false);

    // Newly generated OTP Celebratory Modal
    const [newOfferResult, setNewOfferResult] = useState(null);

    useEffect(() => {
        loadRequirements();
        loadMyOffers();
    }, []);

    const loadRequirements = async () => {
        setLoadingReqs(true);
        try {
            const res = await getAllActiveRequirements();
            setRequirements(res.data);
        } catch (err) {
            toast.error("Failed to load active crop requirements");
        } finally {
            setLoadingReqs(false);
        }
    };

    const loadMyOffers = async () => {
        setLoadingOffers(true);
        try {
            const res = await getMyOffers();
            setOffers(res.data);
        } catch (err) {
            toast.error("Failed to load your sell offers");
        } finally {
            setLoadingOffers(false);
        }
    };

    const handleOpenDealModal = (req) => {
        setSelectedReq(req);
        setQuantityToSell("");
        setDealModalOpen(true);
    };

    const handleSubmitOffer = async (e) => {
        e.preventDefault();
        const qty = parseFloat(quantityToSell);

        if (!qty || qty <= 0) {
            toast.error("Please enter a valid quantity greater than 0");
            return;
        }

        if (qty > selectedReq.requiredTotalQuantity) {
            toast.error(`Quantity cannot exceed remaining demand (${selectedReq.requiredTotalQuantity})`);
            return;
        }

        setSubmittingOffer(true);
        try {
            const res = await createSellOffer({
                requirementId: selectedReq._id,
                approxQuantitySell: qty
            });

            toast.success("Sell offer submitted successfully!");
            setDealModalOpen(false);
            setNewOfferResult({
                otp: res.data.otp,
                offer: res.data.offer
            });
            loadMyOffers();
            loadRequirements();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit sell offer");
        } finally {
            setSubmittingOffer(false);
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const toggleRevealOtp = (offerId) => {
        setRevealedOtps((prev) => ({
            ...prev,
            [offerId]: !prev[offerId]
        }));
    };

    // Derived Crop list for filtering
    const cropCategories = Array.from(
        new Set(requirements.map((r) => r.cropId?.name).filter(Boolean))
    );

    const filteredRequirements = requirements.filter((r) => {
        const matchesCrop = cropFilter === "all" || r.cropId?.name === cropFilter;
        const matchesSearch =
            (r.cropId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.millOwnerId?.millName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.millOwnerId?.millLocation || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCrop && matchesSearch;
    });

    const pendingOffersCount = offers.filter((o) => o.status === "pending" || o.status === "assignedToInspector").length;
    const acceptedOffers = offers.filter((o) => o.status === "accept");
    const totalEarnings = acceptedOffers.reduce((sum, o) => {
        return sum + (o.approxQuantitySell * (o.requirementId?.expectedRate || 0));
    }, 0);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                                    Farmer Selling Portal
                                </span>
                                <span className="text-xs text-slate-400">Direct Mill Connection</span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                                Farmer Crop Marketplace & OTP Vault
                            </h1>
                            <p className="text-xs text-slate-500">
                                Browse active crop requirements from verified mills, submit sell offers, and manage 6-digit OTP verification codes.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                loadRequirements();
                                loadMyOffers();
                                toast.success("Marketplace refreshed");
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                            <span>Refresh Market</span>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto gap-2 mt-6 border-b border-slate-100 pb-0.5 no-scrollbar">
                        <button
                            onClick={() => setActiveTab("marketplace")}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === "marketplace"
                                    ? "border-emerald-600 text-emerald-800 bg-emerald-50/60"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            <Wheat className="w-4 h-4" />
                            <span>Mill Demands Marketplace ({requirements.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("offers")}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === "offers"
                                    ? "border-emerald-600 text-emerald-800 bg-emerald-50/60"
                                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            <KeyRound className="w-4 h-4" />
                            <span>My Deals & OTP Vault ({offers.length})</span>
                            {pendingOffersCount > 0 && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                {/* Stat summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Wheat className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Demands</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{requirements.length} Mills Buying</h3>
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Ready for harvest sales</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Negotiations</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{pendingOffersCount} Deals</h3>
                            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Pending inspection / OTP</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Sales</p>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                {acceptedOffers.length} Verified Deals
                            </h3>
                            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Guaranteed payouts</p>
                        </div>
                    </div>
                </div>

                {/* 1. MARKETPLACE TAB */}
                {activeTab === "marketplace" && (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search crop, mill name, or district location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            {/* Crop Filters */}
                            <div className="flex overflow-x-auto gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold no-scrollbar">
                                <button
                                    onClick={() => setCropFilter("all")}
                                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                        cropFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    All Crops
                                </button>
                                {cropCategories.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCropFilter(c)}
                                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                                            cropFilter === c ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Marketplace Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredRequirements.length > 0 ? (
                                filteredRequirements.map((req) => (
                                    <div
                                        key={req._id}
                                        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between agri-card-hover"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                                        <Wheat className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-base text-slate-900">{req.cropId?.name}</h4>
                                                        <p className="text-[11px] text-slate-400">
                                                            {req.cropId?.season} • {req.cropId?.type}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                    ₹{req.expectedRate} / Unit
                                                </span>
                                            </div>

                                            {/* Mill Details */}
                                            <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                                                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>{req.millOwnerId?.millName || "Verified Mill"}</span>
                                                </div>
                                                <p className="text-slate-500 text-[11px] pl-5">
                                                    Location: {req.millOwnerId?.millLocation || "Commercial Sector"}
                                                </p>
                                                <p className="text-slate-400 text-[10px] pl-5">
                                                    Procuring Mill Owner: {req.millOwnerId?.name}
                                                </p>
                                            </div>

                                            {/* Demand Specs */}
                                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                                <div className="p-2.5 bg-slate-50/70 rounded-lg">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                                        Demand Remaining
                                                    </span>
                                                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                                                        {req.requiredTotalQuantity} Units
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-slate-50/70 rounded-lg">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                                        Min Quality Grade
                                                    </span>
                                                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                                                        {req.quality} / 10
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-3 border-t border-slate-100">
                                            <button
                                                onClick={() => handleOpenDealModal(req)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Make Sell Offer & Generate OTP</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                                    <Wheat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="font-bold text-slate-700">No active requirements matching search.</p>
                                    <p className="text-xs text-slate-500 mt-1">Try resetting the crop filter or search query.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. MY OFFERS & OTP VAULT TAB */}
                {activeTab === "offers" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Your Active Deals & Cryptographic OTP Vault</h3>
                                <p className="text-xs text-slate-500">
                                    Show your 6-digit OTP to the field inspector in-person to authorize physical collection and final payout.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                {offers.length} Total Submissions
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {offers.length > 0 ? (
                                offers.map((offer) => {
                                    const isRevealed = !!revealedOtps[offer._id];
                                    const crop = offer.requirementId?.cropId;
                                    const mill = offer.requirementId?.millOwnerId;

                                    return (
                                        <div
                                            key={offer._id}
                                            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                                        >
                                            <div>
                                                {/* Header Status */}
                                                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                                                    <div>
                                                        <h4 className="font-bold text-base text-slate-900">{crop?.name || "Crop"}</h4>
                                                        <p className="text-[11px] text-slate-500">
                                                            Mill: {mill?.millName || "Commercial Mill"} ({mill?.millLocation || "Location"})
                                                        </p>
                                                    </div>

                                                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                                                        offer.status === "accept"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : offer.status === "reject"
                                                            ? "bg-red-50 text-red-700 border border-red-200"
                                                            : offer.status === "assignedToInspector"
                                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                                    }`}>
                                                        {offer.status === "assignedToInspector" ? "Inspector Dispatched" : offer.status}
                                                    </span>
                                                </div>

                                                {/* Details */}
                                                <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-slate-50 p-3 rounded-xl">
                                                    <div>
                                                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Offered Quantity</span>
                                                        <p className="font-extrabold text-slate-900 mt-0.5">{offer.approxQuantitySell} Units</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Target Price</span>
                                                        <p className="font-extrabold text-emerald-700 mt-0.5">
                                                            ₹{offer.requirementId?.expectedRate || 0} / Unit
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* PROMINENT 6-DIGIT OTP VAULT CARD */}
                                                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                                                            <KeyRound className="w-4 h-4 text-emerald-600" />
                                                            <span>Physical Verification 6-Digit OTP</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRevealOtp(offer._id)}
                                                            className="text-slate-400 hover:text-emerald-700 text-xs flex items-center gap-1 cursor-pointer"
                                                        >
                                                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                            <span className="text-[10px]">{isRevealed ? "Hide" : "Show"}</span>
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="font-mono text-2xl font-black tracking-widest text-emerald-950 bg-white px-4 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                                                            {isRevealed ? offer.otp : "••••••"}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(offer.otp, "Verification OTP")}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy OTP</span>
                                                        </button>
                                                    </div>

                                                    <p className="text-[10px] text-emerald-800/80 mt-2 flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                                        <span>
                                                            Do NOT share online. Present this OTP only to the physically present field inspector.
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                                <span>Deal ID: {offer._id.substring(0, 8)}...</span>
                                                <span>Submitted: {new Date(offer.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                                    <KeyRound className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="font-bold text-slate-700">No active offers submitted yet.</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Browse the Mill Demands Marketplace to make deals and receive verification OTPs.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* MAKE SELL OFFER MODAL */}
            {dealModalOpen && selectedReq && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                <Tractor className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Make Sell Offer</h3>
                                <p className="text-xs text-slate-500">Submit crop quantity for mill procurement</p>
                            </div>
                        </div>

                        {/* Mill Requirements Target Info */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-4 text-xs space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Commodity:</span>
                                <span className="font-bold text-slate-800">{selectedReq.cropId?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Buying Mill:</span>
                                <span className="font-semibold text-slate-800">{selectedReq.millOwnerId?.millName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Agreed Price Benchmark:</span>
                                <span className="font-bold text-emerald-700">₹{selectedReq.expectedRate} / Unit</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Max Mill Demand Remaining:</span>
                                <span className="font-bold text-slate-800">{selectedReq.requiredTotalQuantity} Units</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitOffer} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                    Approximate Quantity to Sell (Units) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedReq.requiredTotalQuantity}
                                    step="any"
                                    placeholder={`Up to ${selectedReq.requiredTotalQuantity}`}
                                    value={quantityToSell}
                                    onChange={(e) => setQuantityToSell(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                                />
                            </div>

                            {/* Estimated Deal Value */}
                            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                                <span className="text-emerald-900 font-medium">Estimated Gross Payout:</span>
                                <span className="font-extrabold text-emerald-900 text-base">
                                    ₹{((parseFloat(quantityToSell) || 0) * (selectedReq.expectedRate || 0)).toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setDealModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingOffer || !quantityToSell}
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {submittingOffer ? "Generating OTP..." : "Submit Offer & Generate OTP"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CELEBRATORY OTP GENERATION SUCCESS MODAL */}
            {newOfferResult && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-900">Sell Offer Created Successfully!</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Your 6-digit cryptographic verification OTP has been securely generated. Keep this code safe.
                        </p>

                        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                Your Verification OTP
                            </span>
                            <div className="font-mono text-3xl font-black text-emerald-800 tracking-widest my-1">
                                {newOfferResult.otp}
                            </div>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(newOfferResult.otp, "OTP")}
                                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold mt-1 cursor-pointer"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-6 text-left">
                            <strong>Note:</strong> An administrator will assign a field inspector to inspect your crop. When the inspector visits your farm, provide this 6-digit OTP to complete verification and authorize payment.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setNewOfferResult(null);
                                setActiveTab("offers");
                            }}
                            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                            Go to My OTP Vault
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
