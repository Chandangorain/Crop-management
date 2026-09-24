const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    createSellOffer,
    getMyOffers,
    getAllPendingOffers,
    getOfferDetails
} = require("../controllers/farmerController");
const { sellOfferValidation } = require("../middleware/validation");

// Create sell offer (Farmer only)
router.post("/create", auth, roleCheck(["farmer"]), sellOfferValidation, createSellOffer);

// Get all offers of logged in farmer
router.get("/my-offers", auth, roleCheck(["farmer"]), getMyOffers);

// Get all pending offers (Admin only)
router.get("/all-pending", auth, roleCheck(["admin"]), getAllPendingOffers);

// Get offer details
router.get("/:offerId", auth, getOfferDetails);

module.exports = router;
