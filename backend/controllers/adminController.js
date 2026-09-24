const User = require("../models/User");
const Crop = require("../models/Crop");
const MillRequirement = require("../models/MillRequirement");
const SellOffer = require("../models/SellOffer");
const Inspection = require("../models/Inspection");

// Get all users with optional role & search filtering (admin only)
const getAllUsers = async (req, res) => {
    try {
        const { role, isVerified, search } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (isVerified !== undefined) filter.isVerified = isVerified === "true";
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify/Unverify user (admin only)
const verifyUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isVerified } = req.body;

        if (typeof isVerified !== "boolean") {
            return res.status(400).json({ error: "isVerified boolean status is required." });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isVerified },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({ message: `User ${isVerified ? "verified" : "unverified"} successfully`, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create crop (admin only)
const createCrop = async (req, res) => {
    try {
        const { name, season, type } = req.body;

        const crop = new Crop({ 
            name: name.trim(), 
            season: season.trim(), 
            type: type.trim() 
        });
        await crop.save();

        res.status(201).json({ message: "Crop created successfully", crop });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all crops
const getAllCrops = async (req, res) => {
    try {
        const crops = await Crop.find().sort({ name: 1 });
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single crop by ID
const getCropById = async (req, res) => {
    try {
        const { cropId } = req.params;
        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ error: "Crop not found." });
        }
        res.json(crop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update crop (admin only - CRUD requirement)
const updateCrop = async (req, res) => {
    try {
        const { cropId } = req.params;
        const { name, season, type } = req.body;

        const updates = {};
        if (name) updates.name = name.trim();
        if (season) updates.season = season.trim();
        if (type) updates.type = type.trim();

        const crop = await Crop.findByIdAndUpdate(
            cropId,
            updates,
            { new: true, runValidators: true }
        );

        if (!crop) {
            return res.status(404).json({ error: "Crop not found." });
        }

        res.json({ message: "Crop updated successfully", crop });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete crop (admin only)
const deleteCrop = async (req, res) => {
    try {
        const { cropId } = req.params;
        const crop = await Crop.findByIdAndDelete(cropId);
        if (!crop) {
            return res.status(404).json({ error: "Crop not found." });
        }
        res.json({ message: "Crop deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Aggregated analytics endpoint for modern Admin dashboard
const getAdminAnalytics = async (req, res) => {
    try {
        const [
            totalUsers,
            farmerCount,
            millOwnerCount,
            inspectorCount,
            unverifiedCount,
            totalRequirements,
            activeRequirements,
            closedRequirements,
            totalOffers,
            pendingOffers,
            assignedOffers,
            acceptedOffers,
            rejectedOffers,
            totalCrops,
            inspections
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "farmer" }),
            User.countDocuments({ role: "mill_owner" }),
            User.countDocuments({ role: "inspector" }),
            User.countDocuments({ isVerified: false, role: { $in: ["mill_owner", "inspector"] } }),
            MillRequirement.countDocuments(),
            MillRequirement.countDocuments({ status: "active" }),
            MillRequirement.countDocuments({ status: "closed" }),
            SellOffer.countDocuments(),
            SellOffer.countDocuments({ status: "pending" }),
            SellOffer.countDocuments({ status: "assignedToInspector" }),
            SellOffer.countDocuments({ status: "accept" }),
            SellOffer.countDocuments({ status: "reject" }),
            Crop.countDocuments(),
            Inspection.find({ isTransactionCompleted: true, transactionStatus: "accept" })
        ]);

        const totalVolumeKg = inspections.reduce((sum, item) => sum + (item.quantityReal || 0), 0);
        const totalAmountINR = inspections.reduce((sum, item) => sum + (item.amount || 0), 0);

        // Group requirements by crop for visual chart
        const cropRequirements = await MillRequirement.aggregate([
            {
                $group: {
                    _id: "$cropId",
                    count: { $sum: 1 },
                    totalQuantity: { $sum: "$requiredTotalQuantity" }
                }
            },
            {
                $lookup: {
                    from: "crops",
                    localField: "_id",
                    foreignField: "_id",
                    as: "crop"
                }
            },
            {
                $unwind: { path: "$crop", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    cropName: { $ifNull: ["$crop.name", "Unknown"] },
                    count: 1,
                    totalQuantity: 1
                }
            }
        ]);

        res.json({
            users: {
                total: totalUsers,
                farmers: farmerCount,
                millOwners: millOwnerCount,
                inspectors: inspectorCount,
                pendingVerification: unverifiedCount
            },
            requirements: {
                total: totalRequirements,
                active: activeRequirements,
                closed: closedRequirements
            },
            sellOffers: {
                total: totalOffers,
                pending: pendingOffers,
                assigned: assignedOffers,
                accepted: acceptedOffers,
                rejected: rejectedOffers
            },
            financials: {
                totalVolumeKg,
                totalAmountINR,
                completedTransactions: inspections.length
            },
            totalCrops,
            chartData: {
                cropRequirements,
                statusBreakdown: [
                    { name: "Pending", value: pendingOffers, color: "#f59e0b" },
                    { name: "Assigned", value: assignedOffers, color: "#3b82f6" },
                    { name: "Accepted", value: acceptedOffers, color: "#10b981" },
                    { name: "Rejected", value: rejectedOffers, color: "#ef4444" }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    verifyUser,
    createCrop,
    getAllCrops,
    getCropById,
    updateCrop,
    deleteCrop,
    getAdminAnalytics
};
