const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    getAllUsers,
    verifyUser,
    createCrop,
    getAllCrops,
    getCropById,
    updateCrop,
    deleteCrop,
    getAdminAnalytics
} = require("../controllers/adminController");
const { cropValidation } = require("../middleware/validation");

// Analytics endpoint
router.get("/analytics", auth, roleCheck(["admin"]), getAdminAnalytics);

// User management
router.get("/users", auth, roleCheck(["admin"]), getAllUsers);
router.put("/users/:userId/verify", auth, roleCheck(["admin"]), verifyUser);

// Crop catalog CRUD
router.post("/crops", auth, roleCheck(["admin"]), cropValidation, createCrop);
router.get("/crops", getAllCrops);
router.get("/crops/:cropId", getCropById);
router.put("/crops/:cropId", auth, roleCheck(["admin"]), cropValidation, updateCrop);
router.delete("/crops/:cropId", auth, roleCheck(["admin"]), deleteCrop);

module.exports = router;
