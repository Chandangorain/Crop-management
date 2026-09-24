require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const initializeAdmin = require("./config/initializeAdmin");

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const millRequirementRoutes = require("./routes/millRequirementRoutes");
const sellOfferRoutes = require("./routes/sellOfferRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");

const app = express();

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body Parser Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting for Authentication Endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication attempts. Please try again after 15 minutes." }
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mill-requirements", millRequirementRoutes);
app.use("/api/sell-offers", sellOfferRoutes);
app.use("/api/inspections", inspectionRoutes);

// Health check and root route
app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.json({ message: "AgroConnect API Gateway is operational", version: "1.0.0" });
});

// 404 Route Handler
app.use((req, res, next) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal server error occurred."
    });
});

const PORT = process.env.PORT || 5000;

// Bootstrap server with database connection
const startServer = async () => {
    try {
        await connectDB();
        await initializeAdmin();

        app.listen(PORT, () => {
            console.log(`===============================================`);
            console.log(` AgroConnect Backend running on Port ${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(` URL: http://localhost:${PORT}`);
            console.log(`===============================================`);
        });
    } catch (err) {
        console.error("Fatal startup error:", err.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;