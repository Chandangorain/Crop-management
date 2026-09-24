const User = require("../models/User");
const Crop = require("../models/Crop");
const bcrypt = require("bcryptjs");

const initializeAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@t.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin@123";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [{ email: adminEmail }, { email: "admin@t.com" }, { email: "adminemail@here.com" }] 
        });
        
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const admin = new User({
                name: "System Administrator",
                email: adminEmail,
                phone: "9999999999",
                address: "AgroConnect Headquarters, Central Agri Hub",
                password: hashedPassword,
                role: "admin",
                isVerified: true
            });

            await admin.save();
            console.log(`Admin user (${adminEmail}) created successfully!`);
        } else {
            console.log(`Admin user already exists (${existingAdmin.email})`);
        }

        // Seed initial crops if none exist
        const cropCount = await Crop.countDocuments();
        if (cropCount === 0) {
            const defaultCrops = [
                { name: "Wheat (Sharbati)", season: "Rabi", type: "Grain" },
                { name: "Basmati Rice", season: "Kharif", type: "Paddy" },
                { name: "Yellow Corn (Maize)", season: "Kharif", type: "Grain" },
                { name: "Organic Soybean", season: "Kharif", type: "Oilseed" },
                { name: "Mustard Seed", season: "Rabi", type: "Oilseed" },
                { name: "Cotton (Bt Long Staple)", season: "Kharif", type: "Fiber" }
            ];
            await Crop.insertMany(defaultCrops);
            console.log("Default crop catalog seeded successfully!");
        }
    } catch (error) {
        console.error("Error initializing admin or seed data:", error.message);
    }
};

module.exports = initializeAdmin;
