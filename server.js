const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Route Imports
const authRoutes = require("./routes/web/authRoutes");
const donationRoutes = require("./routes/web/donationRoutes");
const campaignRoutes = require("./routes/web/campaignRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");

dotenv.config();
const app = express();

// --- CORS ---
app.use(cors({
    origin: ["http://localhost:5173", "https://donation-beta-one.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- DIRECT DATABASE CONNECTION ---
// Vercel par isse global variable mein rakhna behtar hai taaki bar bar naya connection na bane
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://jaip4182_db_user:513HoaqM4rvk0ccl@cluster0.loia550.mongodb.net/donation";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);

app.get("/", (req, res) => res.send("🚀 Donation Hub API is Live"));

// --- SERVER LISTEN ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}

module.exports = app;