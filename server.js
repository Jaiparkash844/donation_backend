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

// Middleware
app.use(express.json());
// --- CORS CONFIGURATION ---
const allowedOrigins = [
    "http://localhost:5173", // Vite default port
    "http://localhost:3000", // React default port
    "https://your-frontend-project.vercel.app" // APNA VERCEL URL YAHAN DALAIN
];

app.use(cors({
    origin: function (origin, callback) {
        // Agar origin list mein hai ya origin null hai (like Postman), toh allow karein
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS Policy: This origin is not allowed access.'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Error Handling for Invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON format" });
    }
    next();
});

// MongoDB Connection (Global scope me rakha hai for Vercel optimization)
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.log("❌ DB Connection Error:", err);
    }
};

// Routes
app.use('/api/auth', async (req, res, next) => { await connectDB(); next(); }, authRoutes);
app.use('/api/donations', async (req, res, next) => { await connectDB(); next(); }, donationRoutes);
app.use('/api/campaigns', async (req, res, next) => { await connectDB(); next(); }, campaignRoutes);
app.use('/api/admin', async (req, res, next) => { await connectDB(); next(); }, adminRoutes);

// Health Check Route
app.get("/", (req, res) => res.send("Donation Hub API is running..."));

// Local Server for localhost development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

// Export for Vercel
module.exports = app;