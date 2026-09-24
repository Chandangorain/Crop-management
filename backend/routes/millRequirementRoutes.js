const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
    createMillRequirement,
    getMyRequirements,
    getAllActiveRequirements,
    updateRequirementStatus,
    getMillOwnerInspections
} = require("../controllers/millOwnerController");
const { requirementValidation } = require("../middleware/validation");

// Create mill requirement (Verified Mill Owner only)
router.post("/create", auth, roleCheck(["mill_owner"]), requirementValidation, createMillRequirement);

// Get all requirements of logged in mill owner
router.get("/my-requirements", auth, roleCheck(["mill_owner"]), getMyRequirements);

// Get all active requirements for marketplace
router.get("/active-requirements", auth, getAllActiveRequirements);

// Get all inspections related to this mill owner's requirements
router.get("/my-inspections", auth, roleCheck(["mill_owner"]), getMillOwnerInspections);

// Update requirement status
router.put("/:requirementId/status", auth, roleCheck(["mill_owner"]), updateRequirementStatus);

module.exports = router;
