import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { assignInspection, getAllUsers, getOfferDetails } from "../services/api";
import Navbar from "../components/Navbar";
import { 
    ClipboardCheck, 
    ArrowLeft, 
    Tractor, 
    Building2, 
    Wheat, 
    ShieldCheck, 
    AlertCircle,
    UserCheck
} from "lucide-react";
import toast from "react-hot-toast";

export default function AssignInspectorPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { offerId } = useParams();

    const [offer, setOffer] = useState(null);
    const [inspectors, setInspectors] = useState([]);
    const [selectedInspector, setSelectedInspector] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersRes, offerRes] = await Promise.all([
                    getAllUsers({ role: "inspector" }),
                    getOfferDetails(offerId)
                ]);

                const verifiedList = usersRes.data.filter(
                    (u) => u.role === "inspector" && u.isVerified
                );
                setInspectors(verifiedList);
                setOffer(offerRes.data);
            } catch (err) {
                toast.error("Failed to load offer or inspectors");
            } finally {
                setInitialLoading(false);
            }
        };

        loadData();
    }, [offerId]);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedInspector) {
            toast.error("Please select a certified inspector");
            return;
        }

        setLoading(true);
        try {
            await assignInspection({
                offerId,
                inspectorId: selectedInspector
            });

            toast.success("Inspector assigned and dispatched successfully!");
            navigate("/admin");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to assign inspector");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm font-semibold text-slate-500">Loading offer details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Admin Command Center</span>
                </Link>

                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Assign Field Inspector</h2>
                            <p className="text-xs text-slate-500">
                                Authorize on-field verification for pending crop harvest offer
                            </p>
                        </div>
                    </div>

                    {offer && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6 text-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Crop Commodity:</span>
                                <span className="font-bold text-emerald-700">
                                    {offer.requirementId?.cropId?.name || "Crop"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Farmer (Seller):</span>
                                <span className="font-semibold text-slate-800">
                                    {offer.farmerId?.name} ({offer.farmerId?.phone})
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Location:</span>
                                <span className="text-slate-700">{offer.farmerId?.address}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Offered Quantity:</span>
                                <span className="font-bold text-slate-800">{offer.approxQuantitySell} Units</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Procuring Mill:</span>
                                <span className="text-slate-700">{offer.requirementId?.millOwnerId?.millName}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleAssign} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                Select Certified Inspector *
                            </label>
                            <select
                                value={selectedInspector}
                                onChange={(e) => setSelectedInspector(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                            >
                                <option value="">-- Choose verified inspector --</option>
                                {inspectors.map((insp) => (
                                    <option key={insp._id} value={insp._id}>
                                        {insp.name} ({insp.phone} - {insp.address})
                                    </option>
                                ))}
                            </select>
                            {inspectors.length === 0 && (
                                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    No verified inspectors currently available in the database.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate("/admin")}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !selectedInspector}
                                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {loading ? "Dispatching..." : "Confirm & Assign"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}