const MillRequirement = require("../models/MillRequirement");
const SellOffer = require("../models/SellOffer");
const Inspection = require("../models/Inspection");
const User = require("../models/User");

// Create mill requirement (Verified Mill Owner only)
const createMillRequirement = async (req, res) => {
    try {
        const { cropId, quality, requiredTotalQuantity, expectedRate } = req.body;

        // Check if mill owner is verified
        const user = await User.findById(req.user.id);
        if (!user || !user.isVerified) {
            return res.status(403).json({ 
                error: "Your Mill Owner account is pending verification by an administrator. You cannot post crop requirements until approved." 
            });
        }

        const quantity = parseFloat(requiredTotalQuantity);
        const rate = parseFloat(expectedRate);
        const qual = parseFloat(quality);

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "Required total quantity must be greater than 0." });
        }
        if (isNaN(rate) || rate <= 0) {
            return res.status(400).json({ error: "Expected rate must be greater than 0." });
        }

        const requirement = new MillRequirement({
            millOwnerId: req.user.id,
            cropId,
            quality: qual,
            requiredTotalQuantity: quantity,
            expectedRate: rate,
            status: "active"
        });

        await requirement.save();
        await requirement.populate("cropId", "name season type");
        await requirement.populate("millOwnerId", "name email phone address millName millLocation licenseNo");

        res.status(201).json({ message: "Crop requirement created successfully", requirement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all requirements of the logged-in mill owner
const getMyRequirements = async (req, res) => {
    try {
        const requirements = await MillRequirement.find({ millOwnerId: req.user.id })
            .populate("cropId", "name season type")
            .populate("millOwnerId", "name email phone address millName millLocation licenseNo")
            .sort({ createdAt: -1 });

        // Add offers count for each requirement
        const requirementsWithOffers = await Promise.all(
            requirements.map(async (reqDoc) => {
                const offersCount = await SellOffer.countDocuments({ requirementId: reqDoc._id });
                const acceptedOffersCount = await SellOffer.countDocuments({ requirementId: reqDoc._id, status: "accept" });
                const doc = reqDoc.toObject();
                doc.totalOffers = offersCount;
                doc.acceptedOffers = acceptedOffersCount;
                return doc;
            })
        );

        res.json(requirementsWithOffers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all active requirements (for farmers and general marketplace)
const getAllActiveRequirements = async (req, res) => {
    try {
        const requirements = await MillRequirement.find({ 
            status: "active", 
            requiredTotalQuantity: { $gt: 0 } 
        })
            .populate("cropId", "name season type")
            .populate("millOwnerId", "name email phone address millName millLocation")
            .sort({ createdAt: -1 });

        res.json(requirements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update requirement status (active / closed)
const updateRequirementStatus = async (req, res) => {
    try {
        const { requirementId } = req.params;
        const { status } = req.body;

        if (!["active", "closed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be 'active' or 'closed'." });
        }

        const requirement = await MillRequirement.findOne({
            _id: requirementId,
            millOwnerId: req.user.id
        });

        if (!requirement) {
            return res.status(404).json({ error: "Requirement not found or you are not authorized to modify it." });
        }

        requirement.status = status;
        await requirement.save();
        await requirement.populate("cropId", "name season type");
        await requirement.populate("millOwnerId", "name email phone address millName millLocation");

        res.json({ message: "Requirement status updated successfully", requirement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get inspection results for requirements created by this mill owner
const getMillOwnerInspections = async (req, res) => {
    try {
        // Find all requirements owned by this mill owner
        const myRequirements = await MillRequirement.find({ millOwnerId: req.user.id }).select("_id");
        const reqIds = myRequirements.map(r => r._id);

        // Find all sell offers for these requirements
        const offers = await SellOffer.find({ requirementId: { $in: reqIds } }).select("_id");
        const offerIds = offers.map(o => o._id);

        // Find all inspections for these offers
        const inspections = await Inspection.find({ offerId: { $in: offerIds } })
            .populate("inspectorId", "name email phone")
            .populate({
                path: "offerId",
                select: "-otp", // Do not leak OTP
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
            })
            .sort({ updatedAt: -1 });

        res.json(inspections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createMillRequirement,
    getMyRequirements,
    getAllActiveRequirements,
    updateRequirementStatus,
    getMillOwnerInspections
};
