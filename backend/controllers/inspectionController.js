const SellOffer = require("../models/SellOffer");
const Inspection = require("../models/Inspection");
const User = require("../models/User");
const MillRequirement = require("../models/MillRequirement");

// Assign inspection to a verified inspector (Admin only)
const assignInspection = async (req, res) => {
    try {
        const { offerId, inspectorId } = req.body;

        if (!offerId || !inspectorId) {
            return res.status(400).json({ error: "Please provide both offerId and inspectorId." });
        }

        // Validate offer
        const offer = await SellOffer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ error: "Sell offer not found." });
        }

        if (offer.status !== "pending") {
            return res.status(400).json({ 
                error: `Cannot assign inspection. Offer status is currently '${offer.status}' (must be 'pending').` 
            });
        }

        // Check if an inspection record already exists for this offer
        const existingInspection = await Inspection.findOne({ offerId });
        if (existingInspection) {
            return res.status(400).json({ error: "An inspection is already assigned for this sell offer." });
        }

        // Validate inspector
        const inspector = await User.findById(inspectorId);
        if (!inspector) {
            return res.status(404).json({ error: "Selected inspector not found." });
        }

        if (inspector.role !== "inspector") {
            return res.status(400).json({ error: "The assigned user does not have the 'inspector' role." });
        }

        if (!inspector.isVerified) {
            return res.status(400).json({ error: "Cannot assign inspection to an unverified inspector. Please verify the inspector first." });
        }

        // Update offer status
        offer.status = "assignedToInspector";
        await offer.save();

        // Create inspection record
        const inspection = new Inspection({
            inspectorId,
            offerId
        });

        await inspection.save();
        await inspection.populate("inspectorId", "name email phone address");
        await inspection.populate({
            path: "offerId",
            select: "-otp",
            populate: [
                {
                    path: "requirementId",
                    populate: [
                        { path: "cropId", select: "name season type" },
                        { path: "millOwnerId", select: "name email phone millName millLocation" }
                    ]
                },
                { path: "farmerId", select: "name email phone address" }
            ]
        });

        res.status(201).json({ 
            message: `Inspection successfully assigned to ${inspector.name}.`, 
            inspection 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all inspections (Admin only)
const getAllInspections = async (req, res) => {
    try {
        const inspections = await Inspection.find()
            .populate("inspectorId", "name email phone address")
            .populate({
                path: "offerId",
                select: "-otp", // Do not leak farmer OTP
                populate: [
                    {
                        path: "requirementId",
                        populate: [
                            { path: "cropId", select: "name season type" },
                            { path: "millOwnerId", select: "name email phone address millName millLocation" }
                        ]
                    },
                    { path: "farmerId", select: "name email phone address" }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(inspections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get inspection details
const getInspectionDetails = async (req, res) => {
    try {
        const { inspectionId } = req.params;

        const inspection = await Inspection.findById(inspectionId)
            .populate("inspectorId", "name email phone address")
            .populate({
                path: "offerId",
                select: "-otp", // OTP is always kept secret from inspection endpoints
                populate: [
                    {
                        path: "requirementId",
                        populate: [
                            { path: "cropId", select: "name season type" },
                            { path: "millOwnerId", select: "name email phone address millName millLocation" }
                        ]
                    },
                    { path: "farmerId", select: "name email phone address" }
                ]
            });

        if (!inspection) {
            return res.status(404).json({ error: "Inspection record not found." });
        }

        res.json(inspection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get my assigned inspections (Inspector only)
const getMyInspections = async (req, res) => {
    try {
        const inspections = await Inspection.find({ inspectorId: req.user.id })
            .populate("inspectorId", "name email phone address")
            .populate({
                path: "offerId",
                select: "-otp", // Do NOT send OTP to inspector before physical on-site check
                populate: [
                    {
                        path: "requirementId",
                        populate: [
                            { path: "cropId", select: "name season type" },
                            { path: "millOwnerId", select: "name email phone address millName millLocation" }
                        ]
                    },
                    { path: "farmerId", select: "name email phone address" }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(inspections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complete inspection with OTP verification (Inspector only)
const completeInspection = async (req, res) => {
    try {
        const { inspectionId } = req.params;
        const { quantityReal, finalRate, otpFromFarmer, transactionStatus } = req.body;

        if (!transactionStatus || !["accept", "reject"].includes(transactionStatus)) {
            return res.status(400).json({ error: "Invalid transaction status. Must be 'accept' or 'reject'." });
        }

        // Find inspection
        const inspection = await Inspection.findById(inspectionId);
        if (!inspection) {
            return res.status(404).json({ error: "Inspection not found." });
        }

        // Authorization check: only assigned inspector can complete
        if (inspection.inspectorId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Unauthorized. You are not the assigned inspector for this task." });
        }

        // Prevent double completion
        if (inspection.isTransactionCompleted) {
            return res.status(400).json({ error: "This inspection has already been completed and finalized." });
        }

        // Find associated offer
        const offer = await SellOffer.findById(inspection.offerId);
        if (!offer) {
            return res.status(404).json({ error: "Associated sell offer not found." });
        }

        if (transactionStatus === "accept") {
            const realQty = parseFloat(quantityReal);
            const rate = parseFloat(finalRate);

            if (isNaN(realQty) || realQty <= 0) {
                return res.status(400).json({ error: "Verified actual quantity must be greater than 0." });
            }

            if (isNaN(rate) || rate <= 0) {
                return res.status(400).json({ error: "Final rate must be greater than 0." });
            }

            if (!otpFromFarmer || otpFromFarmer.toString().trim() !== offer.otp.toString().trim()) {
                return res.status(400).json({ 
                    error: "Invalid Farmer OTP. Physical inspection verification failed." 
                });
            }

            // Update inspection record
            inspection.quantityReal = realQty;
            inspection.finalRate = rate;
            inspection.amount = Math.round(realQty * rate * 100) / 100;
            inspection.transactionStatus = "accept";
            inspection.isTransactionCompleted = true;
            await inspection.save();

            // Update offer status
            offer.status = "accept";
            await offer.save();

            // Deduct quantity from mill requirement
            const requirement = await MillRequirement.findById(offer.requirementId);
            if (requirement) {
                requirement.requiredTotalQuantity = Math.max(0, requirement.requiredTotalQuantity - realQty);
                if (requirement.requiredTotalQuantity <= 0) {
                    requirement.status = "closed";
                }
                await requirement.save();
            }
        } else {
            // Transaction Rejected
            inspection.quantityReal = 0;
            inspection.finalRate = 0;
            inspection.amount = 0;
            inspection.transactionStatus = "reject";
            inspection.isTransactionCompleted = true;
            await inspection.save();

            offer.status = "reject";
            await offer.save();
        }

        // Populate response data
        await inspection.populate("inspectorId", "name email phone address");
        await inspection.populate({
            path: "offerId",
            select: "-otp",
            populate: [
                {
                    path: "requirementId",
                    populate: [
                        { path: "cropId", select: "name season type" },
                        { path: "millOwnerId", select: "name email phone address millName millLocation" }
                    ]
                },
                { path: "farmerId", select: "name email phone address" }
            ]
        });

        res.json({
            message: `Inspection successfully completed with status: ${transactionStatus.toUpperCase()}`,
            inspection
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    assignInspection,
    getAllInspections,
    getInspectionDetails,
    getMyInspections,
    completeInspection
};
