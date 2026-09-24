const crypto = require("crypto");
const SellOffer = require("../models/SellOffer");
const MillRequirement = require("../models/MillRequirement");

// Cryptographically secure 6-digit OTP generator
const generateSecureOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

// Create sell offer (Farmer only)
const createSellOffer = async (req, res) => {
    try {
        const { requirementId, approxQuantitySell } = req.body;

        const quantity = parseFloat(approxQuantitySell);
        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "Approximate quantity to sell must be a positive number." });
        }

        const requirement = await MillRequirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({ error: "Target mill requirement not found." });
        }

        if (requirement.status === "closed") {
            return res.status(400).json({ error: "This mill requirement is closed and no longer accepting offers." });
        }

        if (quantity > requirement.requiredTotalQuantity) {
            return res.status(400).json({ 
                error: `Offer quantity (${quantity}) exceeds remaining requirement quantity (${requirement.requiredTotalQuantity}).` 
            });
        }

        // Generate cryptographically secure 6-digit OTP
        const otp = generateSecureOTP();

        const offer = new SellOffer({
            requirementId,
            farmerId: req.user.id,
            approxQuantitySell: quantity,
            otp
        });

        await offer.save();
        await offer.populate([
            {
                path: "requirementId",
                populate: [
                    { path: "cropId", select: "name season type" },
                    { path: "millOwnerId", select: "name email phone address millName millLocation" }
                ]
            },
            { path: "farmerId", select: "name email phone address" }
        ]);

        res.status(201).json({
            message: "Sell offer created successfully. Please keep your 6-digit OTP safe for inspector verification.",
            offer,
            otp
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all offers of the logged-in farmer (farmer can see their own OTP)
const getMyOffers = async (req, res) => {
    try {
        const offers = await SellOffer.find({ farmerId: req.user.id })
            .populate({
                path: "requirementId",
                populate: [
                    { path: "cropId", select: "name season type" },
                    { path: "millOwnerId", select: "name email phone address millName millLocation" }
                ]
            })
            .populate("farmerId", "name email phone address")
            .sort({ createdAt: -1 });

        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all pending offers (for Admin to assign inspectors - OTP excluded for security)
const getAllPendingOffers = async (req, res) => {
    try {
        const offers = await SellOffer.find({ status: "pending" })
            .select("-otp") // Never leak OTP
            .populate({
                path: "requirementId",
                populate: [
                    { path: "cropId", select: "name season type" },
                    { path: "millOwnerId", select: "name email phone address millName millLocation" }
                ]
            })
            .populate("farmerId", "name email phone address")
            .sort({ createdAt: -1 });

        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get offer details
const getOfferDetails = async (req, res) => {
    try {
        const { offerId } = req.params;

        let query = SellOffer.findById(offerId)
            .populate({
                path: "requirementId",
                populate: [
                    { path: "cropId", select: "name season type" },
                    { path: "millOwnerId", select: "name email phone address millName millLocation" }
                ]
            })
            .populate("farmerId", "name email phone address");

        // Only the owner farmer can see the OTP
        const offer = await query;
        if (!offer) {
            return res.status(404).json({ error: "Sell offer not found." });
        }

        const isOwner = req.user && offer.farmerId && offer.farmerId._id.toString() === req.user.id;
        const offerObj = offer.toObject();
        if (!isOwner) {
            delete offerObj.otp;
        }

        res.json(offerObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSellOffer,
    getMyOffers,
    getAllPendingOffers,
    getOfferDetails
};
