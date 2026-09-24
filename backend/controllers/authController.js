const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register user
const register = async (req, res) => {
    try {
        const { name, email, phone, address, password, role, licenseNo, millName, millLocation } = req.body;

        // Check if email already registered
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "An account with this email address already exists." });
        }

        // Check if phone already registered
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ error: "An account with this phone number already exists." });
        }

        // Validate mill owner specific fields
        if (role === "mill_owner") {
            if (!licenseNo || !millName || !millLocation) {
                return res.status(400).json({ error: "Mill owners must provide license number, mill name, and mill location." });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Farmers are auto-verified; mill_owners and inspectors require admin verification
        const isVerified = role === "farmer";

        const userObj = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            address: address.trim(),
            password: hashedPassword,
            role,
            isVerified
        };

        if (role === "mill_owner") {
            userObj.licenseNo = licenseNo.trim();
            userObj.millName = millName.trim();
            userObj.millLocation = millLocation.trim();
        }

        const user = new User(userObj);
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                isVerified: user.isVerified,
                millName: user.millName,
                licenseNo: user.licenseNo,
                millLocation: user.millLocation
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field";
            return res.status(400).json({ error: `An account with this ${field} already exists.` });
        }
        res.status(500).json({ error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                isVerified: user.isVerified,
                millName: user.millName,
                licenseNo: user.licenseNo,
                millLocation: user.millLocation
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user profile
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, millName, millLocation, licenseNo } = req.body;
        const updates = {};

        if (name) updates.name = name.trim();
        if (phone) updates.phone = phone.trim();
        if (address) updates.address = address.trim();
        if (req.user.role === "mill_owner") {
            if (millName) updates.millName = millName.trim();
            if (millLocation) updates.millLocation = millLocation.trim();
            if (licenseNo) updates.licenseNo = licenseNo.trim();
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, getMe, updateProfile };
