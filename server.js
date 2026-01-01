const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes Import
const authRoutes = require("./routes/web/authRoutes");
const donationRoutes = require("./routes/web/donationRoutes");
const campaignRoutes = require("./routes/web/campaignRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");

dotenv.config();
const app = express();

// --- 1. FIXED CORS CONFIGURATION ---
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://donation-beta-one.vercel.app" // Isse apne asli frontend URL se badal dein
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl/postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Error Handling for Invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON format" });
    }
    next();
});

// --- 2. OPTIMIZED DB CONNECTION (Serverless Friendly) ---
const connectDB = async () => {
    // Agar pehle se connected hai (readyState 1), toh naya connection na banayein
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Connection ke liye zyada wait na karein
        });
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ DB Connection Error:", err.message);
        // Serverless mein error throw karna zaroori hai taaki request fail ho, "buffer" na ho
        throw new Error("Database connection failed");
    }
};

// Routes Middleware with Error Handling
const dbMiddleware = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection error" });
    }
};

app.use('/api/auth', dbMiddleware, authRoutes);
app.use('/api/donations', dbMiddleware, donationRoutes);
app.use('/api/campaigns', dbMiddleware, campaignRoutes);
app.use('/api/admin', dbMiddleware, adminRoutes);

// Health Check Route
app.get("/", (req, res) => res.send("🚀 Donation Hub API is running..."));

// Local Server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

// Export for Vercel
module.exports = app;