const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const { registerValidation, loginValidation } = require("../middleware/validation");

// Register user
router.post("/register", registerValidation, register);

// Login user
router.post("/login", loginValidation, login);

// Get current user profile
router.get("/me", auth, getMe);

// Update user profile
router.put("/profile", auth, updateProfile);

module.exports = router;
