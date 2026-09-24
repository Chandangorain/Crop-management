const { body, param, validationResult } = require("express-validator");

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({
            error: errorMessages[0],
            errors: errors.array()
        });
    }
    next();
};

// Registration validation rules
const registerValidation = [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
    body("phone").trim().notEmpty().withMessage("Phone number is required").matches(/^[0-9+ -]{7,15}$/).withMessage("Please enter a valid phone number"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["farmer", "mill_owner", "inspector"]).withMessage("Invalid role selected"),
    body("licenseNo").if(body("role").equals("mill_owner")).notEmpty().withMessage("License number is required for mill owners"),
    body("millName").if(body("role").equals("mill_owner")).notEmpty().withMessage("Mill name is required for mill owners"),
    body("millLocation").if(body("role").equals("mill_owner")).notEmpty().withMessage("Mill location is required for mill owners"),
    validate
];

// Login validation rules
const loginValidation = [
    body("email").trim().isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate
];

// Crop validation rules
const cropValidation = [
    body("name").trim().notEmpty().withMessage("Crop name is required"),
    body("season").trim().notEmpty().withMessage("Season is required"),
    body("type").trim().notEmpty().withMessage("Crop type is required"),
    validate
];

// Mill Requirement validation rules
const requirementValidation = [
    body("cropId").isMongoId().withMessage("Valid crop ID is required"),
    body("quality").isFloat({ min: 1, max: 10 }).withMessage("Quality rating must be between 1 and 10"),
    body("requiredTotalQuantity").isFloat({ gt: 0 }).withMessage("Total quantity required must be greater than 0"),
    body("expectedRate").isFloat({ gt: 0 }).withMessage("Expected rate must be greater than 0"),
    validate
];

// Sell Offer validation rules
const sellOfferValidation = [
    body("requirementId").isMongoId().withMessage("Valid requirement ID is required"),
    body("approxQuantitySell").isFloat({ gt: 0 }).withMessage("Approximate quantity to sell must be greater than 0"),
    validate
];

// Complete Inspection validation rules
const completeInspectionValidation = [
    body("transactionStatus").isIn(["accept", "reject"]).withMessage("Transaction status must be 'accept' or 'reject'"),
    body("quantityReal").if(body("transactionStatus").equals("accept")).isFloat({ gt: 0 }).withMessage("Actual verified quantity must be greater than 0"),
    body("finalRate").if(body("transactionStatus").equals("accept")).isFloat({ gt: 0 }).withMessage("Final agreed rate must be greater than 0"),
    body("otpFromFarmer").if(body("transactionStatus").equals("accept")).isLength({ min: 6, max: 6 }).withMessage("6-digit Farmer OTP is required for acceptance"),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    cropValidation,
    requirementValidation,
    sellOfferValidation,
    completeInspectionValidation
};
