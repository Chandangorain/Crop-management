const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    assignInspection,
    getAllInspections,
    getInspectionDetails,
    getMyInspections,
    completeInspection
} = require("../controllers/inspectionController");
const { completeInspectionValidation } = require("../middleware/validation");

// Assign inspection (Admin only)
router.post("/assign", auth, roleCheck(["admin"]), assignInspection);

// Get all inspections (Admin only)
router.get("/all", auth, roleCheck(["admin"]), getAllInspections);

// Get my inspections (Inspector only)
router.get("/my-inspections", auth, roleCheck(["inspector"]), getMyInspections);

// Get inspection details
router.get("/:inspectionId", auth, getInspectionDetails);

// Complete inspection (Inspector only)
router.put("/:inspectionId/complete", auth, roleCheck(["inspector"]), completeInspectionValidation, completeInspection);

module.exports = router;
