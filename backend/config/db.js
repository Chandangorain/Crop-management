const mongoose = require("mongoose");

const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agroconnect";
    const localUri = "mongodb://127.0.0.1:27017/agroconnect";

    try {
        await mongoose.connect(primaryUri);
        console.log(`MongoDB connected successfully to: ${primaryUri.includes("@") ? primaryUri.split("@")[1] : primaryUri}`);
    } catch (primaryError) {
        console.warn(`Primary MongoDB connection failed (${primaryError.message}). Attempting fallback to local instance...`);
        try {
            await mongoose.connect(localUri);
            console.log(`Fallback: MongoDB connected to local instance: ${localUri}`);
        } catch (fallbackError) {
            console.error("Fatal MongoDB connection error:", fallbackError.message);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
